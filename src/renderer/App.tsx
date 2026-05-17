import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DialogueBox from './components/DialogueBox'
import DecisionPanel from './components/DecisionPanel'
import StatusPanel from './components/StatusPanel'
import SetupScreen from './components/SetupScreen'
import MainMenu from './components/MainMenu'
import GameOverScreen from './components/GameOverScreen'
import { Gauge, Home, MapPin, Menu, RotateCcw, Save, SkipForward, UserRound } from 'lucide-react'
import type { AppNotice, AppReleaseInfo, AppSettings, AuthSession, ConversationMessage, DbHealth, GameState, PlayerChoice, PlayerProfile, SaveSlotMeta, StoryNode } from '../data/types'
import type { ChatMessage } from '../services/llm'
import { buildConversationPrompt } from '../services/prompts'
import { getNPCById } from '../engine/npc'
import { createInitialGameState } from '../engine/state'
import { CHAPTERS, getUnlockedActIds } from '../engine/story'
import { AUTOSAVE_SLOT_ID, UNLOCKED_ACTS_KEY, createSaveData } from '../engine/save'
import { GameRuntime } from '../engine/runtime'
import { getMessagesRevealDelay } from './utils/revealTiming'
import { getUnlockedAchievementIds } from '../engine/achievements'
import { soundEngine } from '../services/soundEngine'
import { aiProxyClient } from '../services/aiProxyClient'
import { logAppEvent } from '../services/appLog'
import { loadAppSettings, mergeAppSettings, saveAppSettings } from '../services/settings'
import { normalizeSaveData, saveRepository } from '../services/saveRepository'

type GamePhase = 'setup' | 'menu' | 'playing' | 'gameover'

const runtime = new GameRuntime()

const getBackgroundImage = (location: string) => {
  if (!location) return 'linear-gradient(135deg, #0b0b18 0%, #1a1040 100%)'
  if (location.includes('宿舍')) return 'url(/backgrounds/dorm.png)'
  if (location.includes('教室') || location.includes('上课') || location.includes('会议室')) return 'url(/backgrounds/classroom.png)'
  if (location.includes('图书馆')) return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  if (location.includes('湖') || location.includes('操场')) return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
  if (location.includes('食堂')) return 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)'
  if (location.includes('走廊') || location.includes('台阶') || location.includes('公告栏') || location.includes('大厅')) return 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
  if (location.includes('洗手间')) return 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)'
  if (location.includes('毕业') || location.includes('典礼') || location.includes('林荫')) return 'linear-gradient(135deg, #141e30 0%, #243b55 100%)'
  return 'url(/backgrounds/campus_gate.png)'
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [releaseInfo, setReleaseInfo] = useState<AppReleaseInfo | null>(null)
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
  const [skipReveal, setSkipReveal] = useState(false)
  const [statusPanelOpen, setStatusPanelOpen] = useState(false)
  const [notices, setNotices] = useState<AppNotice[]>([])

  const activeSettings = useMemo(() => settings ?? mergeAppSettings({
    aiEnabled: true,
    aiAllowStreaming: true,
    aiProxyUrl: '',
    bgmEnabled: true,
    sfxEnabled: true,
    masterVolume: 0.5,
    errorLoggingEnabled: true
  }, {}), [settings])

  const showNotice = useCallback((notice: Omit<AppNotice, 'id'>) => {
    const id = `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setNotices(prev => [{ ...notice, id }, ...prev].slice(0, 4))
    window.setTimeout(() => {
      setNotices(prev => prev.filter(item => item.id !== id))
    }, notice.type === 'error' ? 6500 : 4200)
  }, [])

  useEffect(() => {
    soundEngine.setEnabled(activeSettings.bgmEnabled)
    soundEngine.setVolume(activeSettings.masterVolume)
  }, [activeSettings.bgmEnabled, activeSettings.masterVolume])

  useEffect(() => {
    if (!activeSettings.bgmEnabled) {
      soundEngine.stopBGM()
      return
    }

    if (phase !== 'playing' || !gameState.currentLocation) {
      if (phase === 'menu') {
        soundEngine.playBGM('/audio/bgm/menu.ogg')
      } else {
        soundEngine.stopBGM()
      }
      return
    }

    const loc = gameState.currentLocation.toLowerCase()
    if (loc.includes('宿舍')) {
      soundEngine.playBGM('/audio/bgm/daily.ogg')
    } else if (loc.includes('教室') || loc.includes('图书馆')) {
      soundEngine.playBGM('/audio/bgm/daily.ogg')
    } else if (loc.includes('深夜') || loc.includes('暗') || loc.includes('哭')) {
      soundEngine.playBGM('/audio/bgm/menu.ogg')
    } else {
      soundEngine.playBGM('/audio/bgm/daily.ogg')
    }
  }, [activeSettings.bgmEnabled, phase, gameState.currentLocation])

  const persistAutosave = useCallback(async (nextState: GameState, nextMessages: ConversationMessage[]) => {
    const saveData = createSaveData(nextState, normalizePersistedMessages(nextMessages))
    try {
      await saveRepository.writeLegacyAutosave(saveData)
      if (currentProfile) {
        const writtenSlot = await saveRepository.write({
          slotId: AUTOSAVE_SLOT_ID,
          profileId: currentProfile.id,
          label: '自动存档',
          data: saveData
        })
        const nextSlots = mergeSaveSlotMeta(saveSlots, writtenSlot)
        setSaveSlots(nextSlots)
        const achievementIds = getUnlockedAchievementIds(nextState, nextSlots, syncedAchievementIds)
        setSyncedAchievementIds(achievementIds)
        await window.electronAPI.achievements.set(currentProfile.id, achievementIds)
      }
      setHasAutosave(true)
    } catch (err) {
      showNotice({
        type: 'error',
        title: '自动存档失败',
        message: '当前进度暂未写入存档。你可以稍后在菜单中手动保存。'
      })
      await logAppEvent({
        level: 'error',
        scope: 'autosave',
        message: err instanceof Error ? err.message : '自动存档失败',
        details: { currentNode: nextState.currentNode }
      })
    }
  }, [currentProfile, saveSlots, showNotice, syncedAchievementIds])

  const updateChapterProgress = useCallback(async (actId: string) => {
    const nextUnlocked = normalizeUnlockedActIds([...unlockedActIds, actId])
    setUnlockedActIds(nextUnlocked)
    try {
      await window.electronAPI.storage.set(UNLOCKED_ACTS_KEY, nextUnlocked)
      if (currentProfile) {
        await window.electronAPI.progress.set(currentProfile.id, nextUnlocked)
      }
    } catch (err) {
      showNotice({
        type: 'warning',
        title: '章节进度暂未同步',
        message: '不影响当前游玩，系统会继续保留本地自动存档。'
      })
      await logAppEvent({
        level: 'warning',
        scope: 'progress',
        message: err instanceof Error ? err.message : '章节进度同步失败',
        details: { actId }
      })
    }
  }, [currentProfile, showNotice, unlockedActIds])

  useEffect(() => {
    let cancelled = false
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setIsBootstrapping(false)
    }, 2500)

    const bootstrap = async () => {
      try {
        const [appSettings, storedPlayerName, legacyAutosave, storedProfiles, storedProfile, storedUnlockedActs, storedSession, health, info] = await Promise.all([
          loadAppSettings(),
          window.electronAPI.storage.get('playerName'),
          saveRepository.readLegacyAutosave(),
          window.electronAPI.profiles.list(),
          window.electronAPI.profiles.getCurrent(),
          window.electronAPI.storage.get(UNLOCKED_ACTS_KEY),
          window.electronAPI.auth.getSession(),
          window.electronAPI.db.health(),
          window.electronAPI.app.getReleaseInfo()
        ])

        if (cancelled) return

        setSettings(appSettings)
        setReleaseInfo(info)
        setProfiles(storedProfiles)
        setAuthSession(storedSession)
        setDbHealth(health)

        let profileSaveSlots: SaveSlotMeta[] = []
        if (storedProfile) {
          setCurrentProfile(storedProfile)
          profileSaveSlots = await saveRepository.list(storedProfile.id)
          setSaveSlots(profileSaveSlots)
          setHasAutosave(Boolean(profileSaveSlots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)))

          const remoteProgress = await window.electronAPI.progress.get(storedProfile.id)
          if (Array.isArray(remoteProgress)) {
            setUnlockedActIds(normalizeUnlockedActIds(remoteProgress))
          }

          const remoteAchievements = await window.electronAPI.achievements.get(storedProfile.id)
          if (Array.isArray(remoteAchievements)) {
            setSyncedAchievementIds(normalizeAchievementIds(remoteAchievements))
          }
        } else if (Array.isArray(storedUnlockedActs)) {
          setUnlockedActIds(normalizeUnlockedActIds(storedUnlockedActs))
        }

        const resolvedName = typeof storedPlayerName === 'string' ? storedPlayerName.trim() : ''
        const profileName = storedProfile?.name ?? resolvedName
        if (profileName) {
          setGameState(prev => ({ ...prev, playerName: profileName }))
        }

        const remoteAutosave = storedProfile && profileSaveSlots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)
          ? await saveRepository.read(storedProfile.id, AUTOSAVE_SLOT_ID)
          : null
        const legacyAutosaveMatchesProfile = storedProfile &&
          legacyAutosave &&
          legacyAutosave.gameState.playerName === profileName
        const resolvedAutosave = remoteAutosave ?? (legacyAutosaveMatchesProfile || !storedProfile ? legacyAutosave : null)

        if (resolvedAutosave) {
          setHasAutosave(true)
          setGameState(prev => ({
            ...resolvedAutosave.gameState,
            playerName: profileName || resolvedAutosave.gameState.playerName || prev.playerName
          }))
        }

        if (profileName) {
          setPhase('menu')
        }
      } catch (err) {
        showNotice({
          type: 'warning',
          title: '启动配置读取异常',
          message: '已进入本地降级模式，你仍然可以继续游戏。'
        })
        await logAppEvent({
          level: 'warning',
          scope: 'bootstrap',
          message: err instanceof Error ? err.message : '启动配置读取异常'
        })
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      window.clearTimeout(fallbackTimer)
    }
  }, [showNotice])

  const generateNPCReply = useCallback(async (
    nextNode: StoryNode,
    historyMessages: ConversationMessage[],
    predictedState: GameState,
    messageId: string
  ): Promise<string | null> => {
    if (!nextNode.npcId) return null
    const npc = getNPCById(nextNode.npcId)
    if (!npc) return null

    const fallbackLine = nextNode.npcFallbackText ?? npc.fallbackLines?.[0] ?? null
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
      recentHistory: historyMessages.slice(-6).map(msg => `${getHistoryRoleLabel(msg)}: ${msg.content}`).join('\n'),
      week: predictedState.week,
      day: predictedState.day
    })

    const finishMessage = (content: string, streaming = false) => {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content, isStreaming: streaming } : msg))
    }

    const fallback = async (reason: string) => {
      if (fallbackLine) {
        finishMessage(fallbackLine, false)
      }
      await logAppEvent({
        level: 'warning',
        scope: 'npc-ai',
        message: reason,
        details: { npcId: npc.id, nodeId: nextNode.id }
      })
      return fallbackLine
    }

    try {
      const result = await aiProxyClient.chatStream(promptMessages, {
        npc,
        playerName: predictedState.playerName,
        currentNode: nextNode,
        gameState: predictedState
      }, {
        model: 'qwen-plus',
        temperature: 0.8,
        maxTokens: 400
      }, activeSettings, {
        onChunk: partialText => finishMessage(partialText, true)
      })

      if (result.ok && result.text.trim()) {
        const text = result.text.trim()
        finishMessage(text, false)
        return text
      }

      return fallback(result.message ?? result.errorCode ?? 'AI 代理未返回可用内容')
    } catch (err) {
      return fallback(err instanceof Error ? err.message : 'AI 代理异常')
    }
  }, [activeSettings])

  const handleSetupSubmit = useCallback(async (playerName: string, profile?: PlayerProfile | null, session?: AuthSession | null) => {
    const normalizedName = playerName.trim() || '新生'
    try {
      await window.electronAPI.storage.set('playerName', normalizedName)
      const resolvedProfile = profile ?? await window.electronAPI.profiles.upsert(normalizedName)
      const [nextProfiles, slots, health, remoteProgress, remoteAchievements, nextSession] = await Promise.all([
        window.electronAPI.profiles.list(),
        saveRepository.list(resolvedProfile.id),
        window.electronAPI.db.health(),
        window.electronAPI.progress.get(resolvedProfile.id),
        window.electronAPI.achievements.get(resolvedProfile.id),
        session ? Promise.resolve(session) : window.electronAPI.auth.getSession()
      ])

      setCurrentProfile(resolvedProfile)
      setProfiles(nextProfiles)
      setSaveSlots(slots)
      setHasAutosave(Boolean(slots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)))
      setDbHealth(health)
      setAuthSession(nextSession)
      setUnlockedActIds(Array.isArray(remoteProgress) ? normalizeUnlockedActIds(remoteProgress) : ['act1'])
      setSyncedAchievementIds(Array.isArray(remoteAchievements) ? normalizeAchievementIds(remoteAchievements) : [])
    } catch (err) {
      showNotice({
        type: 'warning',
        title: '档案同步异常',
        message: '已使用本地档案继续，稍后可以重新保存。'
      })
      await logAppEvent({
        level: 'warning',
        scope: 'setup',
        message: err instanceof Error ? err.message : '档案同步异常'
      })
    }

    setGameState(prev => ({ ...prev, playerName: normalizedName }))
    setPhase('menu')
  }, [showNotice])

  const handleProfileSelect = useCallback(async (profileId: string) => {
    const profile = await window.electronAPI.profiles.setCurrent(profileId)
    if (!profile) return

    setCurrentProfile(profile)
    setGameState(prev => ({ ...prev, playerName: profile.name }))
    const slots = await saveRepository.list(profile.id)
    setSaveSlots(slots)
    const saveData = await saveRepository.read(profile.id, AUTOSAVE_SLOT_ID)
    setHasAutosave(Boolean(saveData) || Boolean(slots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)))
    const remoteProgress = await window.electronAPI.progress.get(profile.id)
    if (Array.isArray(remoteProgress)) setUnlockedActIds(normalizeUnlockedActIds(remoteProgress))
    const remoteAchievements = await window.electronAPI.achievements.get(profile.id)
    setSyncedAchievementIds(Array.isArray(remoteAchievements) ? normalizeAchievementIds(remoteAchievements) : [])
  }, [])

  const handleChoiceSelect = useCallback(async (choice: PlayerChoice) => {
    const result = runtime.selectChoice({ currentNode, gameState, messages, choice })

    setMessages(prev => [...prev, ...result.playerMessages])
    setChoices([])
    setIsLoading(true)
    await waitForReveal(result.playerMessages)

    try {
      if (result.kind === 'missing') {
        setMessages(prev => [...prev, result.systemMessage])
        setPhase('gameover')
        return
      }

      if (result.kind === 'blocked') {
        setMessages(prev => [...prev, result.systemMessage])
        setChoices(result.choices)
        return
      }

      setCurrentNode(result.nextNode)
      setGameState(result.state)
      void updateChapterProgress(result.state.currentActId)

      setMessages(prev => [...prev, result.narrationMessage])
      await waitForReveal([result.narrationMessage])

      const educationMessage = result.nextMessages.find(message => message.role === 'education')
      if (educationMessage) {
        setMessages(prev => [...prev, educationMessage])
        await waitForReveal([educationMessage])
      }

      let npcReplyContent: string | null = null
      let npcMessageId: string | null = null
      const nextMessages = [...result.nextMessages]

      if (result.nextNode.npcId && getNPCById(result.nextNode.npcId)) {
        npcMessageId = `npc-${result.nextNode.npcId}-${Date.now()}`
        const npcMessage: ConversationMessage = {
          id: npcMessageId,
          role: 'npc',
          content: '',
          timestamp: Date.now() + 2,
          npcId: result.nextNode.npcId,
          isStreaming: true
        }
        nextMessages.push(npcMessage)
        setMessages(prev => [...prev, npcMessage])
        npcReplyContent = await generateNPCReply(result.nextNode, [...result.historyMessages, result.narrationMessage], result.state, npcMessageId)

        if (!npcReplyContent) {
          setMessages(prev => prev.filter(msg => msg.id !== npcMessageId))
        }
      }

      const finalMessages = [...result.historyMessages, ...nextMessages].map(msg => {
        if (msg.id === npcMessageId && npcReplyContent) {
          return { ...msg, content: npcReplyContent, isStreaming: false }
        }
        return msg
      }).filter(msg => msg.id !== npcMessageId || Boolean(npcReplyContent))

      await persistAutosave(result.state, finalMessages)

      if (result.choices.length > 0) {
        setChoices(result.choices)
      } else if (result.nextNode.isEnding) {
        setPhase('gameover')
      }
    } catch (err) {
      showNotice({
        type: 'error',
        title: '剧情推进失败',
        message: '系统已保留当前画面，请返回首页读取最近存档后重试。'
      })
      await logAppEvent({
        level: 'error',
        scope: 'choice',
        message: err instanceof Error ? err.message : '剧情推进失败',
        details: { choiceId: choice.id }
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentNode, gameState, generateNPCReply, messages, persistAutosave, showNotice, updateChapterProgress])

  const startRuntimeResult = useCallback((result: ReturnType<GameRuntime['startChapter']>) => {
    setPhase('playing')
    setCurrentNode(result.node)
    setGameState(result.state)
    setMessages(result.messages)
    setChoices(result.choices)
    void persistAutosave(result.state, result.messages)
  }, [persistAutosave])

  const handleStartChapter = useCallback((actId: string) => {
    void updateChapterProgress(actId)
    startRuntimeResult(runtime.startChapter(actId, gameState.playerName))
  }, [gameState.playerName, startRuntimeResult, updateChapterProgress])

  const handleLoadRuntimeSave = useCallback((saveData: NonNullable<ReturnType<typeof normalizeSaveData>>) => {
    const result = runtime.loadSave(saveData)
    setSkipReveal(true)
    setPhase('playing')
    setGameState(result.state)
    setCurrentNode(result.node)
    setMessages(normalizePersistedMessages(result.messages))
    setChoices(result.choices)
    window.setTimeout(() => setSkipReveal(false), 100)
  }, [])

  const handleLoadAutosave = useCallback(async () => {
    const profileSave = currentProfile ? await saveRepository.read(currentProfile.id, AUTOSAVE_SLOT_ID) : null
    const resolvedSave = profileSave ?? await saveRepository.readLegacyAutosave()
    if (!resolvedSave) {
      showNotice({ type: 'warning', title: '没有可读取的自动存档', message: '开始新游戏后系统会自动保存进度。' })
      return
    }
    handleLoadRuntimeSave(resolvedSave)
  }, [currentProfile, handleLoadRuntimeSave, showNotice])

  const handleLoadSave = useCallback(async (slotId: string) => {
    if (!currentProfile) return
    const saveData = await saveRepository.read(currentProfile.id, slotId)
    if (!saveData) {
      showNotice({ type: 'error', title: '存档读取失败', message: '该存档无法解析或已经损坏。' })
      return
    }
    handleLoadRuntimeSave(saveData)
  }, [currentProfile, handleLoadRuntimeSave, showNotice])

  const handleDeleteSave = useCallback(async (slotId: string) => {
    if (!currentProfile) return

    try {
      await saveRepository.delete(currentProfile.id, slotId)
      const slots = await saveRepository.list(currentProfile.id)
      setSaveSlots(slots)
      setHasAutosave(Boolean(slots.find(slot => slot.slotId === AUTOSAVE_SLOT_ID)))
      showNotice({ type: 'success', title: '存档已删除', message: '该存档已从当前档案移除。' })
    } catch (err) {
      showNotice({ type: 'error', title: '删除存档失败', message: '请稍后重试，或检查本地数据目录权限。' })
      await logAppEvent({
        level: 'error',
        scope: 'delete-save',
        message: err instanceof Error ? err.message : '删除存档失败',
        details: { slotId }
      })
    }
  }, [currentProfile, showNotice])

  const handleManualSave = useCallback(async () => {
    if (!currentProfile) {
      showNotice({ type: 'warning', title: '没有当前档案', message: '请先创建或选择一个玩家档案。' })
      return
    }

    try {
      const saveData = createSaveData(gameState, normalizePersistedMessages(messages))
      await saveRepository.write({
        slotId: `manual-${Date.now()}`,
        profileId: currentProfile.id,
        label: `手动存档 ${new Date().toLocaleString()}`,
        data: saveData
      })
      const slots = await saveRepository.list(currentProfile.id)
      setSaveSlots(slots)
      const achievementIds = getUnlockedAchievementIds(gameState, slots, syncedAchievementIds)
      setSyncedAchievementIds(achievementIds)
      await window.electronAPI.achievements.set(currentProfile.id, achievementIds)
      showNotice({ type: 'success', title: '手动存档完成', message: '当前进度已保存。' })
    } catch (err) {
      showNotice({ type: 'error', title: '手动存档失败', message: '请检查磁盘空间或稍后重试。' })
      await logAppEvent({
        level: 'error',
        scope: 'manual-save',
        message: err instanceof Error ? err.message : '手动存档失败'
      })
    }
  }, [currentProfile, gameState, messages, showNotice, syncedAchievementIds])

  const handleRetry = useCallback(() => {
    const resetState = createInitialGameState(gameState.playerName)
    setPhase('menu')
    setGameState(resetState)
    setMessages([])
    setChoices([])
    setCurrentNode(null)
    void saveRepository.deleteLegacyAutosave()
    setHasAutosave(false)
  }, [gameState.playerName])

  const handleRenamePlayer = useCallback(async (name: string) => {
    const normalizedName = name.trim() || '新生'
    setGameState(prev => ({ ...prev, playerName: normalizedName }))

    try {
      await window.electronAPI.storage.set('playerName', normalizedName)
      const profile = await window.electronAPI.profiles.upsert(normalizedName)
      const nextProfiles = await window.electronAPI.profiles.list()
      setCurrentProfile(profile)
      setProfiles(nextProfiles)
      showNotice({ type: 'success', title: '档案已更新', message: `当前玩家名：${normalizedName}` })
    } catch (err) {
      showNotice({ type: 'warning', title: '名称保存失败', message: '本局内已更新显示名，但档案暂未同步。' })
      await logAppEvent({
        level: 'warning',
        scope: 'rename',
        message: err instanceof Error ? err.message : '名称保存失败'
      })
    }
  }, [showNotice])

  const handleReturnHome = useCallback(() => {
    setPhase('menu')
    setChoices([])
    setIsLoading(false)
    setIsRevealing(false)
    setSkipReveal(false)
    setStatusPanelOpen(false)
  }, [])

  const handleUpdateSettings = useCallback(async (nextSettings: AppSettings) => {
    const saved = await saveAppSettings(nextSettings)
    setSettings(saved)
    showNotice({ type: 'success', title: '设置已保存', message: '新的 AI、音频和日志配置已经生效。' })
  }, [showNotice])

  const handleRefreshDbHealth = useCallback(async () => {
    const health = await window.electronAPI.db.health()
    const session = await window.electronAPI.auth.getSession()
    setDbHealth(health)
    setAuthSession(session)
    showNotice({ type: health.available ? 'success' : 'warning', title: '数据库状态已刷新', message: health.message })
  }, [showNotice])

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

  if (isBootstrapping || !settings) {
    return (
      <div style={styles.bootstrapContainer}>
        <div style={styles.bootstrapCard} data-testid="bootstrap-screen">
          <div style={styles.bootstrapTitle}>正在加载游戏配置...</div>
          <div style={styles.bootstrapHint}>首次启动或环境读取较慢时会稍等片刻。</div>
        </div>
        <NoticeStack notices={notices} />
      </div>
    )
  }

  if (phase === 'setup') {
    return (
      <>
        <SetupScreen
          onSubmit={handleSetupSubmit}
          initialPlayerName={gameState.playerName === '新生' ? '' : gameState.playerName}
          profiles={profiles}
          currentProfileId={currentProfile?.id}
          onProfileSelect={handleProfileSelect}
          dbHealth={dbHealth}
        />
        <NoticeStack notices={notices} />
      </>
    )
  }

  if (phase === 'menu') {
    return (
      <>
        <MainMenu
          playerName={gameState.playerName}
          chapters={CHAPTERS}
          unlockedActIds={getUnlockedActIds(gameState, hasAutosave, unlockedActIds)}
          onStartChapter={handleStartChapter}
          onRenamePlayer={handleRenamePlayer}
          onLoadAutosave={handleLoadAutosave}
          hasAutosave={hasAutosave}
          saveSlots={saveSlots}
          settings={settings}
          releaseInfo={releaseInfo}
          onLoadSave={handleLoadSave}
          onDeleteSave={handleDeleteSave}
          onSaveManual={handleManualSave}
          onUpdateSettings={handleUpdateSettings}
          onShowNotice={showNotice}
          gameState={gameState}
          authSession={authSession}
          dbHealth={dbHealth}
          syncedAchievementIds={syncedAchievementIds}
          onRefreshDbHealth={handleRefreshDbHealth}
          onLogout={handleLogout}
        />
        <NoticeStack notices={notices} />
      </>
    )
  }

  if (phase === 'gameover') {
    return (
      <>
        <GameOverScreen gameState={gameState} onRetry={handleRetry} />
        <NoticeStack notices={notices} />
      </>
    )
  }

  const bgImage = gameState.currentSceneImageUrl ? `url(${gameState.currentSceneImageUrl})` : getBackgroundImage(gameState.currentLocation || '')

  return (
    <div className="scene-bg-transition" style={{ ...styles.container, background: `${bgImage} center/cover` }} data-testid="game-screen">
      <div style={styles.backgroundOverlay} />
      <header className="glass-panel" style={styles.gameTopBar}>
        <div style={styles.topLeftGroup}>
          <button type="button" onClick={handleReturnHome} style={styles.squareButton} title="返回首页" data-testid="home-button">
            <Home size={22} />
          </button>
          <div style={styles.actLabel}>ACT {String(gameState.currentAct).padStart(2, '0')}</div>
          <div style={styles.nodeLabel}>{currentNode?.title ?? '校园生活'}</div>
        </div>
        <div style={styles.locationPill}>
          <MapPin size={18} />
          <span>{gameState.currentLocation || currentNode?.location || '校园'}</span>
        </div>
        <div style={styles.topActionGroup}>
          <button type="button" style={styles.topAction}><RotateCcw size={18} /> 回看</button>
          <button type="button" style={styles.topAction}><Gauge size={18} /> 自动</button>
          <button type="button" style={styles.topAction}><SkipForward size={18} /> 跳过</button>
          <button type="button" onClick={handleManualSave} style={styles.topAction}><Save size={18} /> 存档</button>
          <button type="button" onClick={() => setStatusPanelOpen(true)} style={styles.topAction} title="打开状态与手册" data-testid="status-button"><UserRound size={18} /> 档案</button>
          <button type="button" style={styles.squareButton}><Menu size={22} /></button>
        </div>
      </header>
      <StatusPanel gameState={gameState} open={statusPanelOpen} onClose={() => setStatusPanelOpen(false)} />
      <div key={currentNode?.id ?? 'empty'} className="scene-fade-enter" style={styles.mainArea}>
        <DialogueBox
          node={currentNode}
          messages={messages}
          isLoading={isLoading}
          skipReveal={skipReveal}
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
      <NoticeStack notices={notices} />
    </div>
  )
}

function NoticeStack({ notices }: { notices: AppNotice[] }) {
  if (notices.length === 0) return null

  return (
    <div style={styles.noticeStack} data-testid="notice-stack">
      {notices.map(notice => (
        <div key={notice.id} style={{ ...styles.noticeCard, ...NOTICE_STYLE[notice.type] }} data-testid={`notice-${notice.type}`}>
          <div style={styles.noticeTitle}>{notice.title}</div>
          <div style={styles.noticeMessage}>{notice.message}</div>
        </div>
      ))}
    </div>
  )
}

function normalizeUnlockedActIds(value: unknown[]): string[] {
  const allowed = new Set(CHAPTERS.map(chapter => chapter.actId))
  return Array.from(new Set(['act1', ...value.filter((item): item is string => typeof item === 'string' && allowed.has(item))]))
}

function normalizeAchievementIds(value: unknown[]): string[] {
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string')))
}

function mergeSaveSlotMeta(slots: SaveSlotMeta[], slot: SaveSlotMeta): SaveSlotMeta[] {
  return [slot, ...slots.filter(item => item.slotId !== slot.slotId)].sort((a, b) => b.savedAt - a.savedAt)
}

function waitForReveal(messagesToReveal: ConversationMessage[]): Promise<void> {
  const delay = getMessagesRevealDelay(messagesToReveal)
  if (delay <= 0) return Promise.resolve()
  return new Promise(resolve => window.setTimeout(resolve, delay))
}

function normalizePersistedMessages(messagesToPersist: ConversationMessage[]): ConversationMessage[] {
  return messagesToPersist.map(message => ({ ...message, isStreaming: false }))
}

function getHistoryRoleLabel(message: ConversationMessage): string {
  if (message.role === 'player') return '玩家'
  if (message.role === 'npc') return message.npcId ? getNPCById(message.npcId)?.name ?? 'NPC' : 'NPC'
  if (message.role === 'narration') return '旁白'
  if (message.role === 'education') return '校园提示'
  return '系统'
}

const NOTICE_STYLE: Record<AppNotice['type'], React.CSSProperties> = {
  success: { borderColor: 'rgba(74,222,128,0.35)', background: 'rgba(22,101,52,0.22)' },
  warning: { borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(113,63,18,0.24)' },
  error: { borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(127,29,29,0.28)' },
  info: { borderColor: 'rgba(96,165,250,0.35)', background: 'rgba(30,64,175,0.24)' }
}

const styles: Record<string, React.CSSProperties> = {
  bootstrapContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(ellipse at center, #1e261d 0%, #07110f 75%)'
  },
  bootstrapCard: {
    background: 'var(--color-surface-strong)',
    border: '1px solid var(--color-border)',
    borderRadius: '14px',
    padding: '20px 24px',
    minWidth: '320px',
    textAlign: 'center' as const,
    boxShadow: '0 12px 30px rgba(0,0,0,0.35)'
  },
  bootstrapTitle: {
    color: 'var(--color-text)',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px'
  },
  bootstrapHint: {
    color: 'var(--color-text-dim)',
    fontSize: '13px'
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden'
  },
  backgroundOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at 78% 12%, rgba(229, 190, 101, 0.12), transparent 34%), linear-gradient(90deg, rgba(3,7,6,0.52), rgba(3,7,6,0.18) 50%, rgba(3,7,6,0.62)), linear-gradient(180deg, rgba(3,7,6,0.12) 0%, rgba(3,7,6,0.86) 100%)',
    zIndex: 0,
    pointerEvents: 'none' as const
  },
  mainArea: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '118px 34px 28px',
    gap: '16px',
    overflow: 'hidden'
  },
  gameTopBar: {
    position: 'fixed',
    left: '30px',
    right: '30px',
    top: '22px',
    zIndex: 20,
    minHeight: '58px',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '18px',
    padding: '8px',
    borderRadius: '12px'
  },
  topLeftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: 0
  },
  squareButton: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    display: 'inline-grid',
    placeItems: 'center',
    background: 'rgba(255,255,255,0.065)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)'
  },
  actLabel: {
    color: 'var(--color-primary)',
    fontSize: '20px',
    fontWeight: 900,
    fontFamily: 'var(--font-mono)'
  },
  nodeLabel: {
    color: 'var(--color-text)',
    fontSize: '18px',
    fontWeight: 900,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  locationPill: {
    justifySelf: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    color: 'var(--color-text-dim)',
    fontSize: '15px',
    fontWeight: 700
  },
  topActionGroup: {
    justifySelf: 'end',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  topAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    minHeight: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    color: 'var(--color-text-dim)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid transparent',
    fontSize: '14px',
    fontWeight: 800
  },
  noticeStack: {
    position: 'fixed',
    right: '22px',
    bottom: '22px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: 'min(360px, calc(100vw - 44px))',
    pointerEvents: 'none'
  },
  noticeCard: {
    padding: '13px 15px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.2)',
    color: '#e5e7eb',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 16px 44px rgba(0,0,0,0.38)',
    animation: 'slideInUp 0.22s ease-out both'
  },
  noticeTitle: {
    fontSize: '13px',
    fontWeight: 900,
    marginBottom: '5px'
  },
  noticeMessage: {
    color: '#cbd5e1',
    fontSize: '12px',
    lineHeight: 1.55
  }
}
