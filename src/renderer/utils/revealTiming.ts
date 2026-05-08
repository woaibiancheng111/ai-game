import type { ConversationMessage } from '../../data/types'

const ROLE_BASE_DELAY: Record<ConversationMessage['role'], number> = {
  player: 360,
  npc: 420,
  system: 520,
  narration: 420,
  education: 820
}

const ROLE_PER_CHAR_DELAY: Record<ConversationMessage['role'], number> = {
  player: 8,
  npc: 10,
  system: 12,
  narration: 5,
  education: 14
}

const ROLE_MAX_DELAY: Record<ConversationMessage['role'], number> = {
  player: 900,
  npc: 1500,
  system: 1800,
  narration: 1350,
  education: 3000
}

export function getMessageRevealDelay(message: Pick<ConversationMessage, 'role' | 'content'> | undefined, isFirstMessage = false): number {
  if (!message) {
    return 320
  }

  const baseDelay = ROLE_BASE_DELAY[message.role]
  const perCharDelay = ROLE_PER_CHAR_DELAY[message.role]
  const maxDelay = ROLE_MAX_DELAY[message.role]
  const contentLength = message.content.trim().length
  const firstMessageAdjustment = isFirstMessage ? -220 : 0

  return Math.max(220, Math.min(maxDelay, baseDelay + contentLength * perCharDelay + firstMessageAdjustment))
}

export function getMessagesRevealDelay(messages: ConversationMessage[]): number {
  return messages.reduce((total, message, index) => {
    return total + getMessageRevealDelay(message, index === 0)
  }, 0)
}
