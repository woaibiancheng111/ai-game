export interface PlayerStatus {
  gpa: number
  money: number
  social: number
  reputation: number
  energy: number
}

export interface NPCAffection {
  [npcId: string]: number
}

export interface GameState {
  playerName: string
  playerStatus: PlayerStatus
  npcAffection: NPCAffection
  currentAct: number
  currentNode: string
  currentLocation: string
  week: number
  day: number
  conversationSummaries: Record<string, string>
}

export interface ConversationMessage {
  id: string
  role: 'player' | 'npc' | 'system' | 'narration'
  content: string
  timestamp: number
  npcId?: string
}

export interface NPCCharacter {
  id: string
  name: string
  identity: string
  personality: string
  avatarPrompt: string
  systemPrompt: string
  initialAffection: number
}

export interface StoryNode {
  id: string
  title: string
  description: string
  location: string
  npcId?: string
  playerChoices?: PlayerChoice[]
  autoProgress?: boolean
  isEnding?: boolean
}

export interface PlayerChoice {
  id: string
  text: string
  nextNodeId: string
  statusChanges?: Partial<PlayerStatus>
  affectionChanges?: Partial<NPCAffection>
  narrativeText?: string
}

export interface LLMResponse {
  text: string
  raw?: unknown
}

export interface GameSaveData {
  version: string
  savedAt: number
  gameState: GameState
  conversationHistories: Record<string, ConversationMessage[]>
}
