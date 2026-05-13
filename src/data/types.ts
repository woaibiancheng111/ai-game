export interface PlayerStatus {
  gpa: number
  money: number
  social: number
  reputation: number
  energy: number
  mood: number
  trust: number
  antiFraudAwareness: number
}

export interface NPCAffection {
  [npcId: string]: number
}

export type GameFlagValue = boolean | string | number

export interface GameFlags {
  [flag: string]: GameFlagValue
}

export interface GameState {
  playerName: string
  playerStatus: PlayerStatus
  npcAffection: NPCAffection
  currentAct: number
  currentActId: string
  currentNode: string
  currentLocation: string
  currentSceneImageUrl?: string
  week: number
  day: number
  flags: GameFlags
  visitedNodes: string[]
  conversationSummaries: Record<string, string>
  endingId?: string
}

export interface ConversationMessage {
  id: string
  role: 'player' | 'npc' | 'system' | 'narration' | 'education'
  content: string
  timestamp: number
  npcId?: string
  educationCard?: EducationCard
  isStreaming?: boolean
}

export interface EducationCard {
  id: string
  title: string
  category: '学习适应' | '宿舍生活' | '心理支持' | '反诈安全' | '求助路径'
  body: string
  checklist: string[]
  campusAction: string
}

export interface NPCCharacter {
  id: string
  name: string
  shortName: string
  roleTag: string
  avatarInitial: string
  identity: string
  personality: string
  memoryTraits: string[]
  avatarPrompt: string
  systemPrompt: string
  initialAffection: number
  fallbackLines?: string[]
}

export interface StoryNode {
  id: string
  actId?: string
  title: string
  description: string
  location: string
  week?: number
  day?: number
  npcId?: string
  imagePrompt?: string
  sceneImageUrl?: string
  requiredFlags?: GameFlags
  setFlags?: GameFlags
  playerChoices?: PlayerChoice[]
  autoProgress?: boolean
  isEnding?: boolean
  endingId?: string
  npcFallbackText?: string
}

export interface PlayerChoice {
  id: string
  text: string
  nextNodeId: string
  statusChanges?: Partial<PlayerStatus>
  affectionChanges?: Partial<NPCAffection>
  requiredFlags?: GameFlags
  setFlags?: GameFlags
  narrativeText?: string
  endingId?: string
}

export interface LLMResponse {
  text: string
  raw?: unknown
}

export interface GameSaveData {
  version: '2'
  savedAt: number
  gameState: GameState
  conversationHistories: Record<string, ConversationMessage[]>
}

export interface PlayerProfile {
  id: string
  name: string
  userId?: string | null
  mode?: 'account' | 'guest' | 'local'
  createdAt: number
  lastLoginAt: number
}

export interface SaveSlotMeta {
  slotId: string
  profileId: string
  label: string
  savedAt: number
  currentActId: string
  currentNode: string
  currentLocation: string
  week: number
  day: number
  playerStatus: PlayerStatus
}

export interface ChapterMeta {
  actId: string
  actNumber: number
  title: string
  subtitle: string
  description: string
  startNodeId: string
  unlockAfterActId?: string
  themes: string[]
}

export interface AuthSession {
  userId: string | null
  username: string | null
  displayName: string
  mode: 'account' | 'guest' | 'local'
  dbAvailable: boolean
}

export interface AuthResult {
  ok: boolean
  message: string
  session: AuthSession | null
  profile: PlayerProfile | null
  dbAvailable: boolean
}

export interface DbHealth {
  available: boolean
  mode: 'mysql' | 'local'
  message: string
}

export interface AppSettings {
  aiEnabled: boolean
  aiAllowStreaming: boolean
  aiProxyUrl: string
  bgmEnabled: boolean
  sfxEnabled: boolean
  masterVolume: number
  errorLoggingEnabled: boolean
}

export interface AppNotice {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
}

export interface AppReleaseInfo {
  appName: string
  version: string
  platform: string
  userDataPath: string
  logsPath: string
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  unlockHint: string
  category: '适应' | '反诈' | '求助' | '成长' | '毕业' | '羁绊'
  unlocked: boolean
  synced?: boolean
}

export interface SchoolContact {
  id: string
  label: string
  value: string
  description: string
}

export interface SchoolResourceLink {
  id: string
  label: string
  url: string
  description: string
}

export interface SchoolConfig {
  schoolName: string
  collegeName: string
  contacts: SchoolContact[]
  resources: SchoolResourceLink[]
  antiFraudNotice: string
}

export interface EndingReport {
  title: string
  typeLabel: '阶段复盘' | '最终人生结局'
  description: string
  level: 'good' | 'normal' | 'bad'
  scammed: boolean
  routeTags: string[]
  npcReview: string
  pitfallTip: string
  handbookAdvice: string[]
  nextActions: string[]
  schoolContacts: SchoolContact[]
  growthSummary: string
}
