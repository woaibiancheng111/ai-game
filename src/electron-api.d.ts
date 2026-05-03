interface LLMChatPayload {
  messages: Array<{ role: string; content: string }>
  model?: string
  temperature?: number
  max_tokens?: number
}

interface LLMChatStreamPayload extends LLMChatPayload {
  requestId: string
}

interface LLMChatStreamChunkEvent {
  requestId: string
  chunk: string
}

interface LLMChatStreamEndEvent {
  requestId: string
}

interface LLMChatStreamErrorEvent {
  requestId: string
  error: string
}

interface ImageGenPayload {
  prompt: string
  model?: string
}

interface ElectronAPI {
  llm: {
    chat: (payload: LLMChatPayload) => Promise<string>
    chatStream: (payload: LLMChatStreamPayload) => Promise<boolean>
    onChatStreamChunk: (callback: (payload: LLMChatStreamChunkEvent) => void) => () => void
    onChatStreamEnd: (callback: (payload: LLMChatStreamEndEvent) => void) => () => void
    onChatStreamError: (callback: (payload: LLMChatStreamErrorEvent) => void) => () => void
    generateImage: (payload: ImageGenPayload) => Promise<string>
  }
  storage: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<unknown>
    delete: (key: string) => Promise<unknown>
  }
  config: {
    setApiKey: (apiKey: string) => Promise<unknown>
    getApiKey: () => Promise<string | null>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
