import type { AppSettings } from '../data/types'

export const DEFAULT_AI_PROXY_URL = 'https://ai.shixi.chat/chat'

export const DEFAULT_APP_SETTINGS: AppSettings = {
  aiEnabled: true,
  aiAllowStreaming: true,
  aiProxyUrl: DEFAULT_AI_PROXY_URL,
  bgmEnabled: true,
  sfxEnabled: true,
  masterVolume: 0.5,
  errorLoggingEnabled: true
}

export function normalizeAppSettings(value: unknown): AppSettings {
  if (typeof value !== 'object' || value === null) {
    return { ...DEFAULT_APP_SETTINGS }
  }

  const maybeSettings = value as Partial<AppSettings>
  return {
    aiEnabled: typeof maybeSettings.aiEnabled === 'boolean' ? maybeSettings.aiEnabled : DEFAULT_APP_SETTINGS.aiEnabled,
    aiAllowStreaming: typeof maybeSettings.aiAllowStreaming === 'boolean' ? maybeSettings.aiAllowStreaming : DEFAULT_APP_SETTINGS.aiAllowStreaming,
    aiProxyUrl: typeof maybeSettings.aiProxyUrl === 'string' && maybeSettings.aiProxyUrl.trim()
      ? maybeSettings.aiProxyUrl.trim()
      : DEFAULT_APP_SETTINGS.aiProxyUrl,
    bgmEnabled: typeof maybeSettings.bgmEnabled === 'boolean' ? maybeSettings.bgmEnabled : DEFAULT_APP_SETTINGS.bgmEnabled,
    sfxEnabled: typeof maybeSettings.sfxEnabled === 'boolean' ? maybeSettings.sfxEnabled : DEFAULT_APP_SETTINGS.sfxEnabled,
    masterVolume: clampVolume(maybeSettings.masterVolume),
    errorLoggingEnabled: typeof maybeSettings.errorLoggingEnabled === 'boolean'
      ? maybeSettings.errorLoggingEnabled
      : DEFAULT_APP_SETTINGS.errorLoggingEnabled
  }
}

export async function loadAppSettings(): Promise<AppSettings> {
  if (window.electronAPI.settings?.get) {
    return normalizeAppSettings(await window.electronAPI.settings.get())
  }

  return normalizeAppSettings(await window.electronAPI.storage.get('settings:app'))
}

export async function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  const normalized = normalizeAppSettings(settings)
  if (window.electronAPI.settings?.set) {
    await window.electronAPI.settings.set(normalized)
  } else {
    await window.electronAPI.storage.set('settings:app', normalized)
  }
  return normalized
}

export function mergeAppSettings(current: AppSettings, patch: Partial<AppSettings>): AppSettings {
  return normalizeAppSettings({
    ...current,
    ...patch
  })
}

function clampVolume(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_APP_SETTINGS.masterVolume
  }

  return Math.max(0, Math.min(1, value))
}
