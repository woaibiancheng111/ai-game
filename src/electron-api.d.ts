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
  errorCode?: string
}

interface ImageGenPayload {
  prompt: string
  model?: string
}

interface AIProxyChatPayload {
  messages: Array<{ role: string; content: string }>
  context?: unknown
  model?: string
  temperature?: number
  max_tokens?: number
  proxyUrl?: string
}

interface AIProxyChatStreamPayload extends AIProxyChatPayload {
  requestId: string
}

interface AIProxyChatResult {
  ok: boolean
  text: string
  errorCode?: string
  message?: string
}

interface PlayerProfilePayload {
  id: string
  userId?: string | null
  name: string
  mode?: 'account' | 'guest' | 'local'
  createdAt: number
  lastLoginAt: number
}

interface SaveSlotPayload {
  slotId: string
  profileId: string
  label: string
  savedAt: number
  data: unknown
}

interface AuthSessionPayload {
  userId: string | null
  username: string | null
  displayName: string
  mode: 'account' | 'guest' | 'local'
  dbAvailable: boolean
}

interface AuthResultPayload {
  ok: boolean
  message: string
  session: AuthSessionPayload | null
  profile: PlayerProfilePayload | null
  dbAvailable: boolean
}

interface DbHealthPayload {
  available: boolean
  mode: 'mysql' | 'local'
  message: string
}

interface AppSettingsPayload {
  aiEnabled: boolean
  aiAllowStreaming: boolean
  aiProxyUrl: string
  bgmEnabled: boolean
  sfxEnabled: boolean
  masterVolume: number
  errorLoggingEnabled: boolean
}

interface AppLogPayload {
  level: 'info' | 'warning' | 'error'
  scope: string
  message: string
  details?: unknown
}

interface AppReleaseInfoPayload {
  appName: string
  version: string
  platform: string
  userDataPath: string
  logsPath: string
}

interface AppPathActionResultPayload {
  ok: boolean
  path?: string
  message?: string
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
  aiProxy: {
    chat: (payload: AIProxyChatPayload) => Promise<AIProxyChatResult>
    chatStream: (payload: AIProxyChatStreamPayload) => Promise<boolean>
    onChatStreamChunk: (callback: (payload: LLMChatStreamChunkEvent) => void) => () => void
    onChatStreamEnd: (callback: (payload: LLMChatStreamEndEvent) => void) => () => void
    onChatStreamError: (callback: (payload: LLMChatStreamErrorEvent) => void) => () => void
  }
  storage: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<unknown>
    delete: (key: string) => Promise<unknown>
  }
  auth: {
    register: (payload: { username: string; password: string; displayName: string }) => Promise<AuthResultPayload>
    login: (payload: { username: string; password: string }) => Promise<AuthResultPayload>
    logout: () => Promise<boolean>
    getSession: () => Promise<AuthSessionPayload | null>
  }
  db: {
    health: () => Promise<DbHealthPayload>
  }
  profiles: {
    list: () => Promise<PlayerProfilePayload[]>
    upsert: (name: string) => Promise<PlayerProfilePayload>
    setCurrent: (profileId: string) => Promise<PlayerProfilePayload | null>
    getCurrent: () => Promise<PlayerProfilePayload | null>
  }
  saves: {
    list: (profileId: string) => Promise<unknown[]>
    write: (payload: SaveSlotPayload) => Promise<SaveSlotPayload>
    read: (profileId: string, slotId: string) => Promise<unknown>
    delete: (profileId: string, slotId: string) => Promise<boolean>
  }
  progress: {
    get: (profileId: string) => Promise<unknown>
    set: (profileId: string, unlockedActIds: string[]) => Promise<boolean>
  }
  achievements: {
    get: (profileId: string) => Promise<unknown>
    set: (profileId: string, achievementIds: string[]) => Promise<boolean>
  }
  config: {
    setApiKey: (apiKey: string) => Promise<unknown>
    getApiKey: () => Promise<string | null>
  }
  settings: {
    get: () => Promise<unknown>
    set: (settings: AppSettingsPayload) => Promise<AppSettingsPayload>
  }
  app: {
    getReleaseInfo: () => Promise<AppReleaseInfoPayload>
    log: (payload: AppLogPayload) => Promise<boolean>
    openUserDataPath: () => Promise<AppPathActionResultPayload>
    openLogsPath: () => Promise<AppPathActionResultPayload>
    exportLogs: () => Promise<AppPathActionResultPayload>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
