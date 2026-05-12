/// <reference path="../electron-api.d.ts" />
/**
 * Web 兼容层：在非 Electron 环境下提供 window.electronAPI 的完整替代实现。
 * - storage: localStorage
 * - llm: 直接 fetch 调用 DashScope API（需要 CORS 代理或后端中转）
 * - auth/profiles/saves/progress/achievements: localStorage
 *
 * 调用 initWebPolyfill() 即可自动注入。
 */

const LS_PREFIX = 'ai_game:'

function lsGet(key: string): unknown {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // localStorage full or quota exceeded
  }
}

function lsDelete(key: string): void {
  localStorage.removeItem(`${LS_PREFIX}${key}`)
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface WebPlayerProfile {
  id: string
  userId: string | null
  name: string
  mode: 'local'
  createdAt: number
  lastLoginAt: number
}

interface WebSaveSlot {
  slotId: string
  profileId: string
  label: string
  savedAt: number
  data: unknown
}

// Stream event listeners
type StreamChunkCb = (payload: { requestId: string; chunk: string }) => void
type StreamEndCb = (payload: { requestId: string }) => void
type StreamErrorCb = (payload: { requestId: string; error: string }) => void

const streamChunkListeners = new Set<StreamChunkCb>()
const streamEndListeners = new Set<StreamEndCb>()
const streamErrorListeners = new Set<StreamErrorCb>()

function getApiKey(): string | null {
  const stored = lsGet('config:apiKey')
  return typeof stored === 'string' ? stored : null
}

async function llmChat(payload: { messages: Array<{ role: string; content: string }>; model?: string; temperature?: number; max_tokens?: number }): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API Key 未配置，请在设置中填入 DashScope API Key')

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
}

async function llmChatStream(payload: { messages: Array<{ role: string; content: string }>; model?: string; temperature?: number; max_tokens?: number; requestId: string }): Promise<boolean> {
  const apiKey = getApiKey()
  if (!apiKey) {
    streamErrorListeners.forEach(cb => cb({ requestId: payload.requestId, error: 'API Key 未配置' }))
    return false
  }

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: payload.model || 'qwen-plus',
        messages: payload.messages,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.max_tokens ?? 2000,
        stream: true
      })
    })

    if (!response.ok || !response.body) {
      const errorText = response.body ? '' : 'No body'
      streamErrorListeners.forEach(cb => cb({ requestId: payload.requestId, error: `API 请求失败: ${response.status} ${errorText}` }))
      return false
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const dataStr = line.slice(5).trim()
        if (!dataStr || dataStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(dataStr)
          const chunk = parsed.choices?.[0]?.delta?.content || ''
          if (chunk) {
            streamChunkListeners.forEach(cb => cb({ requestId: payload.requestId, chunk }))
          }
        } catch { /* skip malformed */ }
      }
    }

    // flush remaining
    buffer += decoder.decode()
    if (buffer.trim()) {
      const lines = buffer.split('\n')
      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const dataStr = line.slice(5).trim()
        if (!dataStr || dataStr === '[DONE]') continue
        try {
          const parsed = JSON.parse(dataStr)
          const chunk = parsed.choices?.[0]?.delta?.content || ''
          if (chunk) {
            streamChunkListeners.forEach(cb => cb({ requestId: payload.requestId, chunk }))
          }
        } catch { /* skip */ }
      }
    }

    streamEndListeners.forEach(cb => cb({ requestId: payload.requestId }))
    return true
  } catch (err) {
    const error = err instanceof Error ? err.message : '流式请求失败'
    streamErrorListeners.forEach(cb => cb({ requestId: payload.requestId, error }))
    return false
  }
}

function getProfiles(): WebPlayerProfile[] {
  const profiles = lsGet('profiles')
  return Array.isArray(profiles) ? profiles as WebPlayerProfile[] : []
}

function setProfiles(profiles: WebPlayerProfile[]) {
  lsSet('profiles', profiles)
}

function getSaves(): WebSaveSlot[] {
  const saves = lsGet('saves')
  return Array.isArray(saves) ? saves as WebSaveSlot[] : []
}

function setSaves(saves: WebSaveSlot[]) {
  lsSet('saves', saves)
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined'
}

export function initWebPolyfill(): void {
  if (isElectron()) return // Electron 环境不需要 polyfill

  const webAPI: Window['electronAPI'] = {
    llm: {
      chat: llmChat,
      chatStream: llmChatStream,
      onChatStreamChunk: (cb: StreamChunkCb) => { streamChunkListeners.add(cb); return () => { streamChunkListeners.delete(cb) } },
      onChatStreamEnd: (cb: StreamEndCb) => { streamEndListeners.add(cb); return () => { streamEndListeners.delete(cb) } },
      onChatStreamError: (cb: StreamErrorCb) => { streamErrorListeners.add(cb); return () => { streamErrorListeners.delete(cb) } },
      generateImage: async () => ''
    },
    storage: {
      get: async (key: string) => lsGet(key),
      set: async (key: string, value: unknown) => { lsSet(key, value) },
      delete: async (key: string) => { lsDelete(key) }
    },
    auth: {
      register: async () => ({ ok: false, message: 'Web 版暂不支持注册账号', session: null, profile: null, dbAvailable: false }),
      login: async () => ({ ok: false, message: 'Web 版暂不支持登录账号', session: null, profile: null, dbAvailable: false }),
      logout: async () => true,
      getSession: async () => {
        const session = lsGet('session')
        if (session && typeof session === 'object') return session as { userId: string | null; username: string | null; displayName: string; mode: 'account' | 'guest' | 'local'; dbAvailable: boolean }
        return null
      }
    },
    db: {
      health: async () => ({ available: false, mode: 'local' as const, message: 'Web 版使用本地存储' })
    },
    profiles: {
      list: async () => getProfiles(),
      upsert: async (name: string) => {
        const profiles = getProfiles()
        const normalizedName = name.trim() || '新生'
        const now = Date.now()
        const existing = profiles.find(p => p.name === normalizedName)
        if (existing) {
          existing.lastLoginAt = now
          setProfiles(profiles)
          lsSet('currentProfileId', existing.id)
          return existing
        }
        const profile: WebPlayerProfile = { id: createId('profile'), userId: null, name: normalizedName, mode: 'local', createdAt: now, lastLoginAt: now }
        setProfiles([...profiles, profile])
        lsSet('currentProfileId', profile.id)
        lsSet('session', { userId: null, username: null, displayName: normalizedName, mode: 'local', dbAvailable: false })
        return profile
      },
      setCurrent: async (profileId: string) => {
        const profiles = getProfiles()
        const profile = profiles.find(p => p.id === profileId)
        if (profile) {
          profile.lastLoginAt = Date.now()
          setProfiles(profiles)
          lsSet('currentProfileId', profileId)
        }
        return profile ?? null
      },
      getCurrent: async () => {
        const id = lsGet('currentProfileId')
        if (typeof id !== 'string') return null
        return getProfiles().find(p => p.id === id) ?? null
      }
    },
    saves: {
      list: async (profileId: string) => {
        return getSaves().filter(s => s.profileId === profileId).map(s => ({
          slotId: s.slotId, profileId: s.profileId, label: s.label, savedAt: s.savedAt,
          currentActId: (s.data as Record<string, Record<string, unknown>>)?.gameState?.currentActId ?? '',
          currentNode: (s.data as Record<string, Record<string, unknown>>)?.gameState?.currentNode ?? '',
          currentLocation: (s.data as Record<string, Record<string, unknown>>)?.gameState?.currentLocation ?? '',
          week: (s.data as Record<string, Record<string, number>>)?.gameState?.week ?? 0,
          day: (s.data as Record<string, Record<string, number>>)?.gameState?.day ?? 0,
          playerStatus: (s.data as Record<string, Record<string, unknown>>)?.gameState?.playerStatus
        }))
      },
      write: async (payload: WebSaveSlot) => {
        const saves = getSaves()
        const record = { ...payload, savedAt: Date.now() }
        const index = saves.findIndex(s => s.profileId === payload.profileId && s.slotId === payload.slotId)
        if (index >= 0) { saves[index] = record } else { saves.push(record) }
        setSaves(saves)
        return record
      },
      read: async (profileId: string, slotId: string) => {
        const save = getSaves().find(s => s.profileId === profileId && s.slotId === slotId)
        return save?.data ?? null
      }
    },
    progress: {
      get: async (profileId: string) => lsGet(`progress:${profileId}`),
      set: async (profileId: string, unlockedActIds: string[]) => { lsSet(`progress:${profileId}`, unlockedActIds); return true }
    },
    achievements: {
      get: async (profileId: string) => lsGet(`achievements:${profileId}`),
      set: async (profileId: string, achievementIds: string[]) => { lsSet(`achievements:${profileId}`, achievementIds); return true }
    },
    config: {
      setApiKey: async (apiKey: string) => { lsSet('config:apiKey', apiKey) },
      getApiKey: async () => getApiKey()
    }
  }

  window.electronAPI = webAPI
}
