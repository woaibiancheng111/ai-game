import type { NPCCharacter } from '../types'
import { ALL_NPCS } from './xuejie'

export type { NPCCharacter } from '../types'
export { XUEJIE_NPC, ALL_NPCS } from './xuejie'

export function getNPCById(id: string): NPCCharacter | undefined {
  return ALL_NPCS[id]
}
