import type { ConversationMessage, GameSaveData, GameState, PlayerChoice, StoryNode } from '../data/types'
import { getEducationCardForProgress } from '../data/education/cards'
import { applyChoiceToGameState, createChapterGameState, enterNode, mergeFlags } from './state'
import { canEnterNode, getChapterStartNode, getFirstNode, getNodeChoices, getStoryNode } from './story'

export interface RuntimeStartResult {
  node: StoryNode
  state: GameState
  messages: ConversationMessage[]
  choices: PlayerChoice[]
}

export type RuntimeChoiceResult =
  | {
      kind: 'missing'
      playerMessages: ConversationMessage[]
      historyMessages: ConversationMessage[]
      systemMessage: ConversationMessage
    }
  | {
      kind: 'blocked'
      playerMessages: ConversationMessage[]
      historyMessages: ConversationMessage[]
      choices: PlayerChoice[]
      systemMessage: ConversationMessage
    }
  | {
      kind: 'entered'
      playerMessages: ConversationMessage[]
      historyMessages: ConversationMessage[]
      nextNode: StoryNode
      state: GameState
      nextMessages: ConversationMessage[]
      narrationMessage: ConversationMessage
      choices: PlayerChoice[]
    }

export class GameRuntime {
  startChapter(actId: string, playerName: string): RuntimeStartResult {
    const node = getChapterStartNode(actId) ?? getFirstNode()
    const state = enterNode(createChapterGameState(playerName, actId), node)
    const messages: ConversationMessage[] = [{
      id: `node-${node.id}-${Date.now()}`,
      role: 'narration',
      content: node.description,
      timestamp: Date.now()
    }]

    return {
      node,
      state,
      messages,
      choices: getNodeChoices(node, state)
    }
  }

  loadSave(saveData: GameSaveData): RuntimeStartResult {
    const node = getStoryNode(saveData.gameState.currentNode) ?? getFirstNode()
    const messages = saveData.conversationHistories.main ?? []

    return {
      node,
      state: saveData.gameState,
      messages,
      choices: getNodeChoices(node, saveData.gameState)
    }
  }

  selectChoice(input: {
    currentNode: StoryNode | null
    gameState: GameState
    messages: ConversationMessage[]
    choice: PlayerChoice
  }): RuntimeChoiceResult {
    const now = Date.now()
    const playerMessages = createPlayerChoiceMessages(input.choice, now)
    const historyMessages = [...input.messages, ...playerMessages]
    const choiceAppliedState = applyChoiceToGameState(input.gameState, input.choice)
    const nextNode = getStoryNode(input.choice.nextNodeId)

    if (!nextNode) {
      return {
        kind: 'missing',
        playerMessages,
        historyMessages,
        systemMessage: {
          id: `system-${Date.now()}`,
          role: 'system',
          content: '剧情节点丢失，已到达当前版本结尾。',
          timestamp: Date.now()
        }
      }
    }

    if (!canEnterNode(nextNode, choiceAppliedState)) {
      return {
        kind: 'blocked',
        playerMessages,
        historyMessages,
        choices: getNodeChoices(input.currentNode, choiceAppliedState),
        systemMessage: {
          id: `system-${Date.now()}`,
          role: 'system',
          content: '你现在还没有触发进入这个剧情的条件，故事转向了更稳妥的路线。',
          timestamp: Date.now()
        }
      }
    }

    const enteredState = enterNode(choiceAppliedState, nextNode)
    const educationCard = getEducationCardForProgress(input.choice, nextNode, enteredState)
    const state = educationCard
      ? {
          ...enteredState,
          flags: mergeFlags(enteredState.flags, { [`education:${educationCard.id}`]: true })
        }
      : enteredState
    const narrationMessage: ConversationMessage = {
      id: `node-${nextNode.id}-${Date.now()}`,
      role: 'narration',
      content: nextNode.description,
      timestamp: Date.now() + 1
    }
    const nextMessages: ConversationMessage[] = [narrationMessage]

    if (educationCard) {
      nextMessages.push({
        id: `education-${educationCard.id}-${Date.now()}`,
        role: 'education',
        content: educationCard.body,
        timestamp: Date.now() + 2,
        educationCard
      })
    }

    return {
      kind: 'entered',
      playerMessages,
      historyMessages,
      nextNode,
      state,
      nextMessages,
      narrationMessage,
      choices: getNodeChoices(nextNode, state)
    }
  }
}

function createPlayerChoiceMessages(choice: PlayerChoice, now: number): ConversationMessage[] {
  const messages: ConversationMessage[] = [{
    id: `player-${now}`,
    role: 'player',
    content: choice.text,
    timestamp: now
  }]

  if (choice.narrativeText) {
    messages.push({
      id: `narration-${now}`,
      role: 'narration',
      content: choice.narrativeText,
      timestamp: now + 1
    })
  }

  return messages
}
