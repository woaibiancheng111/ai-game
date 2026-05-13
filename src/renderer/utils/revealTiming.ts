import type { ConversationMessage } from '../../data/types'

const ROLE_BASE_DELAY: Record<ConversationMessage['role'], number> = {
  player: 300,
  npc: 400,
  system: 500,
  narration: 600,
  education: 800
}

const ROLE_PER_CHAR_DELAY: Record<ConversationMessage['role'], number> = {
  player: 15,
  npc: 20,
  system: 20,
  narration: 25,
  education: 15
}

const ROLE_MAX_DELAY: Record<ConversationMessage['role'], number> = {
  player: 1200,
  npc: 2500,
  system: 2000,
  narration: 3000,
  education: 4000
}

/**
 * 获取一条消息所需的阅读时间（毫秒）。
 * 下一条消息将在等待这个时间后才会弹出。
 */
export function getMessageRevealDelay(message: Pick<ConversationMessage, 'role' | 'content'> | undefined): number {
  if (isFastRevealEnabled()) {
    return 20
  }

  if (!message) {
    return 300
  }

  const baseDelay = ROLE_BASE_DELAY[message.role]
  const perCharDelay = ROLE_PER_CHAR_DELAY[message.role]
  const maxDelay = ROLE_MAX_DELAY[message.role]
  const contentLength = message.content.trim().length

  return Math.max(300, Math.min(maxDelay, baseDelay + contentLength * perCharDelay))
}

/**
 * 汇总一批消息的总阅读时间，用于在 App 层控制流程阻塞时间。
 */
export function getMessagesRevealDelay(messages: ConversationMessage[]): number {
  return messages.reduce((total, message) => {
    return total + getMessageRevealDelay(message)
  }, 0)
}

function isFastRevealEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  return params.get('fastReveal') === '1' || window.localStorage.getItem('aiGameFastReveal') === '1'
}
