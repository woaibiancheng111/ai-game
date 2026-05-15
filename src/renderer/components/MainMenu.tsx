import React, { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Cloud,
  Database,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Lock,
  LogOut,
  Medal,
  Megaphone,
  Play,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Wallet,
  Zap
} from 'lucide-react'
import type { AppReleaseInfo, AppSettings, AuthSession, ChapterMeta, DbHealth, GameState, SaveSlotMeta } from '../../data/types'
import { DEFAULT_SCHOOL_CONFIG } from '../../data/school/defaultConfig'
import { getAchievements } from '../../engine/achievements'
import { DEFAULT_APP_SETTINGS } from '../../services/settings'

type MenuTab = 'start' | 'saves' | 'achievements' | 'settings'

interface MainMenuProps {
  playerName: string
  gameState: GameState
  chapters: ChapterMeta[]
  unlockedActIds: string[]
  hasAutosave?: boolean
  saveSlots?: SaveSlotMeta[]
  settings: AppSettings
  releaseInfo?: AppReleaseInfo | null
  authSession?: AuthSession | null
  dbHealth?: DbHealth | null
  syncedAchievementIds?: string[]
  onStartChapter: (actId: string) => void
  onRenamePlayer?: (name: string) => void
  onLoadAutosave?: () => void
  onLoadSave?: (slotId: string) => void
  onSaveManual?: () => void
  onUpdateSettings?: (settings: AppSettings) => void
  onShowNotice?: (notice: { type: 'success' | 'warning' | 'error' | 'info'; title: string; message: string }) => void
  onRefreshDbHealth?: () => void
  onLogout?: () => void
}

const CHAPTER_IMAGES: Record<string, string> = {
  act1: '/backgrounds/campus_gate.png',
  act2: '/backgrounds/campus_gate.png',
  act3: '/backgrounds/dorm.png',
  act4: '/backgrounds/classroom.png',
  act5: '/backgrounds/campus_gate.png',
  act6: '/backgrounds/classroom.png',
  act7: '/backgrounds/dorm.png',
  act8: '/backgrounds/campus_gate.png'
}

const CHAPTER_PROGRESS: Record<string, number> = {
  act1: 100,
  act2: 100,
  act3: 75,
  act4: 60,
  act5: 40,
  act6: 0,
  act7: 0,
  act8: 0
}

const CHAPTER_ACCENTS: Record<string, string> = {
  act1: '#9fca78',
  act2: '#b9c889',
  act3: '#e5be65',
  act4: '#9fca78',
  act5: '#e5be65',
  act6: '#8eb9d6',
  act7: '#d89974',
  act8: '#9fca78'
}

export default function MainMenu({
  playerName,
  gameState,
  chapters,
  unlockedActIds,
  hasAutosave = false,
  saveSlots = [],
  settings,
  releaseInfo,
  authSession,
  dbHealth,
  syncedAchievementIds = [],
  onStartChapter,
  onRenamePlayer,
  onLoadAutosave,
  onLoadSave,
  onSaveManual,
  onUpdateSettings,
  onShowNotice,
  onRefreshDbHealth,
  onLogout
}: MainMenuProps) {
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<MenuTab>('start')
  const [selectedActId, setSelectedActId] = useState(chapters[0]?.actId ?? 'act1')
  const [isRenaming, setIsRenaming] = useState(false)
  const [draftName, setDraftName] = useState(playerName)
  const [draftSettings, setDraftSettings] = useState(settings)
  const [aiProxyTesting, setAiProxyTesting] = useState(false)
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 940 : false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 70)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 940)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => setDraftName(playerName), [playerName])
  useEffect(() => setDraftSettings(settings), [settings])

  const achievements = useMemo(
    () => getAchievements(gameState, saveSlots, syncedAchievementIds),
    [gameState, saveSlots, syncedAchievementIds]
  )
  const unlockedAchievements = achievements.filter(item => item.unlocked)
  const unlockedCount = unlockedAchievements.length
  const selectedChapter = chapters.find(chapter => chapter.actId === selectedActId) ?? chapters[0]
  const latestChapter = [...chapters].reverse().find(chapter => unlockedActIds.includes(chapter.actId)) ?? chapters[0]
  const newestSave = [...saveSlots].sort((a, b) => b.savedAt - a.savedAt)[0]
  const autosave = saveSlots.find(slot => slot.slotId === 'autosave') ?? newestSave
  const profileProgress = Math.min(100, Math.max(30, Math.round((unlockedActIds.length / Math.max(1, chapters.length)) * 100)))
  const recentAchievement = unlockedAchievements[unlockedAchievements.length - 1] ?? achievements[0]

  const handleTestAIProxy = async () => {
    setAiProxyTesting(true)
    try {
      const result = await window.electronAPI.aiProxy.chat({
        proxyUrl: draftSettings.aiProxyUrl,
        model: 'qwen-plus',
        temperature: 0.2,
        max_tokens: 80,
        context: { source: 'settings-health-check', appVersion: releaseInfo?.version },
        messages: [
          { role: 'system', content: '你是 AI 校园生存模拟器的代理健康检查。请只返回一句简短中文。' },
          { role: 'user', content: '请回复：代理连接正常。' }
        ]
      })
      onShowNotice?.({
        type: result.ok ? 'success' : 'warning',
        title: result.ok ? 'AI 代理可用' : 'AI 代理不可用',
        message: result.ok ? result.text.slice(0, 80) || '代理连接正常。' : result.message ?? result.errorCode ?? '代理测试失败'
      })
    } catch (err) {
      onShowNotice?.({
        type: 'error',
        title: 'AI 代理测试异常',
        message: err instanceof Error ? err.message : '代理测试失败'
      })
    } finally {
      setAiProxyTesting(false)
    }
  }

  const handlePathAction = async (
    action: () => Promise<{ ok: boolean; path?: string; message?: string }>,
    successTitle: string,
    failureTitle: string
  ) => {
    const result = await action()
    onShowNotice?.({
      type: result.ok ? 'success' : 'warning',
      title: result.ok ? successTitle : failureTitle,
      message: result.ok ? result.path ?? '操作完成。' : result.message ?? result.path ?? '操作失败。'
    })
  }

  const lockedCount = Math.max(0, chapters.length - unlockedActIds.length)

  return (
    <div style={{ ...styles.container, opacity: visible ? 1 : 0 }} data-testid="main-menu">
      <div style={styles.photoLayer} />
      <div className="cinema-bg" />

      <header style={styles.topBar}>
        <div style={styles.logoWrap}>
          <span className="brand-ai" style={styles.logoAI}>AI</span>
          <div>
            <div style={styles.logoTitle}>校园生存模拟器</div>
            <div style={styles.logoSub} className="leaf-mark">在大学生活中学习、选择、成长</div>
          </div>
        </div>

        <nav className="glass-panel" style={styles.tabNav}>
          <TopTab icon={<Home size={19} />} label="开始游戏" active={activeTab === 'start'} onClick={() => setActiveTab('start')} />
          <TopTab icon={<Save size={19} />} label="存档" active={activeTab === 'saves'} onClick={() => setActiveTab('saves')} />
          <TopTab icon={<Medal size={19} />} label="成就" active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} />
          <TopTab icon={<Settings size={19} />} label="设置" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div style={styles.topActions}>
          <button type="button" className="small-icon-button"><Megaphone size={17} /> 公告</button>
          <button type="button" className="small-icon-button"><CircleHelp size={17} /> 帮助</button>
          <button type="button" className="small-icon-button" onClick={onLogout}><LogOut size={17} /> 退出游戏</button>
        </div>
      </header>

      <main style={{ ...styles.shell, ...(isCompact ? styles.shellCompact : {}) }}>
        {activeTab === 'start' && (
          <>
            <section style={styles.heroColumn}>
              <div style={styles.heroTitleRow}>
                <h1 style={styles.heroTitle}><span style={styles.heroAccent}>AI</span> 校园生存模拟器</h1>
                <p style={styles.heroSubtitle}>在大学生活中学习、选择、成长</p>
              </div>

              <div className="glass-panel-strong" style={styles.profileCard}>
                <div style={styles.avatarPortrait}>{(playerName || '新生').slice(0, 1)}</div>
                <div style={styles.profileMain}>
                  {isRenaming ? (
                    <form
                      style={styles.renameForm}
                      onSubmit={event => {
                        event.preventDefault()
                        const nextName = draftName.trim()
                        if (nextName) {
                          onRenamePlayer?.(nextName)
                          setIsRenaming(false)
                        }
                      }}
                    >
                      <input value={draftName} onChange={event => setDraftName(event.target.value)} maxLength={12} style={styles.renameInput} autoFocus />
                      <button type="submit" className="small-icon-button">保存</button>
                    </form>
                  ) : (
                    <div style={styles.profileHeaderLine}>
                      <h2 style={styles.playerName}>{playerName || '新生'}</h2>
                      <button type="button" onClick={() => setIsRenaming(true)} style={styles.renameButton}>编辑</button>
                    </div>
                  )}
                  <div style={styles.profileMeta}>第 {gameState.week} 周 · {latestChapter?.subtitle ?? '校园适应期'}</div>
                  <div style={styles.profileProgressLine}>
                    <div className="progress-track" style={styles.profileProgressTrack}>
                      <div className="progress-fill" style={{ width: `${profileProgress}%` }} />
                    </div>
                    <span>{profileProgress}%</span>
                  </div>
                </div>
                <div style={styles.statStrip}>
                  <MiniStat icon={<GraduationCap size={20} />} label="学识" value={Math.round(gameState.playerStatus.gpa * 20)} />
                  <MiniStat icon={<Heart size={20} />} label="心情" value={gameState.playerStatus.mood} />
                  <MiniStat icon={<UserRound size={20} />} label="人际" value={gameState.playerStatus.social} />
                  <MiniStat icon={<Wallet size={20} />} label="金钱" value={gameState.playerStatus.money} />
                </div>
              </div>

              <div style={styles.ctaRow}>
                {hasAutosave && onLoadAutosave && (
                  <button type="button" onClick={onLoadAutosave} className="primary-cta" data-testid="continue-game-button">
                    <Play size={22} fill="currentColor" /> 继续游戏
                  </button>
                )}
                <button type="button" onClick={() => onStartChapter('act1')} className="secondary-cta" data-testid="new-game-button">
                  <Plus size={22} /> 新的开始
                </button>
              </div>
            </section>

            <section className="glass-panel" style={styles.chapterRail}>
              <div style={styles.inlineTabs}>
                <button type="button" style={styles.inlineTabActive}>开始游戏</button>
                <button type="button" onClick={() => setActiveTab('saves')} style={styles.inlineTab}>存档</button>
                <button type="button" onClick={() => setActiveTab('achievements')} style={styles.inlineTab}>成就</button>
                <button type="button" onClick={() => setActiveTab('settings')} style={styles.inlineTab}>设置</button>
              </div>
              <div style={styles.chapterCards}>
                {chapters.map(chapter => {
                  const unlocked = unlockedActIds.includes(chapter.actId)
                  const progress = unlocked ? CHAPTER_PROGRESS[chapter.actId] ?? 0 : 0
                  return (
                    <button
                      key={chapter.actId}
                      type="button"
                      onMouseEnter={() => setSelectedActId(chapter.actId)}
                      onFocus={() => setSelectedActId(chapter.actId)}
                      onClick={() => {
                        setSelectedActId(chapter.actId)
                        if (unlocked) onStartChapter(chapter.actId)
                      }}
                      disabled={!unlocked}
                      style={{
                        ...styles.chapterCard,
                        ...(selectedActId === chapter.actId ? styles.chapterCardActive : {}),
                        ...(!unlocked ? styles.chapterCardLocked : {}),
                        backgroundImage: `linear-gradient(180deg, rgba(3,7,6,0.2), rgba(3,7,6,0.88)), url(${CHAPTER_IMAGES[chapter.actId]})`,
                        borderColor: selectedActId === chapter.actId ? CHAPTER_ACCENTS[chapter.actId] : 'var(--color-border)'
                      }}
                    >
                      <div style={styles.chapterNumber}>{String(chapter.actNumber).padStart(2, '0')}</div>
                      <div style={styles.chapterTitle}>{chapter.title}</div>
                      <p style={styles.chapterDesc}>{chapter.description}</p>
                      <div className="progress-track" style={styles.chapterProgress}>
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div style={styles.chapterFoot}>
                        <span>{progress}%</span>
                        {unlocked ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedChapter && (
                <div style={styles.chapterDetail}>
                  <img src={CHAPTER_IMAGES[selectedChapter.actId] ?? '/backgrounds/campus_gate.png'} alt="" style={styles.chapterDetailImage} />
                  <div style={styles.chapterDetailBody}>
                    <div style={styles.detailKicker}>当前选择</div>
                    <h3 style={styles.detailTitle}>
                      {String(selectedChapter.actNumber).padStart(2, '0')} {selectedChapter.title}
                    </h3>
                    <p style={styles.detailText}>{selectedChapter.description}</p>
                    <div style={styles.detailTags}>
                      {selectedChapter.themes.map(theme => <span key={theme} style={styles.detailTag}>{theme}</span>)}
                    </div>
                  </div>
                  <div style={styles.detailUnlocks}>
                    <div style={styles.detailKicker}>可能解锁</div>
                    <div style={styles.unlockGrid}>
                      <span style={styles.unlockItem}><MapIcon />校园地图</span>
                      <span style={styles.unlockItem}><Users size={18} />学生互动</span>
                      <span style={styles.unlockItem}><Medal size={18} />章节成就</span>
                      <span style={styles.unlockItem}><BookOpen size={18} />手册知识</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => unlockedActIds.includes(selectedChapter.actId) && onStartChapter(selectedChapter.actId)}
                      disabled={!unlockedActIds.includes(selectedChapter.actId)}
                      className="primary-cta"
                      style={styles.detailButton}
                    >
                      <Play size={20} fill="currentColor" />
                      {unlockedActIds.includes(selectedChapter.actId) ? '继续本章' : '尚未解锁'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'saves' && (
          <section className="glass-panel-strong" style={styles.pagePanel}>
            <PanelHeader kicker="Saves" title="存档列表" subtitle="保存你的大学生活进度" action={
              <button type="button" onClick={onSaveManual} className="primary-cta" style={styles.panelAction} data-testid="manual-save-button">
                <Save size={20} /> 保存当前进度
              </button>
            } />
            <div style={styles.saveLayout}>
              {hasAutosave && onLoadAutosave && (
                <button type="button" onClick={onLoadAutosave} style={styles.autosaveCard} data-testid="autosave-load-button">
                  <img src={CHAPTER_IMAGES[autosave?.currentActId ?? 'act1']} alt="" style={styles.saveThumb} />
                  <div style={styles.saveBody}>
                    <div style={styles.saveBadge}>AUTO</div>
                    <h3 style={styles.saveTitle}>自动存档 · 第 {autosave?.week ?? gameState.week} 周</h3>
                    <p style={styles.saveMeta}>{autosave?.currentLocation ?? gameState.currentLocation ?? '校园'}</p>
                  </div>
                  <div style={styles.saveTime}>{autosave ? new Date(autosave.savedAt).toLocaleString('zh-CN') : '最近进度'}</div>
                </button>
              )}
              {saveSlots.length === 0 && !hasAutosave && <div style={styles.emptyBox}>当前没有可读取的存档。开始游戏后系统会自动保存进度。</div>}
              {saveSlots.map(save => (
                <button key={save.slotId} type="button" onClick={() => onLoadSave?.(save.slotId)} style={styles.saveRow} data-testid={`save-slot-${save.slotId}`}>
                  <img src={CHAPTER_IMAGES[save.currentActId] ?? '/backgrounds/campus_gate.png'} alt="" style={styles.saveThumbSmall} />
                  <div style={styles.saveBody}>
                    <h3 style={styles.saveTitle}>{save.label}</h3>
                    <p style={styles.saveMeta}>{save.currentLocation} · 第 {save.week} 周</p>
                  </div>
                  <div style={styles.saveTime}>{new Date(save.savedAt).toLocaleString('zh-CN')}</div>
                  <Trash2 size={18} color="var(--color-text-muted)" />
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'achievements' && (
          <section className="glass-panel-strong" style={styles.pagePanel}>
            <PanelHeader kicker="Achievements" title="成就总览" subtitle="记录你的成长足迹，见证每一次探索与突破。" />
            <div style={styles.achievementHero}>
              <div style={styles.achievementScore}><span>{unlockedCount}</span> / {achievements.length}</div>
              <div className="progress-track" style={styles.achievementCircle}>
                <div className="progress-fill" style={{ width: `${Math.round((unlockedCount / Math.max(1, achievements.length)) * 100)}%` }} />
              </div>
              {recentAchievement && (
                <div style={styles.recentCard}>
                  <Medal size={54} color="var(--color-accent)" />
                  <div>
                    <div style={styles.recentKicker}>最近解锁</div>
                    <h3 style={styles.recentTitle}>{recentAchievement.title}</h3>
                    <p style={styles.saveMeta}>{recentAchievement.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div style={styles.achievementGrid}>
              {achievements.map(item => (
                <div key={item.id} style={{ ...styles.achievementCard, ...(item.unlocked ? styles.achievementUnlocked : styles.achievementLocked) }}>
                  <div style={styles.achievementIcon}>{item.unlocked ? <CheckCircle2 size={24} /> : <Lock size={22} />}</div>
                  <div>
                    <div style={styles.achievementCategory}>{item.category}</div>
                    <h3 style={styles.achievementTitle}>{item.title}</h3>
                    <p style={styles.achievementText}>{item.unlocked ? item.description : item.unlockHint}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="glass-panel-strong" style={styles.pagePanel}>
            <PanelHeader kicker="Settings" title="设置中心" subtitle="调整视觉小说体验、AI 代理、音频与本地数据。" />
            <div style={styles.settingsLayout}>
              <aside style={styles.settingsSide}>
                {['账号与数据', 'AI 代理设置', '游戏体验', '音频设置', '学校信息', '关于游戏'].map((item, index) => (
                  <div key={item} style={{ ...styles.settingsSideItem, ...(index === 2 ? styles.settingsSideItemActive : {}) }}>
                    {index === 0 ? <Database size={21} /> : index === 1 ? <Zap size={21} /> : index === 2 ? <Gamepad2 size={21} /> : index === 3 ? <Bell size={21} /> : index === 4 ? <BookOpen size={21} /> : <CircleHelp size={21} />}
                    {item}
                  </div>
                ))}
              </aside>

              <div style={styles.settingsContent}>
                <SettingBlock title="视觉小说体验" icon={<BookOpen size={24} />}>
                  <ToggleRow label="启用 AI 对话增强" checked={draftSettings.aiEnabled} onChange={v => setDraftSettings(prev => ({ ...prev, aiEnabled: v }))} />
                  <ToggleRow label="优先使用流式输出" checked={draftSettings.aiAllowStreaming} onChange={v => setDraftSettings(prev => ({ ...prev, aiAllowStreaming: v }))} />
                  <label style={styles.settingLabel}>AI 代理地址</label>
                  <input value={draftSettings.aiProxyUrl} onChange={event => setDraftSettings(prev => ({ ...prev, aiProxyUrl: event.target.value }))} placeholder="https://your-ai-proxy.example.com/chat" style={styles.settingInput} />
                  <button type="button" onClick={handleTestAIProxy} disabled={aiProxyTesting} className="small-icon-button">{aiProxyTesting ? '测试中...' : '测试 AI 代理'}</button>
                </SettingBlock>

                <SettingBlock title="界面显示与音频" icon={<Settings size={24} />}>
                  <ToggleRow label="启用背景音景" checked={draftSettings.bgmEnabled} onChange={v => setDraftSettings(prev => ({ ...prev, bgmEnabled: v }))} />
                  <ToggleRow label="启用按钮音效" checked={draftSettings.sfxEnabled} onChange={v => setDraftSettings(prev => ({ ...prev, sfxEnabled: v }))} />
                  <label style={styles.settingLabel}>主音量 {Math.round(draftSettings.masterVolume * 100)}%</label>
                  <input type="range" min="0" max="1" step="0.05" value={draftSettings.masterVolume} onChange={event => setDraftSettings(prev => ({ ...prev, masterVolume: Number(event.target.value) }))} style={styles.rangeInput} />
                  <ToggleRow label="记录错误日志，方便排查安装包问题" checked={draftSettings.errorLoggingEnabled} onChange={v => setDraftSettings(prev => ({ ...prev, errorLoggingEnabled: v }))} />
                </SettingBlock>

                <SettingBlock title="账号与学校信息" icon={<ShieldCheck size={24} />}>
                  <div style={styles.settingValue}>{authSession?.mode === 'account' ? `账号：${authSession.username ?? authSession.displayName}` : authSession?.mode === 'guest' ? '昵称档案模式' : '本地模式'}</div>
                  <div style={dbHealth?.available ? styles.dbOk : styles.dbWarn}>{dbHealth?.message ?? '正在检测数据库状态'}</div>
                  <div style={styles.settingActions}>
                    <button type="button" onClick={onRefreshDbHealth} className="small-icon-button">刷新数据库状态</button>
                    <button type="button" onClick={onLogout} className="small-icon-button">退出当前档案</button>
                  </div>
                  <div style={styles.schoolGrid}>
                    {DEFAULT_SCHOOL_CONFIG.contacts.slice(0, 3).map(contact => (
                      <div key={contact.id} style={styles.schoolCard}>
                        <strong>{contact.label}</strong>
                        <span>{contact.value}</span>
                      </div>
                    ))}
                  </div>
                </SettingBlock>

                <div style={styles.settingActions}>
                  <button type="button" onClick={() => onUpdateSettings?.(draftSettings)} className="primary-cta" style={styles.panelAction} data-testid="save-settings-button">保存设置</button>
                  <button type="button" onClick={() => { setDraftSettings(DEFAULT_APP_SETTINGS); onUpdateSettings?.(DEFAULT_APP_SETTINGS) }} className="secondary-cta" style={styles.panelAction}>恢复默认设置</button>
                </div>

                {releaseInfo && (
                  <div style={styles.releaseBox}>
                    <div>版本：{releaseInfo.version}</div>
                    <div>数据目录：{releaseInfo.userDataPath}</div>
                    <div>日志目录：{releaseInfo.logsPath}</div>
                    <div style={styles.settingActions}>
                      <button type="button" onClick={() => handlePathAction(window.electronAPI.app.openUserDataPath, '已打开数据目录', '打开数据目录失败')} className="small-icon-button">打开数据目录</button>
                      <button type="button" onClick={() => handlePathAction(window.electronAPI.app.openLogsPath, '已打开日志目录', '打开日志目录失败')} className="small-icon-button">打开日志目录</button>
                      <button type="button" onClick={() => handlePathAction(window.electronAPI.app.exportLogs, '日志已导出', '日志导出失败')} className="small-icon-button">导出日志包</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <span>版本 1.0.0</span>
        <span>本游戏内容纯属虚构，如有雷同，纯属巧合。</span>
        <span><Cloud size={17} /> 云存档已同步</span>
        <span><CalendarDays size={17} /> {new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        <span><BookOpen size={17} /> 已解锁 {chapters.length - lockedCount}/{chapters.length} 章节</span>
      </footer>
    </div>
  )
}

function TopTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...styles.topTab, ...(active ? styles.topTabActive : {}) }} data-testid={`menu-tab-${label}`}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={styles.miniStat}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PanelHeader({ kicker, title, subtitle, action }: { kicker: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={styles.panelHeader}>
      <div>
        <div style={styles.panelKicker}>{kicker}</div>
        <h2 style={styles.panelTitle}>{title}<span className="leaf-mark" /></h2>
        <p style={styles.panelSubtitle}>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function SettingBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={styles.settingBlock}>
      <h3 style={styles.settingBlockTitle}>{icon}{title}</h3>
      {children}
    </section>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label style={styles.toggleRow}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} style={styles.toggleInput} />
    </label>
  )
}

function MapIcon() {
  return <BookOpen size={18} />
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--color-bg)',
    transition: 'opacity var(--transition-normal)'
  },
  photoLayer: {
    position: 'absolute',
    inset: 0,
    background: 'url(/backgrounds/campus_gate.png) center/cover',
    transform: 'scale(1.02)'
  },
  topBar: {
    position: 'relative',
    zIndex: 4,
    height: 96,
    display: 'grid',
    gridTemplateColumns: 'minmax(330px, 1fr) auto minmax(330px, 1fr)',
    alignItems: 'center',
    gap: 22,
    padding: '24px 50px 12px'
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoAI: {
    fontSize: 48
  },
  logoTitle: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    fontSize: 27,
    fontWeight: 900
  },
  logoSub: {
    color: 'var(--color-text-dim)',
    fontSize: 13
  },
  tabNav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    borderRadius: 14,
    padding: 4,
    minWidth: 520
  },
  topTab: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 10,
    color: 'var(--color-text-dim)',
    fontSize: 15,
    fontWeight: 800
  },
  topTabActive: {
    color: 'var(--color-primary)',
    background: 'rgba(159, 202, 120, 0.12)',
    boxShadow: 'inset 0 -2px 0 var(--color-primary)'
  },
  topActions: {
    justifySelf: 'end',
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  shell: {
    position: 'relative',
    zIndex: 3,
    height: 'calc(100vh - 150px)',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: 18,
    padding: '0 54px',
    overflow: 'hidden'
  },
  shellCompact: {
    height: 'calc(100vh - 118px)',
    overflowY: 'auto',
    padding: '0 18px 24px'
  },
  heroColumn: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 1.15fr auto',
    gap: 20,
    alignItems: 'end'
  },
  heroTitleRow: {
    minWidth: 0
  },
  heroTitle: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(42px, 5vw, 76px)',
    lineHeight: 1.08,
    fontWeight: 900,
    textShadow: '0 10px 38px rgba(0,0,0,0.55)'
  },
  heroAccent: {
    color: 'var(--color-primary)'
  },
  heroSubtitle: {
    color: 'var(--color-text-dim)',
    fontSize: 21,
    marginTop: 8
  },
  profileCard: {
    display: 'grid',
    gridTemplateColumns: '96px 1fr',
    alignItems: 'center',
    gap: 18,
    borderRadius: 14,
    padding: 18
  },
  avatarPortrait: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.86), rgba(229,190,101,0.72))',
    color: '#fff',
    fontSize: 38,
    fontWeight: 900,
    boxShadow: 'var(--shadow-gold)'
  },
  profileMain: {
    minWidth: 0
  },
  profileHeaderLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  playerName: {
    color: 'var(--color-text)',
    fontSize: 26,
    fontWeight: 900
  },
  renameButton: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    fontWeight: 800
  },
  renameForm: {
    display: 'flex',
    gap: 8
  },
  renameInput: {
    minWidth: 0,
    flex: 1,
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)'
  },
  profileMeta: {
    color: 'var(--color-text-dim)',
    fontSize: 14,
    marginTop: 6
  },
  profileProgressLine: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    alignItems: 'center',
    color: 'var(--color-text-dim)',
    fontSize: 13,
    marginTop: 12
  },
  profileProgressTrack: {
    minWidth: 130
  },
  statStrip: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    borderTop: '1px solid var(--color-border)',
    marginTop: 12,
    paddingTop: 12
  },
  miniStat: {
    display: 'grid',
    justifyItems: 'center',
    gap: 4,
    color: 'var(--color-accent)',
    fontSize: 12,
    borderRight: '1px solid var(--color-border)'
  },
  ctaRow: {
    display: 'grid',
    gap: 12,
    minWidth: 260
  },
  inlineTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    maxWidth: 580,
    marginBottom: 14,
    borderBottom: '1px solid var(--color-border)'
  },
  inlineTab: {
    padding: '12px 10px',
    color: 'var(--color-text-dim)',
    fontSize: 15,
    fontWeight: 800
  },
  inlineTabActive: {
    padding: '12px 10px',
    color: 'var(--color-primary)',
    fontSize: 15,
    fontWeight: 900,
    boxShadow: 'inset 0 -2px 0 var(--color-primary)'
  },
  chapterRail: {
    minHeight: 0,
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)), rgba(16,22,18,0.74)'
  },
  chapterCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, minmax(145px, 1fr))',
    gap: 14,
    overflowX: 'auto',
    paddingBottom: 10
  },
  chapterCard: {
    minHeight: 232,
    minWidth: 145,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    textAlign: 'left',
    padding: 14,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'var(--color-text)',
    boxShadow: '0 14px 36px rgba(0,0,0,0.26)'
  },
  chapterCardActive: {
    boxShadow: 'var(--shadow-glow)'
  },
  chapterCardLocked: {
    opacity: 0.48,
    filter: 'grayscale(0.5)'
  },
  chapterNumber: {
    color: 'var(--color-primary)',
    fontSize: 26,
    fontWeight: 900,
    fontFamily: 'var(--font-mono)'
  },
  chapterTitle: {
    color: 'var(--color-text)',
    fontSize: 18,
    fontWeight: 900,
    marginTop: 4
  },
  chapterDesc: {
    color: 'var(--color-text-dim)',
    fontSize: 12,
    lineHeight: 1.55,
    marginTop: 8,
    minHeight: 58
  },
  chapterProgress: {
    marginTop: 10
  },
  chapterFoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'var(--color-text-dim)',
    fontSize: 12,
    marginTop: 8
  },
  chapterDetail: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr 360px',
    gap: 22,
    alignItems: 'center',
    minHeight: 150,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    background:
      'linear-gradient(135deg, rgba(159,202,120,0.12), rgba(255,255,255,0.045)), rgba(3,7,6,0.38)',
    border: '1px solid var(--color-border)'
  },
  chapterDetailImage: {
    width: '100%',
    height: 128,
    objectFit: 'cover',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'
  },
  chapterDetailBody: {
    minWidth: 0
  },
  detailKicker: {
    color: 'var(--color-primary)',
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 6
  },
  detailTitle: {
    color: 'var(--color-text)',
    fontSize: 28,
    fontFamily: 'var(--font-display)',
    lineHeight: 1.15,
    marginBottom: 8
  },
  detailText: {
    color: 'var(--color-text-dim)',
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 10
  },
  detailTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  detailTag: {
    padding: '5px 10px',
    borderRadius: 999,
    color: 'var(--color-text)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--color-border)',
    fontSize: 12,
    fontWeight: 800
  },
  detailUnlocks: {
    minWidth: 0,
    borderLeft: '1px solid var(--color-border)',
    paddingLeft: 22
  },
  unlockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    marginBottom: 14
  },
  unlockItem: {
    minHeight: 58,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: 'var(--color-text-dim)',
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800
  },
  detailButton: {
    width: '100%',
    minHeight: 48,
    fontSize: 16
  },
  pagePanel: {
    minHeight: 0,
    borderRadius: 20,
    padding: 28,
    overflowY: 'auto'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 24
  },
  panelKicker: {
    color: 'var(--color-primary)',
    fontSize: 15,
    fontWeight: 900,
    marginBottom: 6
  },
  panelTitle: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    fontSize: 44,
    lineHeight: 1.08
  },
  panelSubtitle: {
    color: 'var(--color-text-dim)',
    fontSize: 16,
    marginTop: 8
  },
  panelAction: {
    minHeight: 48,
    fontSize: 15
  },
  saveLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 980
  },
  autosaveCard: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr auto',
    alignItems: 'center',
    gap: 20,
    padding: 14,
    textAlign: 'left',
    borderRadius: 14,
    background: 'rgba(159, 202, 120, 0.08)',
    border: '1px solid var(--color-border-strong)',
    color: 'var(--color-text)',
    boxShadow: 'var(--shadow-glow)'
  },
  saveRow: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr auto 28px',
    alignItems: 'center',
    gap: 18,
    padding: 12,
    textAlign: 'left',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)'
  },
  saveThumb: {
    width: '100%',
    height: 86,
    objectFit: 'cover',
    borderRadius: 9
  },
  saveThumbSmall: {
    width: '100%',
    height: 68,
    objectFit: 'cover',
    borderRadius: 8
  },
  saveBody: {
    minWidth: 0
  },
  saveBadge: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 6,
    background: 'var(--color-primary)',
    color: '#102010',
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 8
  },
  saveTitle: {
    color: 'var(--color-text)',
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 6
  },
  saveMeta: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    lineHeight: 1.6
  },
  saveTime: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    whiteSpace: 'nowrap'
  },
  emptyBox: {
    padding: 22,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.045)',
    border: '1px dashed rgba(244,239,228,0.25)',
    color: 'var(--color-text-dim)'
  },
  achievementHero: {
    display: 'grid',
    gridTemplateColumns: '220px 180px 1fr',
    alignItems: 'center',
    gap: 28,
    marginBottom: 22
  },
  achievementScore: {
    color: 'var(--color-text)',
    fontSize: 36,
    fontWeight: 900
  },
  achievementCircle: {
    height: 10
  },
  recentCard: {
    display: 'flex',
    gap: 18,
    alignItems: 'center',
    minHeight: 128,
    borderRadius: 14,
    padding: 20,
    background: 'linear-gradient(135deg, rgba(229,190,101,0.15), rgba(255,255,255,0.045))',
    border: '1px solid rgba(229,190,101,0.32)'
  },
  recentKicker: {
    color: 'var(--color-primary)',
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 6
  },
  recentTitle: {
    color: 'var(--color-text)',
    fontSize: 22,
    fontWeight: 900
  },
  achievementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 14
  },
  achievementCard: {
    display: 'grid',
    gridTemplateColumns: '66px 1fr',
    gap: 14,
    minHeight: 128,
    padding: 18,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.055)'
  },
  achievementUnlocked: {
    borderColor: 'rgba(229,190,101,0.42)',
    boxShadow: 'var(--shadow-gold)'
  },
  achievementLocked: {
    opacity: 0.56
  },
  achievementIcon: {
    width: 58,
    height: 58,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid rgba(229,190,101,0.28)',
    color: 'var(--color-accent)'
  },
  achievementCategory: {
    color: 'var(--color-accent)',
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 6
  },
  achievementTitle: {
    color: 'var(--color-text)',
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 7
  },
  achievementText: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    lineHeight: 1.55
  },
  settingsLayout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: 24
  },
  settingsSide: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.04)',
    padding: 10,
    alignSelf: 'start'
  },
  settingsSideItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minHeight: 60,
    padding: '0 18px',
    borderRadius: 10,
    color: 'var(--color-text-dim)',
    fontSize: 17,
    fontWeight: 800
  },
  settingsSideItemActive: {
    color: 'var(--color-text)',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.22), rgba(159,202,120,0.08))',
    border: '1px solid var(--color-border-strong)'
  },
  settingsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  settingBlock: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.045)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  settingBlockTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: 'var(--color-text)',
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 6
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 46,
    color: 'var(--color-text)',
    fontSize: 15,
    borderBottom: '1px solid rgba(244,239,228,0.08)'
  },
  toggleInput: {
    width: 20,
    height: 20,
    accentColor: 'var(--color-primary)'
  },
  settingLabel: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    fontWeight: 800
  },
  settingInput: {
    minHeight: 48,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text)',
    padding: '0 14px'
  },
  rangeInput: {
    width: '100%',
    accentColor: 'var(--color-primary)'
  },
  settingValue: {
    color: 'var(--color-text)',
    fontWeight: 900
  },
  dbOk: {
    color: 'var(--color-primary)'
  },
  dbWarn: {
    color: 'var(--color-warning)'
  },
  settingActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  },
  schoolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10
  },
  schoolCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-dim)',
    fontSize: 12
  },
  releaseBox: {
    color: 'var(--color-text-dim)',
    fontSize: 12,
    lineHeight: 1.8,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.035)',
    padding: 16
  },
  footer: {
    position: 'relative',
    zIndex: 4,
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    padding: '0 54px',
    color: 'var(--color-text-muted)',
    fontSize: 13
  }
}
