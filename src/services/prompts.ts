import type { NPCCharacter, PlayerStatus, NPCAffection } from '../data/types'
import type { ChatMessage } from './llm'

export interface PromptContext {
  npc: NPCCharacter
  playerName: string
  playerStatus: PlayerStatus
  npcAffection: NPCAffection
  currentLocation: string
  recentHistory: string
  week: number
  day: number
}

export function buildSystemPrompt(npc: NPCCharacter): string {
  return `${npc.systemPrompt}

## 对话规则
1. 以第一人称回复，符合{npc.name}的角色设定
2. 回复简洁自然，通常1-3句话
3. 不要生成选项菜单，只输出角色对话
4. 根据好感度调整语气：好感高时更亲切，好感低时更冷淡克制
5. 可以适当关心对方的学习和生活状态
6. 避免重复相同的回复模式`
}

export function buildContextPrompt(ctx: PromptContext): string {
  const { npc, playerName, playerStatus, npcAffection, currentLocation, recentHistory, week, day } = ctx
  const affection = npcAffection[npc.id] ?? 50

  let affectionTone = '普通'
  if (affection >= 70) affectionTone = '亲密友好'
  else if (affection >= 50) affectionTone = '友善'
  else if (affection >= 30) affectionTone = '一般'
  else affectionTone = '冷淡疏远'

  return `## 当前情境
- 时间：第${week}周 周${['一', '二', '三', '四', '五', '六', '日'][((day - 1) % 7)]}
- 地点：${currentLocation}
- NPC好感度：${affection}（${affectionTone}）

## 玩家状态
- 姓名：${playerName}
- GPA：${playerStatus.gpa.toFixed(2)}
- 金钱：¥${playerStatus.money}
- 社交值：${playerStatus.social}
- 声誉：${playerStatus.reputation}
- 精力：${playerStatus.energy}

## 近期互动摘要
${recentHistory || '暂无历史对话'}

## 请以${npc.name}的身份回复`
}

export function buildConversationPrompt(
  npc: NPCCharacter,
  messages: ChatMessage[],
  ctx: PromptContext
): ChatMessage[] {
  const systemPrompt = buildSystemPrompt(npc)
  const contextPrompt = buildContextPrompt(ctx)

  return [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: contextPrompt },
    ...messages.slice(-10),
    { role: 'user', content: '请继续对话。' }
  ]
}

export function buildNarrationPrompt(
  description: string,
  ctx: PromptContext
): string {
  return `## 叙事指令
当前场景：${description}
地点：${ctx.currentLocation}
时间：第${ctx.week}周

请根据以上场景，用一段富有画面感的文字描述正在发生的事情（50-100字），营造游戏氛围。`
}
