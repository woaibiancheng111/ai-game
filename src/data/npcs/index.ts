import type { NPCCharacter } from '../types'
import { ALL_NPCS } from './xuejie'

export type { NPCCharacter } from '../types'
export {
  XUEJIE_NPC,
  XIAOMING_NPC,
  DAZHI_NPC,
  XIAOJIE_NPC,
  WANG_LAOSHI_NPC,
  LI_XUEZHANG_NPC,
  XIAOMEI_NPC,
  ZHANG_ZONG_NPC,
  AQIANG_NPC,
  ALL_NPCS
} from './xuejie'

export function getNPCById(id: string): NPCCharacter | undefined {
  return ALL_NPCS[id]
}
