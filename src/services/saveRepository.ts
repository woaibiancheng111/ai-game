import type { GameSaveData, SaveSlotMeta } from '../data/types'
import { AUTOSAVE_KEY } from '../engine/save'

export interface SaveWriteInput {
  profileId: string
  slotId: string
  label: string
  data: GameSaveData
}

export class SaveRepository {
  async list(profileId: string): Promise<SaveSlotMeta[]> {
    return normalizeSaveSlots(await window.electronAPI.saves.list(profileId))
  }

  async read(profileId: string, slotId: string): Promise<GameSaveData | null> {
    return normalizeSaveData(await window.electronAPI.saves.read(profileId, slotId))
  }

  async readLegacyAutosave(): Promise<GameSaveData | null> {
    return normalizeSaveData(await window.electronAPI.storage.get(AUTOSAVE_KEY))
  }

  async write(input: SaveWriteInput): Promise<SaveSlotMeta> {
    const written = await window.electronAPI.saves.write({
      slotId: input.slotId,
      profileId: input.profileId,
      label: input.label,
      savedAt: Date.now(),
      data: input.data
    })
    return normalizeSaveSlotMeta(written, input.data)
  }

  async writeLegacyAutosave(data: GameSaveData): Promise<void> {
    await window.electronAPI.storage.set(AUTOSAVE_KEY, data)
  }

  async deleteLegacyAutosave(): Promise<void> {
    await window.electronAPI.storage.delete(AUTOSAVE_KEY)
  }
}

export const saveRepository = new SaveRepository()

export function normalizeSaveData(value: unknown): GameSaveData | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const maybeSave = value as Partial<GameSaveData>
  return maybeSave.version === '2' && typeof maybeSave.gameState === 'object' && maybeSave.gameState !== null
    ? maybeSave as GameSaveData
    : null
}

function normalizeSaveSlots(value: unknown): SaveSlotMeta[] {
  return Array.isArray(value) ? value.map(item => normalizeSaveSlotMeta(item)).filter((item): item is SaveSlotMeta => Boolean(item)) : []
}

function normalizeSaveSlotMeta(value: unknown, fallbackSave?: GameSaveData): SaveSlotMeta {
  const maybeSlot = typeof value === 'object' && value !== null
    ? value as Partial<SaveSlotMeta> & { data?: unknown }
    : {}
  const saveData = normalizeSaveData(maybeSlot.data) ?? fallbackSave ?? null

  return {
    slotId: typeof maybeSlot.slotId === 'string' ? maybeSlot.slotId : 'unknown',
    profileId: typeof maybeSlot.profileId === 'string' ? maybeSlot.profileId : '',
    label: typeof maybeSlot.label === 'string' ? maybeSlot.label : '未命名存档',
    savedAt: typeof maybeSlot.savedAt === 'number' ? maybeSlot.savedAt : Date.now(),
    currentActId: typeof maybeSlot.currentActId === 'string' ? maybeSlot.currentActId : saveData?.gameState.currentActId ?? '',
    currentNode: typeof maybeSlot.currentNode === 'string' ? maybeSlot.currentNode : saveData?.gameState.currentNode ?? '',
    currentLocation: typeof maybeSlot.currentLocation === 'string' ? maybeSlot.currentLocation : saveData?.gameState.currentLocation ?? '',
    week: typeof maybeSlot.week === 'number' ? maybeSlot.week : saveData?.gameState.week ?? 0,
    day: typeof maybeSlot.day === 'number' ? maybeSlot.day : saveData?.gameState.day ?? 0,
    playerStatus: maybeSlot.playerStatus ?? saveData?.gameState.playerStatus ?? {
      gpa: 0,
      money: 0,
      social: 0,
      reputation: 0,
      energy: 0,
      mood: 0,
      trust: 0,
      antiFraudAwareness: 0
    }
  }
}
