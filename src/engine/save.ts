import type { ConversationMessage, GameSaveData, GameState } from '../data/types'

export const AUTOSAVE_KEY = 'save:autosave'
export const AUTOSAVE_SLOT_ID = 'autosave'
export const UNLOCKED_ACTS_KEY = 'progress:unlockedActs'

export function createSaveData(gameState: GameState, messages: ConversationMessage[]): GameSaveData {
  return {
    version: '2',
    savedAt: Date.now(),
    gameState,
    conversationHistories: {
      main: messages
    }
  }
}
