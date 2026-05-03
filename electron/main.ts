import { app, BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'
import path from 'path'
import type Store from 'electron-store'

interface LLMChatPayload {
  messages: Array<{ role: string; content: string }>
  model?: string
  temperature?: number
  max_tokens?: number
}

interface LLMChatStreamPayload extends LLMChatPayload {
  requestId: string
}

type AppStore = Store<Record<string, unknown>>

let storePromise: Promise<AppStore> | null = null

function getStore(): Promise<AppStore> {
  if (!storePromise) {
    storePromise = import('electron-store').then(({ default: ElectronStore }) => new ElectronStore<Record<string, unknown>>())
  }
  return storePromise
}

async function getApiKeyFromEnvOrStore(): Promise<string | undefined> {
  if (process.env.DASHSCOPE_API_KEY) {
    return process.env.DASHSCOPE_API_KEY
  }

  if (process.env.VITE_DASHSCOPE_API_KEY) {
    return process.env.VITE_DASHSCOPE_API_KEY
  }

  const store = await getStore()
  const storedValue = store.get('dashscopeApiKey')
  return typeof storedValue === 'string' ? storedValue : undefined
}

function sendStreamEvent(event: IpcMainInvokeEvent, channel: string, payload: unknown) {
  if (!event.sender.isDestroyed()) {
    event.sender.send(channel, payload)
  }
}

function extractStreamChunk(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    return ''
  }

  const maybeChoices = (data as { choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }> }).choices
  const first = maybeChoices?.[0]
  if (!first) {
    return ''
  }

  if (typeof first.delta?.content === 'string') {
    return first.delta.content
  }

  if (typeof first.message?.content === 'string') {
    return first.message.content
  }

  return ''
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: 'AI 校园生存模拟器',
    show: false
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    if (process.env.ELECTRON_OPEN_DEVTOOLS === '1') {
      win.webContents.openDevTools()
    }
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('llm:chat', async (_event, payload: LLMChatPayload) => {
  const apiKey = await getApiKeyFromEnvOrStore()
  if (!apiKey) {
    throw new Error('API Key 未配置，请设置 DASHSCOPE_API_KEY 环境变量或通过 setApiKey 设置')
  }

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: payload.model || 'qwen-plus',
      messages: payload.messages,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.max_tokens ?? 2000
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 请求失败: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
})

ipcMain.handle('llm:chat:stream', async (event, payload: LLMChatStreamPayload) => {
  const apiKey = await getApiKeyFromEnvOrStore()
  if (!apiKey) {
    const error = 'API Key 未配置，请设置 DASHSCOPE_API_KEY 环境变量或通过 setApiKey 设置'
    sendStreamEvent(event, 'llm:chat:stream-error', { requestId: payload.requestId, error })
    return false
  }

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: payload.model || 'qwen-plus',
        messages: payload.messages,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.max_tokens ?? 2000,
        stream: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      const error = `API 请求失败: ${response.status} - ${errorText}`
      sendStreamEvent(event, 'llm:chat:stream-error', { requestId: payload.requestId, error })
      return false
    }

    if (!response.body) {
      sendStreamEvent(event, 'llm:chat:stream-error', { requestId: payload.requestId, error: '流式响应为空' })
      return false
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const processLines = (flush: boolean) => {
      const lines = buffer.split('\n')
      if (!flush) {
        buffer = lines.pop() ?? ''
      } else {
        buffer = ''
      }

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) {
          continue
        }

        const dataLine = line.slice(5).trim()
        if (!dataLine || dataLine === '[DONE]') {
          continue
        }

        try {
          const parsed = JSON.parse(dataLine)
          const chunk = extractStreamChunk(parsed)
          if (chunk) {
            sendStreamEvent(event, 'llm:chat:stream-chunk', { requestId: payload.requestId, chunk })
          }
        } catch {
          // Ignore malformed partial stream lines.
        }
      }
    }

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      processLines(false)
    }

    buffer += decoder.decode()
    processLines(true)

    sendStreamEvent(event, 'llm:chat:stream-end', { requestId: payload.requestId })
    return true
  } catch (err) {
    const error = err instanceof Error ? err.message : '流式请求失败'
    sendStreamEvent(event, 'llm:chat:stream-error', { requestId: payload.requestId, error })
    return false
  }
})

ipcMain.handle('llm:generateImage', async (_event, payload: {
  prompt: string
  model?: string
}) => {
  const apiKey = await getApiKeyFromEnvOrStore()
  if (!apiKey) {
    throw new Error('API Key 未配置')
  }

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: payload.model || 'wanx2.1',
      input: { prompt: payload.prompt },
      parameters: {
        size: '1024*1024',
        n: 1
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`图像生成失败: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.output?.image_url || ''
})

ipcMain.handle('storage:get', async (_event, key: string) => {
  const store = await getStore()
  return store.get(key)
})

ipcMain.handle('storage:set', async (_event, key: string, value: unknown) => {
  const store = await getStore()
  store.set(key, value)
})

ipcMain.handle('storage:delete', async (_event, key: string) => {
  const store = await getStore()
  store.delete(key)
})

ipcMain.handle('config:setApiKey', async (_event, apiKey: string) => {
  const store = await getStore()
  store.set('dashscopeApiKey', apiKey)
})

ipcMain.handle('config:getApiKey', async () => {
  return getApiKeyFromEnvOrStore()
})
