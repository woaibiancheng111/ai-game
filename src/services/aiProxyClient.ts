import type { AppSettings, GameState, NPCCharacter, StoryNode } from '../data/types'
import type { ChatMessage, LLMOptions, LLMStreamHandlers } from './llm'

export interface AIProxyContext {
  npc: NPCCharacter
  playerName: string
  currentNode: StoryNode
  gameState: GameState
}

export interface AIProxyResult {
  ok: boolean
  text: string
  errorCode?: string
  message?: string
}

export class AIProxyClient {
  async chat(
    messages: ChatMessage[],
    context: AIProxyContext,
    options: LLMOptions,
    settings: AppSettings
  ): Promise<AIProxyResult> {
    if (!settings.aiEnabled) {
      return { ok: false, text: '', errorCode: 'ai_disabled', message: 'AI 对话已关闭' }
    }

    return window.electronAPI.aiProxy.chat({
      messages,
      context: serializeContext(context),
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      proxyUrl: settings.aiProxyUrl
    })
  }

  async chatStream(
    messages: ChatMessage[],
    context: AIProxyContext,
    options: LLMOptions,
    settings: AppSettings,
    handlers: LLMStreamHandlers = {}
  ): Promise<AIProxyResult> {
    if (!settings.aiEnabled) {
      return { ok: false, text: '', errorCode: 'ai_disabled', message: 'AI 对话已关闭' }
    }

    if (!settings.aiAllowStreaming) {
      return this.chat(messages, context, options, settings)
    }

    const requestId = `proxy-stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    return new Promise<AIProxyResult>((resolve) => {
      let partialText = ''
      let completed = false
      const cleanups: Array<() => void> = []
      const streamThrottle = createFrameThrottle(handlers.onChunk)

      const finalize = (result: AIProxyResult) => {
        if (completed) {
          return
        }

        completed = true
        streamThrottle.flush()
        for (const cleanup of cleanups) {
          cleanup()
        }
        resolve(result)
      }

      cleanups.push(window.electronAPI.aiProxy.onChatStreamChunk(({ requestId: incomingId, chunk }) => {
        if (incomingId !== requestId) {
          return
        }

        partialText += chunk
        streamThrottle.push(partialText, chunk)
      }))

      cleanups.push(window.electronAPI.aiProxy.onChatStreamEnd(({ requestId: incomingId }) => {
        if (incomingId === requestId) {
          finalize({ ok: true, text: partialText })
        }
      }))

      cleanups.push(window.electronAPI.aiProxy.onChatStreamError(({ requestId: incomingId, error, errorCode }) => {
        if (incomingId === requestId) {
          finalize({ ok: false, text: partialText, errorCode, message: error || 'AI 代理流式输出失败' })
        }
      }))

      window.electronAPI.aiProxy.chatStream({
        requestId,
        messages,
        context: serializeContext(context),
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        proxyUrl: settings.aiProxyUrl
      }).then((started) => {
        if (!started) {
          finalize({ ok: false, text: partialText, errorCode: 'stream_start_failed', message: 'AI 代理流式输出启动失败' })
        }
      }).catch((err) => {
        finalize({ ok: false, text: partialText, errorCode: 'stream_exception', message: err instanceof Error ? err.message : 'AI 代理流式输出异常' })
      })
    })
  }
}

export const aiProxyClient = new AIProxyClient()

function serializeContext(context: AIProxyContext) {
  return {
    npcId: context.npc.id,
    npcName: context.npc.name,
    nodeId: context.currentNode.id,
    location: context.currentNode.location,
    playerName: context.playerName,
    playerStatus: context.gameState.playerStatus,
    npcAffection: context.gameState.npcAffection,
    flags: context.gameState.flags,
    week: context.gameState.week,
    day: context.gameState.day
  }
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
