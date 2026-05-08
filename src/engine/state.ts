import type { GameFlags, GameState, PlayerChoice, PlayerStatus } from '../data/types'
import { ALL_NPCS } from '../data/npcs'

const STATUS_LIMITS: Record<keyof PlayerStatus, { min: number; max: number }> = {
  gpa: { min: 0, max: 4 },
  money: { min: 0, max: 5000 },
  social: { min: 0, max: 100 },
  reputation: { min: 0, max: 100 },
  energy: { min: 0, max: 100 },
  mood: { min: 0, max: 100 },
  trust: { min: 0, max: 100 },
  antiFraudAwareness: { min: 0, max: 100 }
}

const INITIAL_STATUS: PlayerStatus = {
  gpa: 3,
  money: 2000,
  social: 50,
  reputation: 50,
  energy: 100,
  mood: 70,
  trust: 45,
  antiFraudAwareness: 25
}

export function clampStatusValue(key: keyof PlayerStatus, value: number): number {
  const limits = STATUS_LIMITS[key]
  return Math.min(limits.max, Math.max(limits.min, value))
}

export function createInitialAffection(): Record<string, number> {
  return Object.fromEntries(
    Object.values(ALL_NPCS).map(npc => [npc.id, npc.initialAffection])
  )
}

export function createInitialGameState(playerName = '新生'): GameState {
  return {
    playerName,
    playerStatus: { ...INITIAL_STATUS },
    npcAffection: createInitialAffection(),
    currentAct: 1,
    currentActId: 'act1',
    currentNode: 'act1_start',
    currentLocation: '校门口',
    currentSceneImageUrl: undefined,
    week: 1,
    day: 1,
    flags: {},
    visitedNodes: [],
    conversationSummaries: {}
  }
}

export function createChapterGameState(playerName: string, actId: string): GameState {
  const base = createInitialGameState(playerName)

  if (actId === 'act2') {
    return {
      ...base,
      currentAct: 2,
      currentActId: 'act2',
      currentNode: 'act2_military_training',
      currentLocation: '操场',
      week: 2,
      day: 2,
      flags: {
        chapterStartAct2: true
      },
      visitedNodes: ['act1_start', 'act1_end']
    }
  }

  if (actId === 'act3') {
    return {
      ...base,
      currentAct: 3,
      currentActId: 'act3',
      currentNode: 'act3_honey_trap',
      currentLocation: '食堂门口',
      week: 6,
      day: 2,
      playerStatus: {
        ...base.playerStatus,
        antiFraudAwareness: 42,
        trust: 48,
        social: 58
      },
      flags: {
        chapterStartAct3: true,
        joinedPartTimeGroup: true
      },
      visitedNodes: ['act1_start', 'act1_end', 'act2_military_training', 'act2_xiaojie_warning']
    }
  }

  if (actId === 'act4') {
    return {
      ...base,
      currentAct: 4,
      currentActId: 'act4',
      currentNode: 'act4_rebuild_week',
      currentLocation: '宿舍楼 308',
      week: 10,
      day: 2,
      playerStatus: {
        ...base.playerStatus,
        antiFraudAwareness: 66,
        social: 60,
        mood: 62
      },
      flags: {
        chapterStartAct4: true,
        avoidedScam: true,
        completedAntiFraudArc: true
      },
      visitedNodes: ['act1_start', 'act1_end', 'act2_military_training', 'act3_honey_trap', 'ending_growth']
    }
  }

  if (actId === 'act5') {
    return {
      ...base,
      currentAct: 5,
      currentActId: 'act5',
      currentNode: 'act5_final_month',
      currentLocation: '图书馆',
      week: 15,
      day: 1,
      playerStatus: {
        ...base.playerStatus,
        gpa: 3.2,
        antiFraudAwareness: 72,
        social: 64,
        mood: 68
      },
      flags: {
        chapterStartAct5: true,
        completedAntiFraudArc: true,
        builtSupportMap: true
      },
      visitedNodes: ['act1_start', 'act1_end', 'act2_military_training', 'act3_honey_trap', 'act4_rebuild_week', 'act4_club_project']
    }
  }

  if (actId === 'act6') {
    return {
      ...base,
      currentAct: 6,
      currentActId: 'act6',
      currentNode: 'act6_sophomore_crossroads',
      currentLocation: '学院大厅',
      week: 20,
      day: 1,
      playerStatus: {
        ...base.playerStatus,
        gpa: 3.18,
        antiFraudAwareness: 74,
        social: 62,
        reputation: 62,
        mood: 70
      },
      flags: {
        chapterStartAct6: true,
        firstYearCompleted: true,
        handbookReady: true
      },
      visitedNodes: ['act1_start', 'act1_end', 'act2_military_training', 'act3_honey_trap', 'act4_rebuild_week', 'act5_first_year_close']
    }
  }

  if (actId === 'act7') {
    return {
      ...base,
      currentAct: 7,
      currentActId: 'act7',
      currentNode: 'act7_junior_choice',
      currentLocation: '学院走廊',
      week: 45,
      day: 2,
      playerStatus: {
        ...base.playerStatus,
        gpa: 3.25,
        antiFraudAwareness: 78,
        social: 66,
        reputation: 68,
        mood: 66
      },
      flags: {
        chapterStartAct7: true,
        choseCampusSafetyTrack: true,
        repairedTeamProcess: true
      },
      visitedNodes: ['act1_start', 'act1_end', 'act5_first_year_close', 'act6_sophomore_crossroads', 'act6_relationship_test']
    }
  }

  if (actId === 'act8') {
    return {
      ...base,
      currentAct: 8,
      currentActId: 'act8',
      currentNode: 'act8_senior_year',
      currentLocation: '学院公告栏',
      week: 70,
      day: 1,
      playerStatus: {
        ...base.playerStatus,
        gpa: 3.28,
        antiFraudAwareness: 82,
        social: 70,
        reputation: 74,
        mood: 68
      },
      flags: {
        chapterStartAct8: true,
        handbookReady: true,
        builtPeerSupportGroup: true,
        chosePeopleImpact: true
      },
      visitedNodes: ['act1_start', 'act1_end', 'act5_first_year_close', 'act6_sophomore_crossroads', 'act7_junior_choice', 'act7_value_conflict']
    }
  }

  return base
}

export function mergeFlags(base: GameFlags, next?: GameFlags): GameFlags {
  if (!next) {
    return base
  }

  return {
    ...base,
    ...next
  }
}

export function doFlagsMatch(current: GameFlags, required?: GameFlags): boolean {
  if (!required) {
    return true
  }

  return Object.entries(required).every(([key, expected]) => current[key] === expected)
}

export function getAvailableChoices(choiceSource: PlayerChoice[] | undefined, flags: GameFlags): PlayerChoice[] {
  return (choiceSource ?? []).filter(choice => doFlagsMatch(flags, choice.requiredFlags))
}

export function applyChoiceToGameState(prev: GameState, choice: PlayerChoice): GameState {
  const nextStatus: PlayerStatus = { ...prev.playerStatus }

  if (choice.statusChanges) {
    for (const [statusKey, delta] of Object.entries(choice.statusChanges) as Array<[keyof PlayerStatus, number | undefined]>) {
      nextStatus[statusKey] = clampStatusValue(statusKey, nextStatus[statusKey] + (delta ?? 0))
    }
  }

  const nextAffection = { ...prev.npcAffection }
  if (choice.affectionChanges) {
    for (const [npcId, delta] of Object.entries(choice.affectionChanges)) {
      const current = nextAffection[npcId] ?? ALL_NPCS[npcId]?.initialAffection ?? 50
      nextAffection[npcId] = Math.min(100, Math.max(0, current + (delta ?? 0)))
    }
  }

  return {
    ...prev,
    playerStatus: nextStatus,
    npcAffection: nextAffection,
    flags: mergeFlags(prev.flags, choice.setFlags),
    endingId: choice.endingId ?? prev.endingId
  }
}

export function enterNode(prev: GameState, node: {
  id: string
  actId?: string
  location: string
  week?: number
  day?: number
  sceneImageUrl?: string
  setFlags?: GameFlags
  endingId?: string
}): GameState {
  const actId = node.actId ?? prev.currentActId
  const numericAct = Number(actId.replace('act', ''))

  return {
    ...prev,
    currentActId: actId,
    currentAct: Number.isFinite(numericAct) ? numericAct : prev.currentAct,
    currentNode: node.id,
    currentLocation: node.location,
    currentSceneImageUrl: node.sceneImageUrl ?? prev.currentSceneImageUrl,
    week: node.week ?? prev.week,
    day: node.day ?? prev.day,
    flags: mergeFlags(prev.flags, node.setFlags),
    visitedNodes: prev.visitedNodes.includes(node.id) ? prev.visitedNodes : [...prev.visitedNodes, node.id],
    endingId: node.endingId ?? prev.endingId
  }
}
