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
  errorCode?: string
}

export interface ImageGenPayload {
  prompt: string
  model?: string
}

export interface AIProxyChatPayload {
  messages: Array<{ role: string; content: string }>
  context?: unknown
  model?: string
  temperature?: number
  max_tokens?: number
  proxyUrl?: string
}

export interface AIProxyChatStreamPayload extends AIProxyChatPayload {
  requestId: string
}

export interface AIProxyChatResult {
  ok: boolean
  text: string
  errorCode?: string
  message?: string
}

export interface PlayerProfilePayload {
  id: string
  userId?: string | null
  name: string
  mode?: 'account' | 'guest' | 'local'
  createdAt: number
  lastLoginAt: number
}

export interface SaveSlotPayload {
  slotId: string
  profileId: string
  label: string
  savedAt: number
  data: unknown
}

export interface AuthSessionPayload {
  userId: string | null
  username: string | null
  displayName: string
  mode: 'account' | 'guest' | 'local'
  dbAvailable: boolean
}

export interface AuthResultPayload {
  ok: boolean
  message: string
  session: AuthSessionPayload | null
  profile: PlayerProfilePayload | null
  dbAvailable: boolean
}

export interface DbHealthPayload {
  available: boolean
  mode: 'mysql' | 'local'
  message: string
}

export interface AppSettingsPayload {
  aiEnabled: boolean
  aiAllowStreaming: boolean
  aiProxyUrl: string
  bgmEnabled: boolean
  sfxEnabled: boolean
  masterVolume: number
  errorLoggingEnabled: boolean
}

export interface AppLogPayload {
  level: 'info' | 'warning' | 'error'
  scope: string
  message: string
  details?: unknown
}

export interface AppPathActionResult {
  ok: boolean
  path?: string
  message?: string
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
  aiProxy: {
    chat: (payload: AIProxyChatPayload) => ipcRenderer.invoke('aiProxy:chat', payload),
    chatStream: (payload: AIProxyChatStreamPayload) => ipcRenderer.invoke('aiProxy:chat:stream', payload),
    onChatStreamChunk: (callback: (payload: LLMChatStreamChunkEvent) => void) => {
      const listener = (_event: IpcRendererEvent, payload: LLMChatStreamChunkEvent) => callback(payload)
      ipcRenderer.on('aiProxy:chat:stream-chunk', listener)
      return () => ipcRenderer.off('aiProxy:chat:stream-chunk', listener)
    },
    onChatStreamEnd: (callback: (payload: LLMChatStreamEndEvent) => void) => {
      const listener = (_event: IpcRendererEvent, payload: LLMChatStreamEndEvent) => callback(payload)
      ipcRenderer.on('aiProxy:chat:stream-end', listener)
      return () => ipcRenderer.off('aiProxy:chat:stream-end', listener)
    },
    onChatStreamError: (callback: (payload: LLMChatStreamErrorEvent) => void) => {
      const listener = (_event: IpcRendererEvent, payload: LLMChatStreamErrorEvent) => callback(payload)
      ipcRenderer.on('aiProxy:chat:stream-error', listener)
      return () => ipcRenderer.off('aiProxy:chat:stream-error', listener)
    }
  },
  storage: {
    get: (key: string) => ipcRenderer.invoke('storage:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('storage:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('storage:delete', key)
  },
  auth: {
    register: (payload: { username: string; password: string; displayName: string }) => ipcRenderer.invoke('auth:register', payload),
    login: (payload: { username: string; password: string }) => ipcRenderer.invoke('auth:login', payload),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getSession: () => ipcRenderer.invoke('auth:getSession')
  },
  db: {
    health: () => ipcRenderer.invoke('db:health')
  },
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    upsert: (name: string) => ipcRenderer.invoke('profiles:upsert', name),
    setCurrent: (profileId: string) => ipcRenderer.invoke('profiles:setCurrent', profileId),
    getCurrent: () => ipcRenderer.invoke('profiles:getCurrent')
  },
  saves: {
    list: (profileId: string) => ipcRenderer.invoke('saves:list', profileId),
    write: (payload: SaveSlotPayload) => ipcRenderer.invoke('saves:write', payload),
    read: (profileId: string, slotId: string) => ipcRenderer.invoke('saves:read', profileId, slotId)
  },
  progress: {
    get: (profileId: string) => ipcRenderer.invoke('progress:get', profileId),
    set: (profileId: string, unlockedActIds: string[]) => ipcRenderer.invoke('progress:set', profileId, unlockedActIds)
  },
  achievements: {
    get: (profileId: string) => ipcRenderer.invoke('achievements:get', profileId),
    set: (profileId: string, achievementIds: string[]) => ipcRenderer.invoke('achievements:set', profileId, achievementIds)
  },
  config: {
    setApiKey: (apiKey: string) => ipcRenderer.invoke('config:setApiKey', apiKey),
    getApiKey: () => ipcRenderer.invoke('config:getApiKey')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: AppSettingsPayload) => ipcRenderer.invoke('settings:set', settings)
  },
  app: {
    getReleaseInfo: () => ipcRenderer.invoke('app:getReleaseInfo'),
    log: (payload: AppLogPayload) => ipcRenderer.invoke('app:log', payload),
    openUserDataPath: () => ipcRenderer.invoke('app:openUserDataPath'),
    openLogsPath: () => ipcRenderer.invoke('app:openLogsPath'),
    exportLogs: () => ipcRenderer.invoke('app:exportLogs')
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
