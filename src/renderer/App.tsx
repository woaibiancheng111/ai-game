import React, { useState, useCallback, useEffect } from 'react'
import DialogueBox from './components/DialogueBox'
import DecisionPanel from './components/DecisionPanel'
import StatusPanel from './components/StatusPanel'
import SetupScreen from './components/SetupScreen'
import MainMenu from './components/MainMenu'
import GameOverScreen from './components/GameOverScreen'
import type { AuthSession, DbHealth, GameSaveData, GameState, StoryNode, PlayerChoice, ConversationMessage, PlayerProfile, SaveSlotMeta } from '../data/types'
import { chat as llmChat, chatStream as llmChatStream } from '../services/llm'
import type { ChatMessage } from '../services/llm'
import { buildConversationPrompt } from '../services/prompts'
import { getEducationCardForProgress } from '../data/education/cards'
import { getNPCById } from '../engine/npc'
import { applyChoiceToGameState, createChapterGameState, createInitialGameState, enterNode, mergeFlags } from '../engine/state'
import { canEnterNode, CHAPTERS, getChapterStartNode, getFirstNode, getNodeChoices, getStoryNode, getUnlockedActIds } from '../engine/story'
import { AUTOSAVE_KEY, AUTOSAVE_SLOT_ID, UNLOCKED_ACTS_KEY, createSaveData } from '../engine/save'
import { getMessagesRevealDelay } from './utils/revealTiming'
import { getUnlockedAchievementIds } from '../engine/achievements'

type GamePhase = 'setup' | 'menu' | 'playing' | 'gameover'

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())
  const [initialApiKey, setInitialApiKey] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [hasAutosave, setHasAutosave] = useState(false)
  const [profiles, setProfiles] = useState<PlayerProfile[]>([])
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile | null>(null)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null)
  const [unlockedActIds, setUnlockedActIds] = useState<string[]>(['act1'])
  const [syncedAchievementIds, setSyncedAchievementIds] = useState<string[]>([])
  const [saveSlots, setSaveSlots] = useState<SaveSlotMeta[]>([])
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [choices, setChoices] = useState<PlayerChoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [statusPanelOpen, setStatusPanelOpen] = useState(false)

  const persistAutosave = useCallback(async (nextState: GameState, nextMessages: ConversationMessage[]) => {
    try {
      const saveData = createSaveData(nextState, normalizePersistedMessages(nextMessages))
      await window.electronAPI.storage.set(AUTOSAVE_KEY, saveData)
      if (currentProfile) {
        const writtenSave = await window.electronAPI.saves.write({
          slotId: AUTOSAVE_SLOT_ID,
          profileId: currentProfile.id,
          label: '自动存档',
          savedAt: Date.now(),
          data: saveData
        })
        const nextSlots = mergeSaveSlotMeta(saveSlots, writtenSave)
        setSaveSlots(nextSlots)
        const achievementIds = getUnlockedAchievementIds(nextState, nextSlots, syncedAchievementIds)
        setSyncedAchievementIds(achievementIds)
        await window.electronAPI.achievements.set(currentProfile.id, achievementIds)
      }
      setHasAutosave(true)
    } catch {
    }
  }, [currentProfile, saveSlots, syncedAchievementIds])

  const updateChapterProgress = useCallback(async (actId: string) => {
    const nextUnlocked = normalizeUnlockedActIds([...unlockedActIds, actId])
    setUnlockedActIds(nextUnlocked)
    try {
      await window.electronAPI.storage.set(UNLOCKED_ACTS_KEY, nextUnlocked)
      if (currentProfile) {
        await window.electronAPI.progress.set(currentProfile.id, nextUnlocked)
      }
    } catch {
    }
  }, [currentProfile, unlockedActIds])

  useEffect(() => {
    let cancelled = false
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) {
        setIsBootstrapping(false)
      }
    }, 2000)

    const bootstrap = async () => {
      try {
        const [savedApiKey, storedPlayerName, storedSave, storedProfiles, storedProfile, storedUnlockedActs, storedSession, health] = await Promise.all([
          window.electronAPI.config.getApiKey(),
          window.electronAPI.storage.get('playerName'),
          window.electronAPI.storage.get(AUTOSAVE_KEY),
          window.electronAPI.profiles.list(),
          window.electronAPI.profiles.getCurrent(),
          window.electronAPI.storage.get(UNLOCKED_ACTS_KEY),
          window.electronAPI.auth.getSession(),
          window.electronAPI.db.health()
        ])

        if (cancelled) {
          return
        }

        const resolvedName = typeof storedPlayerName === 'string' ? storedPlayerName.trim() : ''
        const resolvedApiKey = typeof savedApiKey === 'string' ? savedApiKey.trim() : ''

        if (resolvedApiKey) {
          setInitialApiKey(resolvedApiKey)
        }

        setProfiles(storedProfiles)
        setAuthSession(storedSession)
        setDbHealth(health)
        let profileSaveSlots: SaveSlotMeta[] = []
        if (storedProfile) {
          setCurrentProfile(storedProfile)
          const slots = await window.electronAPI.saves.list(storedProfile.id)
          profileSaveSlots = normalizeSaveSlots(slots)
          setSaveSlots(profileSaveSlots)
          const hasRemoteAutosave = Boolean(profileSaveSlots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID))
          if (hasRemoteAutosave) {
            setHasAutosave(true)
          }
          const remoteProgress = await window.electronAPI.progress.get(storedProfile.id)
          if (Array.isArray(remoteProgress)) {
            setUnlockedActIds(normalizeUnlockedActIds(remoteProgress))
          }
          const remoteAchievements = await window.electronAPI.achievements.get(storedProfile.id)
          if (Array.isArray(remoteAchievements)) {
            setSyncedAchievementIds(normalizeAchievementIds(remoteAchievements))
          }
        }
        if (!storedProfile && Array.isArray(storedUnlockedActs)) {
          setUnlockedActIds(normalizeUnlockedActIds(storedUnlockedActs))
        }

        const profileName = storedProfile?.name ?? resolvedName
        if (profileName) {
          setGameState(prev => ({
            ...prev,
            playerName: profileName
          }))
        }

        const remoteAutosave = storedProfile && profileSaveSlots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)
          ? await window.electronAPI.saves.read(storedProfile.id, AUTOSAVE_SLOT_ID)
          : null
        const legacyAutosaveMatchesProfile = storedProfile &&
          isValidSaveData(storedSave) &&
          storedSave.gameState.playerName === profileName
        const resolvedAutosave = isValidSaveData(remoteAutosave)
          ? remoteAutosave
          : legacyAutosaveMatchesProfile || !storedProfile
            ? storedSave
            : null

        if (isValidSaveData(resolvedAutosave)) {
          setHasAutosave(true)
          setGameState(prev => ({
            ...resolvedAutosave.gameState,
            playerName: profileName || resolvedAutosave.gameState.playerName || prev.playerName
          }))
        }

        if (resolvedApiKey && profileName) {
          setPhase('menu')
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
        .map(msg => `${getHistoryRoleLabel(msg)}: ${msg.content}`)
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
              content: partialText,
              isStreaming: true
            }
          }))
        }
      })).trim()

      if (!streamedContent) {
        const fallbackLine = nextNode.npcFallbackText ?? npc.fallbackLines?.[0] ?? null
        if (fallbackLine) {
          setMessages(prev => prev.map(msg => {
            if (msg.id !== messageId) {
              return msg
            }

            return {
              ...msg,
              content: fallbackLine,
              isStreaming: false
            }
          }))
        }
        return fallbackLine
      }

      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) {
          return msg
        }

        return {
          ...msg,
          content: streamedContent,
          isStreaming: false
        }
      }))

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
          const fallbackLine = nextNode.npcFallbackText ?? npc.fallbackLines?.[0] ?? null
          if (fallbackLine) {
            setMessages(prev => prev.map(msg => {
              if (msg.id !== messageId) {
                return msg
              }

              return {
                ...msg,
                content: fallbackLine,
                isStreaming: false
              }
            }))
          }
          return fallbackLine
        }

        setMessages(prev => prev.map(msg => {
          if (msg.id !== messageId) {
            return msg
          }

          return {
            ...msg,
            content: fallbackContent,
            isStreaming: false
          }
        }))

        return fallbackContent
      } catch (err) {
        console.warn('NPC AI 对话生成失败，将继续使用静态剧情:', err)
        const fallbackLine = nextNode.npcFallbackText ?? npc.fallbackLines?.[0] ?? null
        if (fallbackLine) {
          setMessages(prev => prev.map(msg => {
            if (msg.id !== messageId) {
              return msg
            }

            return {
              ...msg,
              content: fallbackLine,
              isStreaming: false
            }
          }))
        }
        return fallbackLine
      }
    }
  }, [])

  const handleApiKeySubmit = useCallback(async (key: string, playerName: string, profile?: PlayerProfile | null, session?: AuthSession | null) => {
    const normalizedName = playerName.trim() || '新生'

    try {
      await window.electronAPI.config.setApiKey(key)
      await window.electronAPI.storage.set('playerName', normalizedName)
      const resolvedProfile = profile ?? await window.electronAPI.profiles.upsert(normalizedName)
      const nextProfiles = await window.electronAPI.profiles.list()
      const slots = await window.electronAPI.saves.list(resolvedProfile.id)
      const health = await window.electronAPI.db.health()
      const remoteProgress = await window.electronAPI.progress.get(resolvedProfile.id)
      const remoteAchievements = await window.electronAPI.achievements.get(resolvedProfile.id)
      const normalizedSlots = normalizeSaveSlots(slots)
      setCurrentProfile(resolvedProfile)
      setProfiles(nextProfiles)
      setSaveSlots(normalizedSlots)
      setHasAutosave(Boolean(normalizedSlots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)))
      if (Array.isArray(remoteProgress)) {
        setUnlockedActIds(normalizeUnlockedActIds(remoteProgress))
      }
      if (Array.isArray(remoteAchievements)) {
        setSyncedAchievementIds(normalizeAchievementIds(remoteAchievements))
      } else {
        setSyncedAchievementIds([])
      }
      setAuthSession(session ?? await window.electronAPI.auth.getSession())
      setDbHealth(health)
    } catch {
    }
    setGameState(prev => ({
      ...prev,
      playerName: normalizedName
    }))
    setPhase('menu')
  }, [])

  const handleProfileSelect = useCallback(async (profileId: string) => {
    const profile = await window.electronAPI.profiles.setCurrent(profileId)
    if (!profile) {
      return
    }

    setCurrentProfile(profile)
    setGameState(prev => ({
      ...prev,
      playerName: profile.name
    }))

    const slots = await window.electronAPI.saves.list(profile.id)
    const normalizedSlots = normalizeSaveSlots(slots)
    setSaveSlots(normalizedSlots)
    const saveData = await window.electronAPI.saves.read(profile.id, AUTOSAVE_SLOT_ID)
    setHasAutosave(isValidSaveData(saveData) || Boolean(normalizedSlots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)))
    const remoteProgress = await window.electronAPI.progress.get(profile.id)
    if (Array.isArray(remoteProgress)) {
      setUnlockedActIds(normalizeUnlockedActIds(remoteProgress))
    }
    const remoteAchievements = await window.electronAPI.achievements.get(profile.id)
    setSyncedAchievementIds(Array.isArray(remoteAchievements) ? normalizeAchievementIds(remoteAchievements) : [])
  }, [])

  const handleChoiceSelect = useCallback(async (choice: PlayerChoice) => {
    const choiceAppliedState = applyChoiceToGameState(gameState, choice)

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
    await waitForReveal(appendedMessages)

    try {
      const nextNode = getStoryNode(choice.nextNodeId)
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

      if (!canEnterNode(nextNode, choiceAppliedState)) {
        const blockedMsg: ConversationMessage = {
          id: `system-${Date.now()}`,
          role: 'system',
          content: '你现在还没有触发进入这个剧情的条件，故事转向了更稳妥的路线。',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, blockedMsg])
        setChoices(getNodeChoices(currentNode, choiceAppliedState))
        return
      }

      const enteredState = enterNode(choiceAppliedState, nextNode)
      const educationCard = getEducationCardForProgress(choice, nextNode, enteredState)
      const stateWithEducationFlag = educationCard
        ? {
            ...enteredState,
            flags: mergeFlags(enteredState.flags, { [`education:${educationCard.id}`]: true })
          }
        : enteredState

      setCurrentNode(nextNode)
      setGameState(stateWithEducationFlag)
      void updateChapterProgress(stateWithEducationFlag.currentActId)

      const nextNodeNarration: ConversationMessage = {
        id: `node-${nextNode.id}-${Date.now()}`,
        role: 'narration',
        content: nextNode.description,
        timestamp: Date.now() + 1
      }

      const nextMessages: ConversationMessage[] = [nextNodeNarration]
      if (educationCard) {
        nextMessages.push({
          id: `education-${educationCard.id}-${Date.now()}`,
          role: 'education',
          content: educationCard.body,
          timestamp: Date.now() + 2,
          educationCard
        })
      }

      setMessages(prev => [...prev, nextNodeNarration])
      await waitForReveal([nextNodeNarration])

      if (educationCard) {
        const educationMessage = nextMessages[nextMessages.length - 1]
        setMessages(prev => [...prev, educationMessage])
        await waitForReveal([educationMessage])
      }

      let npcReplyContent: string | null = null
      let npcMessageId: string | null = null

      if (nextNode.npcId && getNPCById(nextNode.npcId)) {
        npcMessageId = `npc-${nextNode.npcId}-${Date.now()}`
        const npcMessage: ConversationMessage = {
          id: npcMessageId,
          role: 'npc',
          content: '',
          timestamp: Date.now() + 2,
          npcId: nextNode.npcId,
          isStreaming: true
        }
        nextMessages.push(npcMessage)
        setMessages(prev => [...prev, npcMessage])

        npcReplyContent = await generateNPCReply(nextNode, [...currentHistory, nextNodeNarration], {
          ...stateWithEducationFlag
        }, npcMessageId)

        if (!npcReplyContent) {
          setMessages(prev => prev.filter(msg => msg.id !== npcMessageId))
        }
      }

      const postNodeChoices = getNodeChoices(nextNode, stateWithEducationFlag)
      const finalMessages = [...currentHistory, ...nextMessages].map(msg => {
        if (msg.id === npcMessageId && npcReplyContent) {
          return {
            ...msg,
            content: npcReplyContent,
            isStreaming: false
          }
        }

        return msg
      }).filter(msg => msg.id !== npcMessageId || Boolean(npcReplyContent))
      await persistAutosave(stateWithEducationFlag, finalMessages)

      if (postNodeChoices.length > 0) {
        setChoices(postNodeChoices)
      } else if (nextNode.isEnding) {
        setPhase('gameover')
      }
    } catch (err) {
      console.error('加载下一节点失败:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentNode, gameState, messages, generateNPCReply, persistAutosave, updateChapterProgress])

  const handleRetry = useCallback(() => {
    const resetState = createInitialGameState(gameState.playerName)
    setPhase('menu')
    setGameState(resetState)
    setMessages([])
    setChoices([])
    setCurrentNode(null)
    void window.electronAPI.storage.delete(AUTOSAVE_KEY)
    setHasAutosave(false)
  }, [gameState.playerName])

  const startFromNode = useCallback((node: StoryNode, baseState: GameState, seedMessages: ConversationMessage[] = []) => {
    const nextState = enterNode(baseState, node)
    const initialMessages = seedMessages.length > 0
      ? seedMessages
      : [{
          id: `node-${node.id}-${Date.now()}`,
          role: 'narration' as const,
          content: node.description,
          timestamp: Date.now()
        }]

    setPhase('playing')
    setCurrentNode(node)
    setGameState(nextState)
    setMessages(initialMessages)
    setChoices(getNodeChoices(node, nextState))
    void persistAutosave(nextState, initialMessages)
  }, [persistAutosave])

  const handleStartChapter = useCallback((actId: string) => {
    const node = getChapterStartNode(actId) ?? getFirstNode()
    void updateChapterProgress(actId)
    startFromNode(node, createChapterGameState(gameState.playerName, actId))
  }, [gameState.playerName, startFromNode, updateChapterProgress])

  const handleRenamePlayer = useCallback(async (name: string) => {
    const normalizedName = name.trim() || '新生'
    setGameState(prev => ({
      ...prev,
      playerName: normalizedName
    }))

    try {
      await window.electronAPI.storage.set('playerName', normalizedName)
      const profile = await window.electronAPI.profiles.upsert(normalizedName)
      const nextProfiles = await window.electronAPI.profiles.list()
      setCurrentProfile(profile)
      setProfiles(nextProfiles)
    } catch {
    }
  }, [])

  const handleReturnHome = useCallback(() => {
    setPhase('menu')
    setChoices([])
    setIsLoading(false)
    setIsRevealing(false)
    setStatusPanelOpen(false)
  }, [])

  const handleLoadAutosave = useCallback(async () => {
    const storedSave = await window.electronAPI.storage.get(AUTOSAVE_KEY)
    const profileSave = currentProfile
      ? await window.electronAPI.saves.read(currentProfile.id, AUTOSAVE_SLOT_ID)
      : null
    const resolvedSave = isValidSaveData(profileSave) ? profileSave : storedSave

    if (!isValidSaveData(resolvedSave)) {
      return
    }

    const node = getStoryNode(resolvedSave.gameState.currentNode) ?? getFirstNode()
    setPhase('playing')
    setGameState(resolvedSave.gameState)
    setCurrentNode(node)
    const savedMessages = resolvedSave.conversationHistories.main ?? []
    setMessages(savedMessages)
    setChoices(getNodeChoices(node, resolvedSave.gameState))
  }, [currentProfile])

  const handleLoadSave = useCallback(async (slotId: string) => {
    if (!currentProfile) {
      return
    }

    const saveData = await window.electronAPI.saves.read(currentProfile.id, slotId)
    if (!isValidSaveData(saveData)) {
      return
    }

    const node = getStoryNode(saveData.gameState.currentNode) ?? getFirstNode()
    setPhase('playing')
    setGameState(saveData.gameState)
    setCurrentNode(node)
    const savedMessages = saveData.conversationHistories.main ?? []
    setMessages(savedMessages)
    setChoices(getNodeChoices(node, saveData.gameState))
  }, [currentProfile])

  const handleManualSave = useCallback(async () => {
    if (!currentProfile) {
      return
    }

    const saveData = createSaveData(gameState, normalizePersistedMessages(messages))
    await window.electronAPI.saves.write({
      slotId: `manual-${Date.now()}`,
      profileId: currentProfile.id,
      label: `手动存档 ${new Date().toLocaleString()}`,
      savedAt: Date.now(),
      data: saveData
    })
    const slots = await window.electronAPI.saves.list(currentProfile.id)
    const normalizedSlots = normalizeSaveSlots(slots)
    setSaveSlots(normalizedSlots)
    const achievementIds = getUnlockedAchievementIds(gameState, normalizedSlots, syncedAchievementIds)
    setSyncedAchievementIds(achievementIds)
    await window.electronAPI.achievements.set(currentProfile.id, achievementIds)
  }, [currentProfile, gameState, messages, syncedAchievementIds])

  const handleUpdateApiKey = useCallback(async (apiKey: string) => {
    await window.electronAPI.config.setApiKey(apiKey)
    setInitialApiKey(apiKey)
  }, [])

  const handleRefreshDbHealth = useCallback(async () => {
    const health = await window.electronAPI.db.health()
    const session = await window.electronAPI.auth.getSession()
    setDbHealth(health)
    setAuthSession(session)
  }, [])

  const handleLogout = useCallback(async () => {
    await window.electronAPI.auth.logout()
    const [health, nextProfiles] = await Promise.all([
      window.electronAPI.db.health(),
      window.electronAPI.profiles.list()
    ])
    setAuthSession(null)
    setCurrentProfile(null)
    setProfiles(nextProfiles)
    setDbHealth(health)
    setSaveSlots([])
    setSyncedAchievementIds([])
    setUnlockedActIds(['act1'])
    setHasAutosave(false)
    setMessages([])
    setChoices([])
    setCurrentNode(null)
    setGameState(createInitialGameState())
    setPhase('setup')
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
        profiles={profiles}
        currentProfileId={currentProfile?.id}
        onProfileSelect={handleProfileSelect}
        dbHealth={dbHealth}
      />
    )
  }

  if (phase === 'menu') {
    return (
      <MainMenu
        playerName={gameState.playerName}
        chapters={CHAPTERS}
        unlockedActIds={getUnlockedActIds(gameState, hasAutosave, unlockedActIds)}
        onStartChapter={handleStartChapter}
        onRenamePlayer={handleRenamePlayer}
        onLoadAutosave={handleLoadAutosave}
        hasAutosave={hasAutosave}
        saveSlots={saveSlots}
        initialApiKey={initialApiKey}
        onLoadSave={handleLoadSave}
        onSaveManual={handleManualSave}
        onUpdateApiKey={handleUpdateApiKey}
        gameState={gameState}
        authSession={authSession}
        dbHealth={dbHealth}
        syncedAchievementIds={syncedAchievementIds}
        onRefreshDbHealth={handleRefreshDbHealth}
        onLogout={handleLogout}
      />
    )
  }

  if (phase === 'gameover') {
    return (
      <GameOverScreen
        gameState={gameState}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.gameBackdrop} />
      <button
        type="button"
        onClick={handleReturnHome}
        style={styles.homeButton}
        title="返回首页"
      >
        首页
      </button>
      <button
        type="button"
        onClick={() => setStatusPanelOpen(true)}
        style={styles.statusButton}
        title="打开状态与手册"
      >
        状态 / 手册
      </button>
      <StatusPanel
        gameState={gameState}
        open={statusPanelOpen}
        onClose={() => setStatusPanelOpen(false)}
      />
      <div style={styles.mainArea}>
        <DialogueBox
          node={currentNode}
          messages={messages}
          isLoading={isLoading}
          sceneImageUrl={gameState.currentSceneImageUrl}
          onTypingChange={setIsRevealing}
        />
        <DecisionPanel
          choices={isRevealing ? [] : choices}
          onSelect={handleChoiceSelect}
          disabled={isLoading || isRevealing}
          emptyText={isRevealing ? '叙事展开中...' : undefined}
        />
      </div>
    </div>
  )
}

function isValidSaveData(value: unknown): value is GameSaveData {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeSave = value as Partial<GameSaveData>
  return maybeSave.version === '2' && typeof maybeSave.gameState === 'object' && maybeSave.gameState !== null
}

function normalizeUnlockedActIds(value: unknown[]): string[] {
  const allowed = new Set(CHAPTERS.map(chapter => chapter.actId))
  return Array.from(new Set(['act1', ...value.filter((item): item is string => typeof item === 'string' && allowed.has(item))]))
}

function normalizeAchievementIds(value: unknown[]): string[] {
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string')))
}

function normalizeSaveSlots(value: unknown[]): SaveSlotMeta[] {
  return value.filter((item): item is SaveSlotMeta => {
    if (typeof item !== 'object' || item === null) {
      return false
    }

    const maybeSlot = item as Partial<SaveSlotMeta>
    return typeof maybeSlot.slotId === 'string' &&
      typeof maybeSlot.profileId === 'string' &&
      typeof maybeSlot.label === 'string' &&
      typeof maybeSlot.savedAt === 'number'
  })
}

function mergeSaveSlotMeta(slots: SaveSlotMeta[], payload: unknown): SaveSlotMeta[] {
  if (typeof payload !== 'object' || payload === null) {
    return slots
  }

  const savePayload = payload as { slotId?: unknown; profileId?: unknown; label?: unknown; savedAt?: unknown; data?: unknown }
  if (typeof savePayload.slotId !== 'string' || typeof savePayload.profileId !== 'string' || typeof savePayload.label !== 'string') {
    return slots
  }

  const saveData = savePayload.data
  const gameState = isValidSaveData(saveData) ? saveData.gameState : null
  const nextSlot: SaveSlotMeta = {
    slotId: savePayload.slotId,
    profileId: savePayload.profileId,
    label: savePayload.label,
    savedAt: typeof savePayload.savedAt === 'number' ? savePayload.savedAt : Date.now(),
    currentActId: gameState?.currentActId ?? '',
    currentNode: gameState?.currentNode ?? '',
    currentLocation: gameState?.currentLocation ?? '',
    week: gameState?.week ?? 0,
    day: gameState?.day ?? 0,
    playerStatus: gameState?.playerStatus ?? {
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

  return [nextSlot, ...slots.filter(slot => slot.slotId !== nextSlot.slotId)].sort((a, b) => b.savedAt - a.savedAt)
}

function waitForReveal(messagesToReveal: ConversationMessage[]): Promise<void> {
  const delay = getMessagesRevealDelay(messagesToReveal)

  if (delay <= 0) {
    return Promise.resolve()
  }

  return new Promise(resolve => window.setTimeout(resolve, delay))
}

function normalizePersistedMessages(messagesToPersist: ConversationMessage[]): ConversationMessage[] {
  return messagesToPersist.map(message => ({
    ...message,
    isStreaming: false
  }))
}

function getHistoryRoleLabel(message: ConversationMessage): string {
  if (message.role === 'player') {
    return '玩家'
  }

  if (message.role === 'npc') {
    return message.npcId ? getNPCById(message.npcId)?.name ?? 'NPC' : 'NPC'
  }

  if (message.role === 'narration') {
    return '旁白'
  }

  if (message.role === 'education') {
    return '校园提示'
  }

  return '系统'
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    background: 'radial-gradient(circle at 18% 18%, rgba(20,184,166,0.16), transparent 30%), radial-gradient(circle at 82% 12%, rgba(37,99,235,0.18), transparent 34%), linear-gradient(135deg, #07111f 0%, #0f1d2d 48%, #111827 100%)',
    overflow: 'hidden'
  },
  gameBackdrop: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.18,
    backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
    backgroundSize: '42px 42px'
  },
  mainArea: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: 'min(1180px, calc(100vw - 48px))',
    margin: '0 auto',
    padding: '18px 0 18px',
    gap: '14px',
    overflow: 'hidden'
  },
  homeButton: {
    position: 'fixed',
    left: '22px',
    bottom: '22px',
    zIndex: 20,
    padding: '9px 14px',
    background: 'rgba(15,23,42,0.78)',
    border: '1px solid rgba(45,212,191,0.24)',
    borderRadius: '8px',
    color: '#99f6e4',
    fontSize: '13px',
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer'
  },
  statusButton: {
    position: 'fixed',
    right: '22px',
    bottom: '22px',
    zIndex: 20,
    padding: '9px 14px',
    background: 'rgba(15,23,42,0.78)',
    border: '1px solid rgba(96,165,250,0.24)',
    borderRadius: '8px',
    color: '#bfdbfe',
    fontSize: '13px',
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer'
  }
}
