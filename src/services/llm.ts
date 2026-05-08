export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMStreamHandlers {
  onChunk?: (partialText: string, delta: string) => void
}

export async function chat(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const {
    model = 'qwen-plus',
    temperature = 0.7,
    maxTokens = 2000
  } = options

  const result = await window.electronAPI.llm.chat({
    messages,
    model,
    temperature,
    max_tokens: maxTokens
  })

  return result as string
}

export async function chatStream(
  messages: ChatMessage[],
  options: LLMOptions = {},
  handlers: LLMStreamHandlers = {}
): Promise<string> {
  const {
    model = 'qwen-plus',
    temperature = 0.7,
    maxTokens = 2000
  } = options

  const requestId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return new Promise<string>((resolve, reject) => {
    let partialText = ''
    let completed = false
    const cleanups: Array<() => void> = []
    const streamThrottle = createFrameThrottle(handlers.onChunk)
    const throttledChunk = (text: string, delta: string) => streamThrottle.push(text, delta)
    const flushChunk = () => streamThrottle.flush()

    const finalize = (callback: () => void) => {
      if (completed) {
        return
      }
      completed = true
      for (const cleanup of cleanups) {
        cleanup()
      }
      callback()
    }

    cleanups.push(window.electronAPI.llm.onChatStreamChunk(({ requestId: incomingId, chunk }) => {
      if (incomingId !== requestId) {
        return
      }

      partialText += chunk
      throttledChunk(partialText, chunk)
    }))

    cleanups.push(window.electronAPI.llm.onChatStreamEnd(({ requestId: incomingId }) => {
      if (incomingId !== requestId) {
        return
      }

      flushChunk()
      finalize(() => resolve(partialText))
    }))

    cleanups.push(window.electronAPI.llm.onChatStreamError(({ requestId: incomingId, error }) => {
      if (incomingId !== requestId) {
        return
      }

      finalize(() => reject(new Error(error || '流式输出失败')))
    }))

    window.electronAPI.llm.chatStream({
      requestId,
      messages,
      model,
      temperature,
      max_tokens: maxTokens
    }).then((ok) => {
      if (!ok) {
        finalize(() => reject(new Error('流式输出启动失败')))
      }
    }).catch((err) => {
      const error = err instanceof Error ? err : new Error('流式输出启动失败')
      finalize(() => reject(error))
    })
  })
}

function createFrameThrottle(callback?: (partialText: string, delta: string) => void) {
  let frame: number | null = null
  let latestText = ''
  let deltaBuffer = ''

  const flush = () => {
    frame = null
    if (!latestText) {
      return
    }

    callback?.(latestText, deltaBuffer)
    deltaBuffer = ''
  }

  return {
    push(partialText: string, delta: string) {
      latestText = partialText
      deltaBuffer += delta
      if (frame === null) {
        frame = window.requestAnimationFrame(flush)
      }
    },
    flush() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
        flush()
      }
    }
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const result = await window.electronAPI.llm.generateImage({ prompt })
  return result as string
}
