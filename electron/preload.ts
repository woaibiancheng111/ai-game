import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

export interface LLMChatPayload {
  messages: Array<{ role: string; content: string }>
  model?: string
  temperature?: number
  max_tokens?: number
}

export interface LLMChatStreamPayload extends LLMChatPayload {
  requestId: string
}

export interface LLMChatStreamChunkEvent {
  requestId: string
  chunk: string
}

export interface LLMChatStreamEndEvent {
  requestId: string
}

export interface LLMChatStreamErrorEvent {
  requestId: string
  error: string
}

export interface ImageGenPayload {
  prompt: string
  model?: string
}

const electronAPI = {
  llm: {
    chat: (payload: LLMChatPayload) => ipcRenderer.invoke('llm:chat', payload),
    chatStream: (payload: LLMChatStreamPayload) => ipcRenderer.invoke('llm:chat:stream', payload),
    onChatStreamChunk: (callback: (payload: LLMChatStreamChunkEvent) => void) => {
      const listener = (_event: IpcRendererEvent, payload: LLMChatStreamChunkEvent) => callback(payload)
      ipcRenderer.on('llm:chat:stream-chunk', listener)
      return () => ipcRenderer.off('llm:chat:stream-chunk', listener)
    },
    onChatStreamEnd: (callback: (payload: LLMChatStreamEndEvent) => void) => {
      const listener = (_event: IpcRendererEvent, payload: LLMChatStreamEndEvent) => callback(payload)
      ipcRenderer.on('llm:chat:stream-end', listener)
      return () => ipcRenderer.off('llm:chat:stream-end', listener)
    },
    onChatStreamError: (callback: (payload: LLMChatStreamErrorEvent) => void) => {
      const listener = (_event: IpcRendererEvent, payload: LLMChatStreamErrorEvent) => callback(payload)
      ipcRenderer.on('llm:chat:stream-error', listener)
      return () => ipcRenderer.off('llm:chat:stream-error', listener)
    },
    generateImage: (payload: ImageGenPayload) => ipcRenderer.invoke('llm:generateImage', payload)
  },
  storage: {
    get: (key: string) => ipcRenderer.invoke('storage:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('storage:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('storage:delete', key)
  },
  config: {
    setApiKey: (apiKey: string) => ipcRenderer.invoke('config:setApiKey', apiKey),
    getApiKey: () => ipcRenderer.invoke('config:getApiKey')
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
