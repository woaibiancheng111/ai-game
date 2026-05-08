import type { NPCCharacter } from '../data/types'
import { ALL_NPCS } from '../data/npcs'

export function getNPCById(id: string): NPCCharacter | undefined {
  return ALL_NPCS[id]
}

export function getNPCDisplayName(id?: string): string {
  if (!id) {
    return '旁白'
  }

  return ALL_NPCS[id]?.name ?? '未知角色'
}

export function getNPCInitial(id?: string): string {
  if (!id) {
    return '?'
  }

  return ALL_NPCS[id]?.avatarInitial ?? '?'
}

export function getKeyAffectionEntries(affection: Record<string, number>, limit = 3): Array<{ npc: NPCCharacter; value: number }> {
  const preferredOrder = ['xuejie', 'dazhi', 'xiaojie', 'li_xuezhang', 'wang_laoshi', 'xiaoming']
  return preferredOrder
    .map(id => {
      const npc = ALL_NPCS[id]
      if (!npc) {
        return null
      }

      return {
        npc,
        value: affection[id] ?? npc.initialAffection
      }
    })
    .filter((entry): entry is { npc: NPCCharacter; value: number } => Boolean(entry))
    .slice(0, limit)
}

export function getNPCFallbackLine(id?: string): string | null {
  if (!id) {
    return null
  }

  const lines = ALL_NPCS[id]?.fallbackLines
  if (!lines || lines.length === 0) {
    return null
  }

  return lines[0]
}
