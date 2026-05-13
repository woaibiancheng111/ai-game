import http from 'node:http'
import process from 'node:process'

const port = Number(process.env.AI_PROXY_PORT || 8787)
const providerUrl = process.env.AI_PROVIDER_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const apiKey = process.env.AI_PROVIDER_API_KEY || process.env.DASHSCOPE_API_KEY || ''
const defaultModel = process.env.AI_PROXY_MODEL || 'qwen-plus'
const maxBodyBytes = Number(process.env.AI_PROXY_MAX_BODY_BYTES || 1024 * 1024)

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    writeCors(response, 204)
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/health') {
    writeJson(response, 200, {
      ok: true,
      providerConfigured: Boolean(apiKey),
      providerUrl
    })
    return
  }

  if (request.method !== 'POST' || request.url !== '/chat') {
    writeJson(response, 404, { ok: false, errorCode: 'not_found', message: 'Use POST /chat' })
    return
  }

  if (!apiKey) {
    writeJson(response, 503, {
      ok: false,
      errorCode: 'provider_key_missing',
      message: 'AI_PROVIDER_API_KEY or DASHSCOPE_API_KEY is not configured on the proxy server.'
    })
    return
  }

  try {
    const payload = await readJsonBody(request)
    const upstreamPayload = buildUpstreamPayload(payload)

    const upstream = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(upstreamPayload)
    })

    if (!upstream.ok) {
      const errorText = await upstream.text()
      writeJson(response, upstream.status, {
        ok: false,
        errorCode: `provider_http_${upstream.status}`,
        message: errorText || `Provider request failed: ${upstream.status}`
      })
      return
    }

    if (upstreamPayload.stream) {
      await pipeStreamResponse(upstream, response)
      return
    }

    const data = await upstream.json()
    writeJson(response, 200, {
      ok: true,
      text: extractChatContent(data),
      raw: data
    })
  } catch (error) {
    writeJson(response, 500, {
      ok: false,
      errorCode: 'proxy_exception',
      message: error instanceof Error ? error.message : 'AI proxy failed.'
    })
  }
})

server.listen(port, () => {
  console.log(`AI proxy listening at http://localhost:${port}/chat`)
  console.log(`Health check: http://localhost:${port}/health`)
})

function buildUpstreamPayload(payload) {
  const messages = Array.isArray(payload?.messages) ? payload.messages : []
  const context = payload?.context
  const contextMessage = context
    ? [{
        role: 'system',
        content: `NPC context JSON for this turn:\n${JSON.stringify(context)}`
      }]
    : []

  return {
    model: typeof payload?.model === 'string' && payload.model.trim() ? payload.model.trim() : defaultModel,
    messages: [...contextMessage, ...messages].map(normalizeMessage).filter(Boolean),
    temperature: typeof payload?.temperature === 'number' ? payload.temperature : 0.7,
    max_tokens: typeof payload?.max_tokens === 'number' ? payload.max_tokens : 2000,
    stream: Boolean(payload?.stream)
  }
}

function normalizeMessage(message) {
  if (!message || typeof message !== 'object') {
    return null
  }

  const role = typeof message.role === 'string' ? message.role : 'user'
  const content = typeof message.content === 'string' ? message.content : ''
  if (!content.trim()) {
    return null
  }

  return { role, content }
}

async function readJsonBody(request) {
  const chunks = []
  let totalBytes = 0

  for await (const chunk of request) {
    totalBytes += chunk.length
    if (totalBytes > maxBodyBytes) {
      throw new Error('Request body is too large.')
    }
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

async function pipeStreamResponse(upstream, response) {
  writeCors(response, 200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  })

  if (!upstream.body) {
    response.write('data: [DONE]\n\n')
    response.end()
    return
  }

  const reader = upstream.body.getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }
    response.write(Buffer.from(value))
  }

  response.end()
}

function extractChatContent(data) {
  const choice = data?.choices?.[0]
  if (typeof choice?.message?.content === 'string') {
    return choice.message.content
  }

  if (typeof choice?.delta?.content === 'string') {
    return choice.delta.content
  }

  if (typeof data?.text === 'string') {
    return data.text
  }

  if (typeof data?.content === 'string') {
    return data.content
  }

  return ''
}

function writeCors(response, statusCode, headers = {}) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': process.env.AI_PROXY_ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  })
}

function writeJson(response, statusCode, body) {
  writeCors(response, statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}
