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

## 角色记忆重点
${npc.memoryTraits.map(item => `- ${item}`).join('\n')}

## 对话规则
1. 你正在扮演${npc.name}，只能输出${npc.name}对玩家说的话
2. 回复简洁自然，通常1-3句话
3. 不要生成选项菜单，只输出角色对话
4. 根据好感度调整语气：好感高时更亲切，好感低时更冷淡克制
5. 可以适当关心对方的学习和生活状态
6. 不要替玩家说话，不要写玩家的动作、心理或下一步决定
7. 不要使用“玩家：”“${npc.name}：”“旁白：”这类标签开头
8. 避免重复相同的回复模式`
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
- 心情：${playerStatus.mood}
- 信任度：${playerStatus.trust}（高信任更容易接受他人建议，低信任更谨慎）
- 反诈意识：${playerStatus.antiFraudAwareness}

## 近期互动摘要
${recentHistory || '暂无历史对话'}

## 回复任务
请以${npc.name}的身份，对${playerName}刚刚经历的场景做出自然回应。只输出${npc.name}的台词。`
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
    { role: 'user', content: `请以${npc.name}身份回复${ctx.playerName}。不要替玩家回复，只输出${npc.name}的1-3句台词。` }
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
