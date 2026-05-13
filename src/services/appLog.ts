export type AppLogLevel = 'info' | 'warning' | 'error'

export interface AppLogPayload {
  level: AppLogLevel
  scope: string
  message: string
  details?: unknown
}

export async function logAppEvent(payload: AppLogPayload): Promise<void> {
  try {
    if (window.electronAPI.app?.log) {
      await window.electronAPI.app.log(payload)
      return
    }

    if (payload.level === 'error') {
      console.error(`[${payload.scope}] ${payload.message}`, payload.details)
    } else if (payload.level === 'warning') {
      console.warn(`[${payload.scope}] ${payload.message}`, payload.details)
    } else {
      console.info(`[${payload.scope}] ${payload.message}`, payload.details)
    }
  } catch {
    // Logging should never interrupt gameplay.
  }
}
