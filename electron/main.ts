import { app, BrowserWindow, ipcMain, shell, type IpcMainInvokeEvent } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import bcrypt from 'bcryptjs'
import type Store from 'electron-store'
import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'

interface LLMChatPayload {
  messages: Array<{ role: string; content: string }>
  model?: string
  temperature?: number
  max_tokens?: number
}

interface LLMChatStreamPayload extends LLMChatPayload {
  requestId: string
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

interface PlayerProfileRecord {
  id: string
  userId?: string | null
  name: string
  mode?: 'account' | 'guest' | 'local'
  createdAt: number
  lastLoginAt: number
}

interface SaveSlotRecord {
  slotId: string
  profileId: string
  label: string
  savedAt: number
  data: unknown
}

interface AuthSessionRecord {
  userId: string | null
  username: string | null
  displayName: string
  mode: 'account' | 'guest' | 'local'
  dbAvailable: boolean
}

interface AuthResultRecord {
  ok: boolean
  message: string
  session: AuthSessionRecord | null
  profile: PlayerProfileRecord | null
  dbAvailable: boolean
}

interface DbHealthRecord {
  available: boolean
  mode: 'mysql' | 'local'
  message: string
}

interface AppSettingsRecord {
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

interface AppPathActionResult {
  ok: boolean
  path?: string
  message?: string
}

type AppStore = Store<Record<string, unknown>>

const LOCAL_PROFILES_KEY = 'db:profiles'
const LOCAL_SAVES_KEY = 'db:saves'
const CURRENT_PROFILE_KEY = 'db:currentProfileId'
const CURRENT_SESSION_KEY = 'db:currentSession'
const LOCAL_PROGRESS_KEY = 'db:progress'
const LOCAL_ACHIEVEMENTS_KEY = 'db:achievements'
const APP_SETTINGS_KEY = 'settings:app'
const DEFAULT_APP_SETTINGS: AppSettingsRecord = {
  aiEnabled: true,
  aiAllowStreaming: true,
  aiProxyUrl: '',
  bgmEnabled: true,
  sfxEnabled: true,
  masterVolume: 0.5,
  errorLoggingEnabled: true
}

if (process.env.AI_GAME_USER_DATA_DIR?.trim()) {
  app.setPath('userData', path.resolve(process.env.AI_GAME_USER_DATA_DIR.trim()))
}

let storePromise: Promise<AppStore> | null = null
let poolPromise: Promise<Pool | null> | null = null
let dbReady = false
let dbUnavailableReason = ''
const DB_CONNECT_TIMEOUT_MS = 1800

function getStore(): Promise<AppStore> {
  if (!storePromise) {
    storePromise = import('electron-store').then(({ default: ElectronStore }) => new ElectronStore<Record<string, unknown>>())
  }
  return storePromise
}

function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || 'ai_campus_survival',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456'
  }
}

function normalizeAppSettings(value: unknown): AppSettingsRecord {
  if (typeof value !== 'object' || value === null) {
    return { ...DEFAULT_APP_SETTINGS }
  }

  const maybeSettings = value as Partial<AppSettingsRecord>
  return {
    aiEnabled: typeof maybeSettings.aiEnabled === 'boolean' ? maybeSettings.aiEnabled : DEFAULT_APP_SETTINGS.aiEnabled,
    aiAllowStreaming: typeof maybeSettings.aiAllowStreaming === 'boolean' ? maybeSettings.aiAllowStreaming : DEFAULT_APP_SETTINGS.aiAllowStreaming,
    aiProxyUrl: typeof maybeSettings.aiProxyUrl === 'string' ? maybeSettings.aiProxyUrl.trim() : DEFAULT_APP_SETTINGS.aiProxyUrl,
    bgmEnabled: typeof maybeSettings.bgmEnabled === 'boolean' ? maybeSettings.bgmEnabled : DEFAULT_APP_SETTINGS.bgmEnabled,
    sfxEnabled: typeof maybeSettings.sfxEnabled === 'boolean' ? maybeSettings.sfxEnabled : DEFAULT_APP_SETTINGS.sfxEnabled,
    masterVolume: typeof maybeSettings.masterVolume === 'number' && Number.isFinite(maybeSettings.masterVolume)
      ? Math.max(0, Math.min(1, maybeSettings.masterVolume))
      : DEFAULT_APP_SETTINGS.masterVolume,
    errorLoggingEnabled: typeof maybeSettings.errorLoggingEnabled === 'boolean'
      ? maybeSettings.errorLoggingEnabled
      : DEFAULT_APP_SETTINGS.errorLoggingEnabled
  }
}

async function readAppSettings(): Promise<AppSettingsRecord> {
  const store = await getStore()
  return normalizeAppSettings(store.get(APP_SETTINGS_KEY))
}

async function writeAppLog(payload: AppLogPayload): Promise<boolean> {
  const settings = await readAppSettings()
  if (!settings.errorLoggingEnabled) {
    return false
  }

  const logsPath = path.join(app.getPath('userData'), 'logs')
  await fs.mkdir(logsPath, { recursive: true })
  const line = JSON.stringify({
    time: new Date().toISOString(),
    ...payload
  })
  await fs.appendFile(path.join(logsPath, 'app.log'), `${line}\n`, 'utf8')
  return true
}

async function getPool(): Promise<Pool | null> {
  if (process.env.AI_GAME_DISABLE_MYSQL === '1') {
    dbReady = false
    dbUnavailableReason = 'MySQL disabled by AI_GAME_DISABLE_MYSQL'
    return null
  }

  if (poolPromise) {
    const currentPool = await poolPromise
    if (currentPool && dbReady) {
      return currentPool
    }

    if (currentPool && !dbReady) {
      try {
        await currentPool.end()
      } catch {
      }
    }

    poolPromise = null
  }

  poolPromise = initializePool()
  return poolPromise
}

async function initializePool(): Promise<Pool | null> {
  try {
    const mysql = await import('mysql2/promise')
    const config = getDbConfig()
    const bootstrap = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: DB_CONNECT_TIMEOUT_MS,
      multipleStatements: false
    })

    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await bootstrap.end()

    const pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectTimeout: DB_CONNECT_TIMEOUT_MS,
      waitForConnections: true,
      connectionLimit: 8,
      queueLimit: 0,
      namedPlaceholders: true
    })

    await ensureSchema(pool)
    dbReady = true
    dbUnavailableReason = ''
    return pool
  } catch (err) {
    dbReady = false
    dbUnavailableReason = err instanceof Error ? err.message : 'MySQL 连接失败'
    return null
  }
}

async function ensureSchema(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(64) NOT NULL,
      created_at BIGINT NOT NULL,
      last_login_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NULL,
      name VARCHAR(64) NOT NULL,
      mode VARCHAR(16) NOT NULL,
      created_at BIGINT NOT NULL,
      last_login_at BIGINT NOT NULL,
      INDEX idx_profiles_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS saves (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      profile_id VARCHAR(64) NOT NULL,
      slot_id VARCHAR(128) NOT NULL,
      label VARCHAR(128) NOT NULL,
      save_json JSON NOT NULL,
      saved_at BIGINT NOT NULL,
      UNIQUE KEY uniq_profile_slot (profile_id, slot_id),
      INDEX idx_saves_profile_id (profile_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      profile_id VARCHAR(64) PRIMARY KEY,
      unlocked_acts_json JSON NOT NULL,
      updated_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      profile_id VARCHAR(64) PRIMARY KEY,
      achievements_json JSON NOT NULL,
      updated_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}

async function withDb<T>(callback: (pool: Pool) => Promise<T>): Promise<T | null> {
  const pool = await getPool()
  if (!pool || !dbReady) {
    return null
  }

  try {
    return await callback(pool)
  } catch (err) {
    dbReady = false
    dbUnavailableReason = err instanceof Error ? err.message : 'MySQL 操作失败'
    return null
  }
}

async function getDbHealth(): Promise<DbHealthRecord> {
  const pool = await getPool()
  if (!pool) {
    return { available: false, mode: 'local', message: dbUnavailableReason || 'MySQL 不可用，当前为本地模式' }
  }

  try {
    await pool.query('SELECT 1')
    dbReady = true
    return { available: true, mode: 'mysql', message: 'MySQL 已连接' }
  } catch (err) {
    dbReady = false
    dbUnavailableReason = err instanceof Error ? err.message : 'MySQL 健康检查失败'
    return { available: false, mode: 'local', message: dbUnavailableReason }
  }
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

function extractChatContent(data: unknown): string {
  if (typeof data === 'string') {
    return data
  }

  if (typeof data !== 'object' || data === null) {
    return ''
  }

  const maybeData = data as {
    text?: unknown
    content?: unknown
    choices?: Array<{ message?: { content?: unknown }; delta?: { content?: unknown } }>
  }

  if (typeof maybeData.text === 'string') {
    return maybeData.text
  }

  if (typeof maybeData.content === 'string') {
    return maybeData.content
  }

  const first = maybeData.choices?.[0]
  if (typeof first?.message?.content === 'string') {
    return first.message.content
  }

  if (typeof first?.delta?.content === 'string') {
    return first.delta.content
  }

  return ''
}

function getProxyUrl(payloadUrl?: string): string {
  if (payloadUrl?.trim()) {
    return payloadUrl.trim()
  }

  if (process.env.AI_PROXY_URL?.trim()) {
    return process.env.AI_PROXY_URL.trim()
  }

  return ''
}

function buildProxyBody(payload: AIProxyChatPayload, stream = false) {
  return {
    model: payload.model || 'qwen-plus',
    messages: payload.messages,
    context: payload.context,
    temperature: payload.temperature ?? 0.7,
    max_tokens: payload.max_tokens ?? 2000,
    stream
  }
}

async function callAIProxy(payload: AIProxyChatPayload): Promise<AIProxyChatResult> {
  const proxyUrl = getProxyUrl(payload.proxyUrl)
  if (!proxyUrl) {
    return { ok: false, text: '', errorCode: 'proxy_not_configured', message: 'AI 代理地址未配置' }
  }

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildProxyBody(payload))
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        ok: false,
        text: '',
        errorCode: `proxy_http_${response.status}`,
        message: errorText || `AI 代理请求失败: ${response.status}`
      }
    }

    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()
    const text = extractChatContent(data).trim()
    return text
      ? { ok: true, text }
      : { ok: false, text: '', errorCode: 'proxy_empty_response', message: 'AI 代理响应为空' }
  } catch (err) {
    return {
      ok: false,
      text: '',
      errorCode: 'proxy_exception',
      message: err instanceof Error ? err.message : 'AI 代理请求异常'
    }
  }
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toProfile(row: RowDataPacket): PlayerProfileRecord {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    name: String(row.name),
    mode: row.mode === 'account' || row.mode === 'guest' ? row.mode : 'local',
    createdAt: Number(row.created_at),
    lastLoginAt: Number(row.last_login_at)
  }
}

function makeSession(userId: string | null, username: string | null, displayName: string, mode: AuthSessionRecord['mode'], dbAvailable: boolean): AuthSessionRecord {
  return { userId, username, displayName, mode, dbAvailable }
}

async function setCurrentSession(session: AuthSessionRecord | null, profileId?: string) {
  const store = await getStore()
  if (session) {
    store.set(CURRENT_SESSION_KEY, session)
  } else {
    store.delete(CURRENT_SESSION_KEY)
    store.delete(CURRENT_PROFILE_KEY)
  }

  if (profileId) {
    store.set(CURRENT_PROFILE_KEY, profileId)
  }
}

async function getCurrentSession(): Promise<AuthSessionRecord | null> {
  const store = await getStore()
  const session = store.get(CURRENT_SESSION_KEY)
  if (typeof session !== 'object' || session === null) {
    return null
  }

  const maybeSession = session as Partial<AuthSessionRecord>
  if (maybeSession.mode !== 'account' && maybeSession.mode !== 'guest' && maybeSession.mode !== 'local') {
    return null
  }

  return {
    userId: typeof maybeSession.userId === 'string' ? maybeSession.userId : null,
    username: typeof maybeSession.username === 'string' ? maybeSession.username : null,
    displayName: typeof maybeSession.displayName === 'string' ? maybeSession.displayName : '新生',
    mode: maybeSession.mode,
    dbAvailable: Boolean(maybeSession.dbAvailable)
  }
}

async function listLocalProfiles(): Promise<PlayerProfileRecord[]> {
  const store = await getStore()
  const profiles = store.get(LOCAL_PROFILES_KEY)
  return Array.isArray(profiles) ? profiles as PlayerProfileRecord[] : []
}

async function writeLocalProfiles(profiles: PlayerProfileRecord[]) {
  const store = await getStore()
  store.set(LOCAL_PROFILES_KEY, profiles)
}

async function mirrorLocalProfile(profile: PlayerProfileRecord) {
  const profiles = await listLocalProfiles()
  const index = profiles.findIndex(item => item.id === profile.id)
  if (index >= 0) {
    profiles[index] = profile
  } else {
    profiles.push(profile)
  }
  await writeLocalProfiles(profiles)
}

async function upsertLocalProfile(name: string, mode: PlayerProfileRecord['mode'] = 'local', userId: string | null = null): Promise<PlayerProfileRecord> {
  const normalizedName = name.trim() || '新生'
  const profiles = await listLocalProfiles()
  const now = Date.now()
  const matched = profiles.find(profile => profile.name === normalizedName && (profile.userId ?? null) === userId)

  if (matched) {
    matched.lastLoginAt = now
    matched.mode = mode
    await writeLocalProfiles(profiles)
    const session = makeSession(userId, null, matched.name, mode ?? 'local', false)
    await setCurrentSession(session, matched.id)
    return matched
  }

  const profile: PlayerProfileRecord = {
    id: createId('profile'),
    userId,
    name: normalizedName,
    mode,
    createdAt: now,
    lastLoginAt: now
  }
  await writeLocalProfiles([...profiles, profile])
  const session = makeSession(userId, null, profile.name, mode ?? 'local', false)
  await setCurrentSession(session, profile.id)
  return profile
}

async function listLocalSaves(profileId: string): Promise<SaveSlotRecord[]> {
  const store = await getStore()
  const existing = store.get(LOCAL_SAVES_KEY)
  const saves: SaveSlotRecord[] = Array.isArray(existing) ? existing as SaveSlotRecord[] : []
  return saves.filter(save => save.profileId === profileId)
}

async function writeLocalSave(payload: SaveSlotRecord): Promise<SaveSlotRecord> {
  const store = await getStore()
  const existing = store.get(LOCAL_SAVES_KEY)
  const saves: SaveSlotRecord[] = Array.isArray(existing) ? existing as SaveSlotRecord[] : []
  const nextRecord = { ...payload, savedAt: Date.now() }
  const index = saves.findIndex(save => save.profileId === payload.profileId && save.slotId === payload.slotId)

  if (index >= 0) {
    saves[index] = nextRecord
  } else {
    saves.push(nextRecord)
  }

  store.set(LOCAL_SAVES_KEY, saves)
  return nextRecord
}

async function readLocalSave(profileId: string, slotId: string): Promise<unknown> {
  const saves = await listLocalSaves(profileId)
  return saves.find(save => save.slotId === slotId)?.data ?? null
}

async function deleteLocalSave(profileId: string, slotId: string): Promise<boolean> {
  const store = await getStore()
  const existing = store.get(LOCAL_SAVES_KEY)
  const saves: SaveSlotRecord[] = Array.isArray(existing) ? existing as SaveSlotRecord[] : []
  const nextSaves = saves.filter(save => !(save.profileId === profileId && save.slotId === slotId))
  store.set(LOCAL_SAVES_KEY, nextSaves)
  return nextSaves.length !== saves.length
}

function saveToMeta(save: SaveSlotRecord) {
  return {
    slotId: save.slotId,
    profileId: save.profileId,
    label: save.label,
    savedAt: save.savedAt,
    currentActId: (save.data as { gameState?: { currentActId?: string } })?.gameState?.currentActId ?? '',
    currentNode: (save.data as { gameState?: { currentNode?: string } })?.gameState?.currentNode ?? '',
    currentLocation: (save.data as { gameState?: { currentLocation?: string } })?.gameState?.currentLocation ?? '',
    week: (save.data as { gameState?: { week?: number } })?.gameState?.week ?? 0,
    day: (save.data as { gameState?: { day?: number } })?.gameState?.day ?? 0,
    playerStatus: (save.data as { gameState?: { playerStatus?: unknown } })?.gameState?.playerStatus
  }
}

async function upsertMysqlProfile(name: string, mode: 'account' | 'guest', userId: string | null, connection?: Pool | PoolConnection): Promise<PlayerProfileRecord | null> {
  const run = async (pool: Pool | PoolConnection) => {
    const normalizedName = name.trim() || '新生'
    const now = Date.now()
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM profiles WHERE name = ? AND ((user_id IS NULL AND ? IS NULL) OR user_id = ?) LIMIT 1',
      [normalizedName, userId, userId]
    )

    if (rows[0]) {
      await pool.query('UPDATE profiles SET last_login_at = ?, mode = ? WHERE id = ?', [now, mode, rows[0].id])
      return { ...toProfile(rows[0]), lastLoginAt: now, mode }
    }

    const id = createId('profile')
    await pool.query(
      'INSERT INTO profiles (id, user_id, name, mode, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, normalizedName, mode, now, now]
    )
    return { id, userId, name: normalizedName, mode, createdAt: now, lastLoginAt: now }
  }

  if (connection) {
    const profile = await run(connection)
    await mirrorLocalProfile(profile)
    return profile
  }

  const profile = await withDb(run)
  if (profile) {
    await mirrorLocalProfile(profile)
  }
  return profile
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
  void getPool()
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

ipcMain.handle('llm:generateImage', async (_event, payload: { prompt: string; model?: string }) => {
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

ipcMain.handle('aiProxy:chat', async (_event, payload: AIProxyChatPayload): Promise<AIProxyChatResult> => {
  const result = await callAIProxy(payload)
  if (!result.ok) {
    await writeAppLog({
      level: 'warning',
      scope: 'aiProxy:chat',
      message: result.message ?? 'AI 代理请求失败',
      details: { errorCode: result.errorCode }
    }).catch(() => false)
  }
  return result
})

ipcMain.handle('aiProxy:chat:stream', async (event, payload: AIProxyChatStreamPayload) => {
  const proxyUrl = getProxyUrl(payload.proxyUrl)
  if (!proxyUrl) {
    sendStreamEvent(event, 'aiProxy:chat:stream-error', {
      requestId: payload.requestId,
      error: 'AI 代理地址未配置',
      errorCode: 'proxy_not_configured'
    })
    return false
  }

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildProxyBody(payload, true))
    })

    if (!response.ok) {
      const errorText = await response.text()
      sendStreamEvent(event, 'aiProxy:chat:stream-error', {
        requestId: payload.requestId,
        error: errorText || `AI 代理请求失败: ${response.status}`,
        errorCode: `proxy_http_${response.status}`
      })
      return false
    }

    if (!response.body) {
      sendStreamEvent(event, 'aiProxy:chat:stream-error', {
        requestId: payload.requestId,
        error: 'AI 代理流式响应为空',
        errorCode: 'proxy_empty_body'
      })
      return false
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/event-stream')) {
      const data = contentType.includes('application/json') ? await response.json() : await response.text()
      const text = extractChatContent(data)
      if (text) {
        sendStreamEvent(event, 'aiProxy:chat:stream-chunk', { requestId: payload.requestId, chunk: text })
      }
      sendStreamEvent(event, 'aiProxy:chat:stream-end', { requestId: payload.requestId })
      return true
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
          const chunk = extractStreamChunk(parsed) || extractChatContent(parsed)
          if (chunk) {
            sendStreamEvent(event, 'aiProxy:chat:stream-chunk', { requestId: payload.requestId, chunk })
          }
        } catch {
          sendStreamEvent(event, 'aiProxy:chat:stream-chunk', { requestId: payload.requestId, chunk: dataLine })
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
    sendStreamEvent(event, 'aiProxy:chat:stream-end', { requestId: payload.requestId })
    return true
  } catch (err) {
    const error = err instanceof Error ? err.message : 'AI 代理流式请求失败'
    sendStreamEvent(event, 'aiProxy:chat:stream-error', {
      requestId: payload.requestId,
      error,
      errorCode: 'proxy_stream_exception'
    })
    await writeAppLog({
      level: 'warning',
      scope: 'aiProxy:chat:stream',
      message: error,
      details: { requestId: payload.requestId }
    }).catch(() => false)
    return false
  }
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

ipcMain.handle('db:health', async () => getDbHealth())

ipcMain.handle('auth:getSession', async () => {
  const session = await getCurrentSession()
  if (!session) {
    return null
  }

  const health = await getDbHealth()
  return { ...session, dbAvailable: health.available }
})

ipcMain.handle('auth:logout', async () => {
  await setCurrentSession(null)
  return true
})

ipcMain.handle('auth:register', async (_event, payload: { username: string; password: string; displayName: string }): Promise<AuthResultRecord> => {
  const username = payload.username.trim()
  const displayName = payload.displayName.trim() || username
  if (!username || !payload.password) {
    return { ok: false, message: '请输入账号和密码', session: null, profile: null, dbAvailable: dbReady }
  }

  const result = await withDb(async (pool) => {
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ? LIMIT 1', [username])
    if (existing.length > 0) {
      return { ok: false, message: '账号已存在', session: null, profile: null, dbAvailable: true }
    }

    const now = Date.now()
    const userId = createId('user')
    const passwordHash = await bcrypt.hash(payload.password, 10)
    await pool.query(
      'INSERT INTO users (id, username, password_hash, display_name, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, passwordHash, displayName, now, now]
    )
    const profile = await upsertMysqlProfile(displayName, 'account', userId, pool)
    const session = makeSession(userId, username, displayName, 'account', true)
    await setCurrentSession(session, profile?.id)
    return { ok: true, message: '注册成功', session, profile, dbAvailable: true }
  })

  if (result) {
    return result
  }

  return { ok: false, message: `MySQL 不可用，无法注册账号：${dbUnavailableReason || '连接失败'}`, session: null, profile: null, dbAvailable: false }
})

ipcMain.handle('auth:login', async (_event, payload: { username: string; password: string }): Promise<AuthResultRecord> => {
  const username = payload.username.trim()
  if (!username || !payload.password) {
    return { ok: false, message: '请输入账号和密码', session: null, profile: null, dbAvailable: dbReady }
  }

  const result = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ? LIMIT 1', [username])
    const user = rows[0]
    if (!user) {
      return { ok: false, message: '账号不存在', session: null, profile: null, dbAvailable: true }
    }

    const matched = await bcrypt.compare(payload.password, String(user.password_hash))
    if (!matched) {
      return { ok: false, message: '密码错误', session: null, profile: null, dbAvailable: true }
    }

    const now = Date.now()
    await pool.query('UPDATE users SET last_login_at = ? WHERE id = ?', [now, user.id])
    const profile = await upsertMysqlProfile(String(user.display_name), 'account', String(user.id), pool)
    const session = makeSession(String(user.id), String(user.username), String(user.display_name), 'account', true)
    await setCurrentSession(session, profile?.id)
    return { ok: true, message: '登录成功', session, profile, dbAvailable: true }
  })

  if (result) {
    return result
  }

  return { ok: false, message: `MySQL 不可用，已保留本地模式：${dbUnavailableReason || '连接失败'}`, session: null, profile: null, dbAvailable: false }
})

ipcMain.handle('profiles:list', async () => {
  const session = await getCurrentSession()
  const mysqlProfiles = await withDb(async (pool) => {
    if (session?.mode === 'account' && session.userId) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE user_id = ? ORDER BY last_login_at DESC', [session.userId])
      return rows.map(toProfile)
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE mode = ? ORDER BY last_login_at DESC LIMIT 12', ['guest'])
    return rows.map(toProfile)
  })

  return mysqlProfiles ?? listLocalProfiles()
})

ipcMain.handle('profiles:upsert', async (_event, name: string) => {
  const session = await getCurrentSession()
  const mode = session?.mode === 'account' ? 'account' : 'guest'
  const userId = mode === 'account' ? session?.userId ?? null : null
  const mysqlProfile = await upsertMysqlProfile(name, mode, userId)

  if (mysqlProfile) {
    await setCurrentSession(makeSession(userId, session?.username ?? null, mysqlProfile.name, mode, true), mysqlProfile.id)
    return mysqlProfile
  }

  return upsertLocalProfile(name, 'local', null)
})

ipcMain.handle('profiles:setCurrent', async (_event, profileId: string) => {
  const mysqlProfile = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE id = ? LIMIT 1', [profileId])
    if (!rows[0]) {
      return null
    }

    const now = Date.now()
    await pool.query('UPDATE profiles SET last_login_at = ? WHERE id = ?', [now, profileId])
    return { ...toProfile(rows[0]), lastLoginAt: now }
  })

  if (mysqlProfile) {
    const session = await getCurrentSession()
    await setCurrentSession(makeSession(mysqlProfile.userId ?? session?.userId ?? null, session?.username ?? null, mysqlProfile.name, mysqlProfile.mode ?? 'guest', true), mysqlProfile.id)
    return mysqlProfile
  }

  const profiles = await listLocalProfiles()
  const profile = profiles.find(item => item.id === profileId)
  if (!profile) {
    return null
  }
  profile.lastLoginAt = Date.now()
  await writeLocalProfiles(profiles)
  await setCurrentSession(makeSession(null, null, profile.name, 'local', false), profile.id)
  return profile
})

ipcMain.handle('profiles:getCurrent', async () => {
  const store = await getStore()
  const profileId = store.get(CURRENT_PROFILE_KEY)
  if (typeof profileId !== 'string') {
    return null
  }

  const mysqlProfile = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE id = ? LIMIT 1', [profileId])
    return rows[0] ? toProfile(rows[0]) : null
  })

  if (mysqlProfile) {
    return mysqlProfile
  }

  const profiles = await listLocalProfiles()
  return profiles.find(profile => profile.id === profileId) ?? null
})

ipcMain.handle('saves:list', async (_event, profileId: string) => {
  const mysqlSaves = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM saves WHERE profile_id = ? ORDER BY saved_at DESC', [profileId])
    return rows.map(row => saveToMeta({
      slotId: String(row.slot_id),
      profileId: String(row.profile_id),
      label: String(row.label),
      savedAt: Number(row.saved_at),
      data: typeof row.save_json === 'string' ? JSON.parse(row.save_json) : row.save_json
    }))
  })

  if (mysqlSaves) {
    return mysqlSaves
  }

  const localSaves = await listLocalSaves(profileId)
  return localSaves.map(saveToMeta)
})

ipcMain.handle('saves:write', async (_event, payload: SaveSlotRecord) => {
  const nextRecord = { ...payload, savedAt: Date.now() }
  const mysqlResult = await withDb(async (pool) => {
    await pool.query(
      `INSERT INTO saves (profile_id, slot_id, label, save_json, saved_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE label = VALUES(label), save_json = VALUES(save_json), saved_at = VALUES(saved_at)`,
      [nextRecord.profileId, nextRecord.slotId, nextRecord.label, JSON.stringify(nextRecord.data), nextRecord.savedAt]
    )
    return nextRecord
  })

  await writeLocalSave(nextRecord)
  return mysqlResult ?? nextRecord
})

ipcMain.handle('saves:read', async (_event, profileId: string, slotId: string) => {
  const mysqlSave = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT save_json FROM saves WHERE profile_id = ? AND slot_id = ? LIMIT 1', [profileId, slotId])
    const value = rows[0]?.save_json
    if (!value) {
      return null
    }
    return typeof value === 'string' ? JSON.parse(value) : value
  })

  return mysqlSave ?? readLocalSave(profileId, slotId)
})

ipcMain.handle('saves:delete', async (_event, profileId: string, slotId: string) => {
  await withDb(async (pool) => {
    await pool.query('DELETE FROM saves WHERE profile_id = ? AND slot_id = ?', [profileId, slotId])
    return true
  })

  await deleteLocalSave(profileId, slotId)
  return true
})

ipcMain.handle('progress:get', async (_event, profileId: string) => {
  const mysqlProgress = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT unlocked_acts_json FROM progress WHERE profile_id = ? LIMIT 1', [profileId])
    const value = rows[0]?.unlocked_acts_json
    return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null
  })

  if (mysqlProgress) {
    return mysqlProgress
  }

  const store = await getStore()
  const allProgress = store.get(LOCAL_PROGRESS_KEY)
  return typeof allProgress === 'object' && allProgress !== null ? (allProgress as Record<string, unknown>)[profileId] ?? null : null
})

ipcMain.handle('progress:set', async (_event, profileId: string, unlockedActIds: string[]) => {
  const updatedAt = Date.now()
  await withDb(async (pool) => {
    await pool.query(
      `INSERT INTO progress (profile_id, unlocked_acts_json, updated_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE unlocked_acts_json = VALUES(unlocked_acts_json), updated_at = VALUES(updated_at)`,
      [profileId, JSON.stringify(unlockedActIds), updatedAt]
    )
    return true
  })

  const store = await getStore()
  const allProgress = store.get(LOCAL_PROGRESS_KEY)
  const nextProgress = typeof allProgress === 'object' && allProgress !== null ? { ...allProgress as Record<string, unknown> } : {}
  nextProgress[profileId] = unlockedActIds
  store.set(LOCAL_PROGRESS_KEY, nextProgress)
  return true
})

ipcMain.handle('achievements:get', async (_event, profileId: string) => {
  const mysqlAchievements = await withDb(async (pool) => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT achievements_json FROM achievements WHERE profile_id = ? LIMIT 1', [profileId])
    const value = rows[0]?.achievements_json
    return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null
  })

  if (mysqlAchievements) {
    return mysqlAchievements
  }

  const store = await getStore()
  const allAchievements = store.get(LOCAL_ACHIEVEMENTS_KEY)
  return typeof allAchievements === 'object' && allAchievements !== null ? (allAchievements as Record<string, unknown>)[profileId] ?? null : null
})

ipcMain.handle('achievements:set', async (_event, profileId: string, achievementIds: string[]) => {
  const updatedAt = Date.now()
  await withDb(async (pool) => {
    await pool.query(
      `INSERT INTO achievements (profile_id, achievements_json, updated_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE achievements_json = VALUES(achievements_json), updated_at = VALUES(updated_at)`,
      [profileId, JSON.stringify(achievementIds), updatedAt]
    )
    return true
  })

  const store = await getStore()
  const allAchievements = store.get(LOCAL_ACHIEVEMENTS_KEY)
  const nextAchievements = typeof allAchievements === 'object' && allAchievements !== null ? { ...allAchievements as Record<string, unknown> } : {}
  nextAchievements[profileId] = achievementIds
  store.set(LOCAL_ACHIEVEMENTS_KEY, nextAchievements)
  return true
})

ipcMain.handle('config:setApiKey', async (_event, apiKey: string) => {
  const store = await getStore()
  store.set('dashscopeApiKey', apiKey)
})

ipcMain.handle('config:getApiKey', async () => {
  return getApiKeyFromEnvOrStore()
})

ipcMain.handle('settings:get', async () => {
  return readAppSettings()
})

ipcMain.handle('settings:set', async (_event, settings: AppSettingsRecord) => {
  const normalized = normalizeAppSettings(settings)
  const store = await getStore()
  store.set(APP_SETTINGS_KEY, normalized)
  return normalized
})

ipcMain.handle('app:getReleaseInfo', async () => {
  const userDataPath = app.getPath('userData')
  return {
    appName: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    userDataPath,
    logsPath: path.join(userDataPath, 'logs')
  }
})

ipcMain.handle('app:log', async (_event, payload: AppLogPayload) => {
  return writeAppLog(payload)
})

ipcMain.handle('app:openUserDataPath', async (): Promise<AppPathActionResult> => {
  const targetPath = app.getPath('userData')
  return openLocalPath(targetPath)
})

ipcMain.handle('app:openLogsPath', async (): Promise<AppPathActionResult> => {
  const targetPath = path.join(app.getPath('userData'), 'logs')
  await fs.mkdir(targetPath, { recursive: true })
  return openLocalPath(targetPath)
})

ipcMain.handle('app:exportLogs', async (): Promise<AppPathActionResult> => {
  const userDataPath = app.getPath('userData')
  const logsPath = path.join(userDataPath, 'logs')
  const exportRoot = path.join(userDataPath, 'exports')
  const exportPath = path.join(exportRoot, `logs-${formatFileTimestamp(new Date())}`)

  try {
    await fs.mkdir(exportRoot, { recursive: true })
    await fs.mkdir(exportPath, { recursive: true })
    await fs.cp(logsPath, exportPath, { recursive: true, force: true })
    await fs.writeFile(path.join(exportPath, 'README.txt'), [
      'AI 校园生存模拟器日志导出',
      `Version: ${app.getVersion()}`,
      `ExportedAt: ${new Date().toISOString()}`,
      '请把整个文件夹发送给支持人员。'
    ].join('\n'), 'utf8')
    return { ok: true, path: exportPath }
  } catch (err) {
    return {
      ok: false,
      path: exportPath,
      message: err instanceof Error ? err.message : '日志导出失败'
    }
  }
})

async function openLocalPath(targetPath: string): Promise<AppPathActionResult> {
  try {
    const errorMessage = await shell.openPath(targetPath)
    return errorMessage
      ? { ok: false, path: targetPath, message: errorMessage }
      : { ok: true, path: targetPath }
  } catch (err) {
    return {
      ok: false,
      path: targetPath,
      message: err instanceof Error ? err.message : '打开目录失败'
    }
  }
}

function formatFileTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-')
}
