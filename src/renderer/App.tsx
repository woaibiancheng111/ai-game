import React, { useState, useCallback, useEffect } from 'react'
import DialogueBox from './components/DialogueBox'
import DecisionPanel from './components/DecisionPanel'
import StatusPanel from './components/StatusPanel'
import SetupScreen from './components/SetupScreen'
import ActIntro from './components/ActIntro'
import GameOverScreen from './components/GameOverScreen'
import { getNPCById } from '../data/npcs'
import type { GameState, StoryNode, PlayerChoice, ConversationMessage } from '../data/types'
import { chat as llmChat, chatStream as llmChatStream } from '../services/llm'
import type { ChatMessage } from '../services/llm'
import { buildConversationPrompt } from '../services/prompts'

const INITIAL_STATE: GameState = {
  playerName: '新生',
  playerStatus: {
    gpa: 3.0,
    money: 2000,
    social: 50,
    reputation: 50,
    energy: 100
  },
  npcAffection: {
    xuejie: 30
  },
  currentAct: 1,
  currentNode: 'act1_start',
  currentLocation: '校门口',
  week: 1,
  day: 1,
  conversationSummaries: {}
}

type GamePhase = 'setup' | 'intro' | 'playing' | 'gameover'

function applyChoiceToGameState(prev: GameState, choice: PlayerChoice): GameState {
  const nextState: GameState = {
    ...prev,
    playerStatus: { ...prev.playerStatus },
    npcAffection: { ...prev.npcAffection }
  }

  if (choice.statusChanges) {
    nextState.playerStatus = {
      ...prev.playerStatus,
      gpa: Math.min(4.0, Math.max(0, prev.playerStatus.gpa + (choice.statusChanges.gpa ?? 0))),
      money: Math.max(0, prev.playerStatus.money + (choice.statusChanges.money ?? 0)),
      social: Math.min(100, Math.max(0, prev.playerStatus.social + (choice.statusChanges.social ?? 0))),
      reputation: Math.min(100, Math.max(0, prev.playerStatus.reputation + (choice.statusChanges.reputation ?? 0))),
      energy: Math.min(100, Math.max(0, prev.playerStatus.energy + (choice.statusChanges.energy ?? 0)))
    }
  }

  if (choice.affectionChanges) {
    for (const [npcId, delta] of Object.entries(choice.affectionChanges)) {
      const current = nextState.npcAffection[npcId] ?? 50
      const deltaValue = delta ?? 0
      nextState.npcAffection[npcId] = Math.min(100, Math.max(0, current + deltaValue))
    }
  }

  return nextState
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [initialApiKey, setInitialApiKey] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [choices, setChoices] = useState<PlayerChoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) {
        setIsBootstrapping(false)
      }
    }, 2000)

    const bootstrap = async () => {
      try {
        const [savedApiKey, storedPlayerName] = await Promise.all([
          window.electronAPI.config.getApiKey(),
          window.electronAPI.storage.get('playerName')
        ])

        if (cancelled) {
          return
        }

        const resolvedName = typeof storedPlayerName === 'string' ? storedPlayerName.trim() : ''
        const resolvedApiKey = typeof savedApiKey === 'string' ? savedApiKey.trim() : ''

        if (resolvedApiKey) {
          setInitialApiKey(resolvedApiKey)
        }

        if (resolvedName) {
          setGameState(prev => ({
            ...prev,
            playerName: resolvedName
          }))
        }

        if (resolvedApiKey && resolvedName) {
          setPhase('intro')
        }
      } catch {
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      clearTimeout(fallbackTimer)
    }
  }, [])

  const applyStatusChanges = useCallback((choice: PlayerChoice) => {
    setGameState(prev => applyChoiceToGameState(prev, choice))
  }, [])

  const generateNPCReply = useCallback(async (
    nextNode: StoryNode,
    historyMessages: ConversationMessage[],
    predictedState: GameState,
    messageId: string
  ): Promise<string | null> => {
    if (!nextNode.npcId) {
      return null
    }

    const npc = getNPCById(nextNode.npcId)
    if (!npc) {
      return null
    }

    const llmHistory: ChatMessage[] = historyMessages
      .filter(msg => msg.role === 'player' || msg.role === 'npc')
      .slice(-10)
      .map(msg => ({
        role: msg.role === 'player' ? 'user' : 'assistant',
        content: msg.content
      }))

    const promptMessages = buildConversationPrompt(npc, llmHistory, {
      npc,
      playerName: predictedState.playerName,
      playerStatus: predictedState.playerStatus,
      npcAffection: predictedState.npcAffection,
      currentLocation: nextNode.location,
      recentHistory: historyMessages
        .slice(-6)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n'),
      week: predictedState.week,
      day: predictedState.day
    })

    try {
      const streamedContent = (await llmChatStream(promptMessages, {
        model: 'qwen-plus',
        temperature: 0.8,
        maxTokens: 400
      }, {
        onChunk: (partialText) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id !== messageId) {
              return msg
            }

            return {
              ...msg,
              content: partialText
            }
          }))
        }
      })).trim()

      if (!streamedContent) {
        return null
      }

      return streamedContent
    } catch (streamErr) {
      console.warn('NPC 流式对话生成失败，尝试非流式兜底:', streamErr)
      try {
        const fallbackContent = (await llmChat(promptMessages, {
          model: 'qwen-plus',
          temperature: 0.8,
          maxTokens: 400
        })).trim()

        if (!fallbackContent) {
          return null
        }

        setMessages(prev => prev.map(msg => {
          if (msg.id !== messageId) {
            return msg
          }

          return {
            ...msg,
            content: fallbackContent
          }
        }))

        return fallbackContent
      } catch (err) {
        console.warn('NPC AI 对话生成失败，将继续使用静态剧情:', err)
        return null
      }
    }
  }, [])

  const handleApiKeySubmit = useCallback(async (key: string, playerName: string) => {
    const normalizedName = playerName.trim() || '新生'

    try {
      await window.electronAPI.config.setApiKey(key)
      await window.electronAPI.storage.set('playerName', normalizedName)
    } catch {
    }
    setGameState(prev => ({
      ...prev,
      playerName: normalizedName
    }))
    setPhase('intro')
  }, [])

  const handleChoiceSelect = useCallback(async (choice: PlayerChoice) => {
    const predictedState = applyChoiceToGameState(gameState, choice)
    applyStatusChanges(choice)

    const now = Date.now()
    const playerMsg: ConversationMessage = {
      id: `player-${now}`,
      role: 'player',
      content: choice.text,
      timestamp: now
    }

    const appendedMessages: ConversationMessage[] = [playerMsg]

    if (choice.narrativeText) {
      const narrationMsg: ConversationMessage = {
        id: `narration-${now}`,
        role: 'narration',
        content: choice.narrativeText,
        timestamp: now + 1
      }
      appendedMessages.push(narrationMsg)
    }

    const currentHistory = [...messages, ...appendedMessages]

    setMessages(prev => [...prev, ...appendedMessages])
    setChoices([])
    setIsLoading(true)

    try {
      const nextNode = await import('../data/story/act1').then(m => m.ACT1_NODES[choice.nextNodeId])
      if (!nextNode) {
        const fallbackMsg: ConversationMessage = {
          id: `system-${Date.now()}`,
          role: 'system',
          content: '剧情节点丢失，已到达当前版本结尾。',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, fallbackMsg])
        setPhase('gameover')
        return
      }

      setCurrentNode(nextNode)
      setGameState(prev => ({
        ...prev,
        currentNode: nextNode.id,
        currentLocation: nextNode.location
      }))

      const nextNodeNarration: ConversationMessage = {
        id: `node-${nextNode.id}-${Date.now()}`,
        role: 'narration',
        content: nextNode.description,
        timestamp: Date.now() + 1
      }

      const nextMessages: ConversationMessage[] = [nextNodeNarration]
      let npcMessageId: string | null = null

      if (nextNode.npcId && getNPCById(nextNode.npcId)) {
        npcMessageId = `npc-${nextNode.npcId}-${Date.now()}`
        nextMessages.push({
          id: npcMessageId,
          role: 'npc',
          content: '',
          timestamp: Date.now() + 2,
          npcId: nextNode.npcId
        })
      }

      setMessages(prev => [...prev, ...nextMessages])

      if (npcMessageId) {
        const npcReplyContent = await generateNPCReply(nextNode, [...currentHistory, nextNodeNarration], {
          ...predictedState,
          currentNode: nextNode.id,
          currentLocation: nextNode.location
        }, npcMessageId)

        if (!npcReplyContent) {
          setMessages(prev => prev.filter(msg => msg.id !== npcMessageId))
        }
      }

      if (nextNode.playerChoices && nextNode.playerChoices.length > 0) {
        setChoices(nextNode.playerChoices)
      } else if (nextNode.isEnding) {
        setPhase('gameover')
      }
    } catch (err) {
      console.error('加载下一节点失败:', err)
    } finally {
      setIsLoading(false)
    }
  }, [applyStatusChanges, gameState, messages, generateNPCReply])

  const handleRetry = useCallback(() => {
    setPhase('setup')
    setGameState(INITIAL_STATE)
    setMessages([])
    setChoices([])
    setCurrentNode(null)
  }, [])

  const handleContinue = useCallback(async () => {
    setPhase('playing')
    try {
      const { ACT1_NODES } = await import('../data/story/act1')
      const firstNode = ACT1_NODES['act1_start']
      setCurrentNode(firstNode)
      setGameState(prev => ({
        ...prev,
        currentNode: firstNode.id,
        currentLocation: firstNode.location
      }))
      if (firstNode.playerChoices) {
        setChoices(firstNode.playerChoices)
      }
    } catch (err) {
      console.error('加载剧情失败:', err)
    }
  }, [])

  if (isBootstrapping) {
    return (
      <div style={styles.bootstrapContainer}>
        <div style={styles.bootstrapCard}>
          <div style={styles.bootstrapTitle}>正在加载游戏配置...</div>
          <div style={styles.bootstrapHint}>首次启动或环境读取较慢时会稍等片刻。</div>
        </div>
      </div>
    )
  }

  if (phase === 'setup') {
    return (
      <SetupScreen
        onSubmit={handleApiKeySubmit}
        initialApiKey={initialApiKey}
        initialPlayerName={gameState.playerName === '新生' ? '' : gameState.playerName}
      />
    )
  }

  if (phase === 'intro') {
    return <ActIntro actNumber={1} onContinue={handleContinue} />
  }

  if (phase === 'gameover') {
    return <GameOverScreen gameState={gameState} onRetry={handleRetry} />
  }

  return (
    <div style={styles.container}>
      <StatusPanel gameState={gameState} />
      <div style={styles.mainArea}>
        <DialogueBox
          node={currentNode}
          messages={messages}
          isLoading={isLoading}
          playerName={gameState.playerName}
        />
        <DecisionPanel
          choices={choices}
          onSelect={handleChoiceSelect}
          disabled={isLoading || isTyping}
        />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bootstrapContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(ellipse at center, #13132a 0%, #0b0b18 75%)'
  },
  bootstrapCard: {
    background: 'rgba(26,26,46,0.8)',
    border: '1px solid #2a2a4c',
    borderRadius: '14px',
    padding: '20px 24px',
    minWidth: '320px',
    textAlign: 'center' as const,
    boxShadow: '0 12px 30px rgba(0,0,0,0.35)'
  },
  bootstrapTitle: {
    color: '#e8e8f0',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px'
  },
  bootstrapHint: {
    color: '#9898b0',
    fontSize: '13px'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
    overflow: 'hidden'
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px',
    gap: '16px',
    overflow: 'hidden'
  }
}
