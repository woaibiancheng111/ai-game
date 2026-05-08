import React, { useEffect, useMemo, useState } from 'react'
import type { AuthSession, ChapterMeta, DbHealth, GameState, SaveSlotMeta } from '../../data/types'
import { DEFAULT_SCHOOL_CONFIG } from '../../data/school/defaultConfig'
import { getAchievements } from '../../engine/achievements'

type MenuTab = 'start' | 'saves' | 'achievements' | 'settings'

interface MainMenuProps {
  playerName: string
  gameState: GameState
  chapters: ChapterMeta[]
  unlockedActIds: string[]
  hasAutosave?: boolean
  saveSlots?: SaveSlotMeta[]
  initialApiKey?: string
  authSession?: AuthSession | null
  dbHealth?: DbHealth | null
  syncedAchievementIds?: string[]
  onStartChapter: (actId: string) => void
  onRenamePlayer?: (name: string) => void
  onLoadAutosave?: () => void
  onLoadSave?: (slotId: string) => void
  onSaveManual?: () => void
  onUpdateApiKey?: (apiKey: string) => void
  onRefreshDbHealth?: () => void
  onLogout?: () => void
}

export default function MainMenu({
  playerName,
  gameState,
  chapters,
  unlockedActIds,
  hasAutosave = false,
  saveSlots = [],
  initialApiKey = '',
  authSession,
  dbHealth,
  syncedAchievementIds = [],
  onStartChapter,
  onRenamePlayer,
  onLoadAutosave,
  onLoadSave,
  onSaveManual,
  onUpdateApiKey,
  onRefreshDbHealth,
  onLogout
}: MainMenuProps) {
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<MenuTab>('start')
  const [isRenaming, setIsRenaming] = useState(false)
  const [draftName, setDraftName] = useState(playerName)
  const [draftApiKey, setDraftApiKey] = useState(initialApiKey)
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 920 : false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 920)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setDraftName(playerName)
  }, [playerName])

  useEffect(() => {
    setDraftApiKey(initialApiKey)
  }, [initialApiKey])

  const achievements = useMemo(() => getAchievements(gameState, saveSlots, syncedAchievementIds), [gameState, saveSlots, syncedAchievementIds])
  const unlockedCount = achievements.filter(item => item.unlocked).length
  const latestChapter = [...chapters].reverse().find(chapter => unlockedActIds.includes(chapter.actId)) ?? chapters[0]
  const newestSave = [...saveSlots].sort((a, b) => b.savedAt - a.savedAt)[0]

  return (
    <div style={{ ...styles.container, opacity: visible ? 1 : 0 }}>
      <div style={styles.backdrop} />
      <div style={styles.skyGlow} />
      <div style={{ ...styles.shell, ...(isCompact ? styles.shellCompact : {}) }}>
        <aside style={{ ...styles.sidebar, ...(isCompact ? styles.sidebarCompact : {}) }}>
          <div style={styles.brandBlock}>
            <div style={styles.brandKicker}>AI Campus Visual Novel</div>
            <h1 style={styles.brandTitle}>新生校园生存模拟器</h1>
            <p style={styles.brandText}>一份会回应你的入学手册，一场从校门口走到毕业典礼的互动练习。</p>
          </div>

          <div style={styles.profileCard}>
            {isRenaming ? (
              <form
                style={styles.renameForm}
                onSubmit={(event) => {
                  event.preventDefault()
                  const nextName = draftName.trim()
                  if (nextName) {
                    onRenamePlayer?.(nextName)
                    setIsRenaming(false)
                  }
                }}
              >
                <input
                  value={draftName}
                  onChange={event => setDraftName(event.target.value)}
                  maxLength={16}
                  style={styles.renameInput}
                  autoFocus
                />
                <div style={styles.renameActions}>
                  <button type="submit" style={styles.smallPrimaryButton}>保存</button>
                  <button type="button" onClick={() => setIsRenaming(false)} style={styles.smallGhostButton}>取消</button>
                </div>
              </form>
            ) : (
              <>
                <div style={styles.profileLabel}>当前档案</div>
                <div style={styles.profileName}>{playerName || '新生'}</div>
                <button type="button" onClick={() => setIsRenaming(true)} style={styles.linkButton}>更改名字</button>
              </>
            )}
          </div>

          <nav style={{ ...styles.navStack, ...(isCompact ? styles.navStackCompact : {}) }}>
            <MenuButton active={activeTab === 'start'} label="开始游戏" subLabel="选择章节进入主线" onClick={() => setActiveTab('start')} />
            <MenuButton active={activeTab === 'saves'} label="存档" subLabel="继续或管理进度" onClick={() => setActiveTab('saves')} />
            <MenuButton active={activeTab === 'achievements'} label="成就" subLabel={`${unlockedCount}/${achievements.length} 已解锁`} onClick={() => setActiveTab('achievements')} />
            <MenuButton active={activeTab === 'settings'} label="设置" subLabel="账号和模型配置" onClick={() => setActiveTab('settings')} />
          </nav>
        </aside>

        <main style={{ ...styles.mainPanel, ...(isCompact ? styles.mainPanelCompact : {}) }}>
          {activeTab === 'start' && (
            <section>
              <div style={{ ...styles.heroPanel, ...(isCompact ? styles.heroPanelCompact : {}) }}>
                <div>
                  <div style={styles.panelKicker}>Campus Life</div>
                  <h2 style={styles.heroTitle}>开始你的大学路线</h2>
                  <p style={styles.heroText}>
                    在迎新、学习、宿舍、兼职、AI 工具和毕业选择里练习判断力。这里不是背诵手册，而是亲自走过一次。
                  </p>
                </div>
                <div style={styles.heroActions}>
                  {hasAutosave && onLoadAutosave && (
                    <button type="button" onClick={onLoadAutosave} style={styles.primaryButton}>继续游戏</button>
                  )}
                  <button type="button" onClick={() => onStartChapter('act1')} style={styles.secondaryButton}>新的开始</button>
                </div>
              </div>

              <div style={{ ...styles.featureRow, ...(isCompact ? styles.featureRowCompact : {}) }}>
                <InfoTile label="当前进度" value={latestChapter ? `第 ${latestChapter.actNumber} 章` : '第 1 章'} />
                <InfoTile label="已解锁章节" value={`${unlockedActIds.length}/${chapters.length}`} />
                <InfoTile label="成就" value={`${unlockedCount}/${achievements.length}`} />
              </div>

              <div style={{ ...styles.quickGrid, ...(isCompact ? styles.quickGridCompact : {}) }}>
                <QuickAction title="存档" text={newestSave ? `${newestSave.currentLocation} · 第 ${newestSave.week} 周` : '查看自动存档和手动存档'} onClick={() => setActiveTab('saves')} />
                <QuickAction title="成就" text="查看大学路线里解锁过的成长标记" onClick={() => setActiveTab('achievements')} />
                <QuickAction title="设置" text="配置模型 API Key 和当前玩家档案" onClick={() => setActiveTab('settings')} />
              </div>

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>章节选择</div>
                <div style={styles.sectionHint}>后续章节会随着主线进度解锁</div>
              </div>
              <div style={styles.chapterList}>
                {chapters.map(chapter => {
                  const unlocked = unlockedActIds.includes(chapter.actId)
                  return (
                    <button
                      key={chapter.actId}
                      type="button"
                      onClick={() => unlocked && onStartChapter(chapter.actId)}
                      disabled={!unlocked}
                      style={{
                        ...styles.chapterRow,
                        ...(isCompact ? styles.chapterRowCompact : {}),
                        ...(unlocked ? styles.chapterRowUnlocked : styles.chapterRowLocked),
                        borderLeftColor: CHAPTER_ACCENTS[chapter.actId] ?? '#2dd4bf'
                      }}
                    >
                      <div style={styles.chapterNumber}>第 {chapter.actNumber} 章</div>
                      <div style={styles.chapterBody}>
                        <div style={styles.chapterTitle}>{chapter.title}</div>
                        <div style={styles.chapterSubtitle}>{chapter.subtitle}</div>
                        <p style={styles.chapterDescription}>{chapter.description}</p>
                        <div style={styles.themeRow}>
                          {chapter.themes.map(theme => <span key={theme} style={styles.themePill}>{theme}</span>)}
                        </div>
                      </div>
                      <div style={unlocked ? styles.chapterStatus : styles.chapterStatusLocked}>
                        {unlocked ? '进入' : '未解锁'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {activeTab === 'saves' && (
            <section>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelKicker}>Saves</div>
                  <h2 style={styles.panelTitle}>存档</h2>
                </div>
                <button type="button" onClick={onSaveManual} style={styles.secondaryButton}>保存当前进度</button>
              </div>

              <div style={styles.saveStack}>
                {hasAutosave && onLoadAutosave && (
                  <button type="button" onClick={onLoadAutosave} style={styles.saveCard}>
                    <span style={styles.saveTitle}>自动存档</span>
                    <span style={styles.saveMeta}>继续最近一次游戏进度</span>
                  </button>
                )}

                {saveSlots.length === 0 && !hasAutosave && (
                  <div style={styles.emptyBox}>当前没有可读取的存档。开始游戏后会自动保存进度。</div>
                )}

                {saveSlots.map(save => (
                  <button key={save.slotId} type="button" onClick={() => onLoadSave?.(save.slotId)} style={styles.saveCard}>
                    <span style={styles.saveTitle}>{save.label}</span>
                    <span style={styles.saveMeta}>{save.currentLocation} · 第 {save.week} 周 · {new Date(save.savedAt).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'achievements' && (
            <section>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelKicker}>Achievements</div>
                  <h2 style={styles.panelTitle}>成就</h2>
                </div>
              </div>
              <div style={styles.achievementGrid}>
                {achievements.map(item => (
                  <div key={item.id} style={{ ...styles.achievementCard, opacity: item.unlocked ? 1 : 0.52 }}>
                  <div style={styles.achievementBadge}>{item.unlocked ? '已解锁' : '未解锁'}</div>
                    <div style={styles.achievementCategory}>{item.category}</div>
                    <div style={styles.achievementTitle}>{item.title}</div>
                    <p style={styles.achievementText}>{item.description}</p>
                    {!item.unlocked && <p style={styles.achievementHint}>{item.unlockHint}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelKicker}>Settings</div>
                  <h2 style={styles.panelTitle}>设置</h2>
                </div>
              </div>

              <div style={styles.settingsBox}>
                <div style={styles.settingGroup}>
                  <div style={styles.settingLabel}>账号状态</div>
                  <div style={styles.settingValue}>
                    {authSession?.mode === 'account' ? `账号：${authSession.username ?? authSession.displayName}` : authSession?.mode === 'guest' ? '昵称档案模式' : '本地模式'}
                  </div>
                  <div style={dbHealth?.available ? styles.dbOk : styles.dbWarn}>
                    {dbHealth?.message ?? '正在检测数据库状态'}
                  </div>
                  <div style={styles.settingActions}>
                    <button type="button" onClick={onRefreshDbHealth} style={styles.smallGhostButton}>刷新数据库状态</button>
                    <button type="button" onClick={onLogout} style={styles.smallGhostButton}>退出当前档案</button>
                  </div>
                </div>

                <label style={styles.settingLabel}>通义千问 / DashScope API Key</label>
                <input
                  type="password"
                  value={draftApiKey}
                  onChange={event => setDraftApiKey(event.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  style={styles.settingInput}
                />
                <button type="button" onClick={() => onUpdateApiKey?.(draftApiKey.trim())} style={styles.primaryButton}>保存设置</button>

                <div style={styles.schoolBox}>
                  <div style={styles.settingLabel}>学校信息</div>
                  <div style={styles.settingValue}>{DEFAULT_SCHOOL_CONFIG.schoolName} · {DEFAULT_SCHOOL_CONFIG.collegeName}</div>
                  {DEFAULT_SCHOOL_CONFIG.contacts.slice(0, 4).map(contact => (
                    <div key={contact.id} style={styles.schoolContact}>
                      <span>{contact.label}</span>
                      <strong>{contact.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function MenuButton({ active, label, subLabel, onClick }: { active: boolean; label: string; subLabel: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...styles.navButton, ...(active ? styles.navButtonActive : {}) }}>
      <span style={styles.navLabel}>{label}</span>
      <span style={styles.navSubLabel}>{subLabel}</span>
    </button>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoTile}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  )
}

function QuickAction({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={styles.quickAction}>
      <span style={styles.quickTitle}>{title}</span>
      <span style={styles.quickText}>{text}</span>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(circle at 20% 20%, rgba(20,184,166,0.18), transparent 30%), radial-gradient(circle at 78% 10%, rgba(96,165,250,0.18), transparent 32%), linear-gradient(135deg, #06121f 0%, #0c1b2b 48%, #101827 100%)',
    overflow: 'hidden',
    transition: 'opacity 320ms ease'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.24,
    backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
    backgroundSize: '44px 44px'
  },
  skyGlow: {
    position: 'fixed',
    left: '8%',
    right: '8%',
    bottom: '-18%',
    height: '46%',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, transparent, rgba(20,184,166,0.09) 42%, rgba(15,23,42,0.82))',
    filter: 'blur(12px)'
  },
  shell: {
    position: 'relative',
    zIndex: 1,
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '330px 1fr',
    gap: '24px',
    padding: '32px',
    maxWidth: '1380px',
    margin: '0 auto'
  },
  shellCompact: {
    gridTemplateColumns: '1fr',
    gap: '14px',
    padding: '16px',
    overflowY: 'auto'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    minHeight: 0
  },
  sidebarCompact: {
    gap: '12px'
  },
  brandBlock: {
    padding: '26px',
    borderRadius: '10px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.78), rgba(8,13,24,0.7))',
    border: '1px solid rgba(148,163,184,0.16)',
    boxShadow: '0 20px 48px rgba(0,0,0,0.22)'
  },
  brandKicker: {
    color: '#2dd4bf',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '1px',
    marginBottom: '8px'
  },
  brandTitle: {
    color: '#f8fafc',
    fontSize: '32px',
    lineHeight: 1.18,
    marginBottom: '12px'
  },
  brandText: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.7
  },
  profileCard: {
    padding: '18px',
    borderRadius: '10px',
    background: 'rgba(15,23,42,0.66)',
    border: '1px solid rgba(148,163,184,0.16)'
  },
  profileLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '6px'
  },
  profileName: {
    color: '#e5e7eb',
    fontSize: '20px',
    fontWeight: 800,
    marginBottom: '8px'
  },
  linkButton: {
    color: '#93c5fd',
    background: 'transparent',
    fontSize: '12px',
    fontWeight: 800
  },
  renameForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  renameInput: {
    width: '100%',
    padding: '10px 12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#e5e7eb'
  },
  renameActions: {
    display: 'flex',
    gap: '8px'
  },
  smallPrimaryButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: '#14b8a6',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 800
  },
  smallGhostButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(51,65,85,0.8)',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 700
  },
  navStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  navStackCompact: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
  },
  navButton: {
    textAlign: 'left',
    padding: '16px 18px',
    borderRadius: '10px',
    background: 'rgba(8,13,24,0.58)',
    border: '1px solid rgba(148,163,184,0.14)',
    color: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  navButtonActive: {
    background: 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(37,99,235,0.16))',
    border: '1px solid rgba(45,212,191,0.34)'
  },
  navLabel: {
    fontSize: '17px',
    fontWeight: 800
  },
  navSubLabel: {
    color: '#94a3b8',
    fontSize: '12px'
  },
  mainPanel: {
    minHeight: 0,
    overflowY: 'auto',
    borderRadius: '12px',
    background: 'rgba(8,13,24,0.66)',
    border: '1px solid rgba(148,163,184,0.16)',
    padding: '26px',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.28)'
  },
  mainPanelCompact: {
    overflowY: 'visible',
    padding: '18px'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '18px',
    marginBottom: '18px'
  },
  panelKicker: {
    color: '#2dd4bf',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '1px',
    marginBottom: '6px'
  },
  panelTitle: {
    color: '#f8fafc',
    fontSize: '28px',
    fontWeight: 900
  },
  heroPanel: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '22px',
    alignItems: 'center',
    padding: '24px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(37,99,235,0.14) 52%, rgba(15,23,42,0.88))',
    border: '1px solid rgba(45,212,191,0.22)',
    marginBottom: '16px'
  },
  heroPanelCompact: {
    gridTemplateColumns: '1fr'
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: '34px',
    lineHeight: 1.18,
    fontWeight: 900,
    marginBottom: '10px'
  },
  heroText: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.75,
    maxWidth: '640px'
  },
  heroActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '132px'
  },
  primaryButton: {
    padding: '12px 18px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #14b8a6, #2563eb)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 900
  },
  secondaryButton: {
    padding: '12px 18px',
    borderRadius: '10px',
    background: 'rgba(51,65,85,0.76)',
    color: '#e5e7eb',
    fontSize: '14px',
    fontWeight: 800,
    border: '1px solid rgba(148,163,184,0.18)'
  },
  featureRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '18px'
  },
  featureRowCompact: {
    gridTemplateColumns: '1fr'
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '22px'
  },
  quickGridCompact: {
    gridTemplateColumns: '1fr'
  },
  quickAction: {
    textAlign: 'left',
    padding: '15px 16px',
    borderRadius: '10px',
    background: 'rgba(30,41,59,0.68)',
    border: '1px solid rgba(148,163,184,0.14)',
    color: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minHeight: '88px'
  },
  quickTitle: {
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: 900
  },
  quickText: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.55
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: '17px',
    fontWeight: 900
  },
  sectionHint: {
    color: '#94a3b8',
    fontSize: '12px'
  },
  infoTile: {
    padding: '14px 16px',
    borderRadius: '10px',
    background: 'rgba(30,41,59,0.78)',
    border: '1px solid rgba(148,163,184,0.14)'
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '6px'
  },
  infoValue: {
    color: '#e5e7eb',
    fontSize: '20px',
    fontWeight: 900
  },
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  chapterRow: {
    display: 'grid',
    gridTemplateColumns: '88px 1fr 70px',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'left',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid rgba(148,163,184,0.14)',
    borderLeft: '4px solid #2dd4bf',
    transition: 'transform 150ms ease, border-color 150ms ease, background 150ms ease'
  },
  chapterRowCompact: {
    gridTemplateColumns: '1fr',
    gap: '8px'
  },
  chapterRowUnlocked: {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.78), rgba(15,23,42,0.84))',
    color: '#e5e7eb'
  },
  chapterRowLocked: {
    background: 'rgba(15,23,42,0.48)',
    color: '#64748b',
    cursor: 'not-allowed'
  },
  chapterNumber: {
    color: '#99f6e4',
    fontSize: '13px',
    fontWeight: 900
  },
  chapterBody: {
    minWidth: 0
  },
  chapterTitle: {
    fontSize: '18px',
    fontWeight: 900,
    marginBottom: '4px'
  },
  chapterSubtitle: {
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: 800,
    marginBottom: '6px'
  },
  chapterDescription: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.6,
    marginBottom: '8px'
  },
  themeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  themePill: {
    padding: '4px 7px',
    borderRadius: '7px',
    background: 'rgba(45,212,191,0.1)',
    border: '1px solid rgba(45,212,191,0.18)',
    color: '#99f6e4',
    fontSize: '11px'
  },
  chapterStatus: {
    color: '#86efac',
    fontSize: '13px',
    fontWeight: 900,
    textAlign: 'right'
  },
  chapterStatusLocked: {
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: 800,
    textAlign: 'right'
  },
  saveStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  saveCard: {
    textAlign: 'left',
    padding: '16px',
    borderRadius: '10px',
    background: 'rgba(30,41,59,0.78)',
    border: '1px solid rgba(148,163,184,0.14)',
    color: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  saveTitle: {
    fontSize: '16px',
    fontWeight: 900
  },
  saveMeta: {
    color: '#94a3b8',
    fontSize: '13px'
  },
  emptyBox: {
    padding: '18px',
    borderRadius: '10px',
    background: 'rgba(15,23,42,0.62)',
    border: '1px dashed rgba(148,163,184,0.22)',
    color: '#94a3b8'
  },
  achievementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px'
  },
  achievementCard: {
    padding: '16px',
    borderRadius: '10px',
    background: 'rgba(30,41,59,0.78)',
    border: '1px solid rgba(148,163,184,0.14)'
  },
  achievementBadge: {
    color: '#2dd4bf',
    fontSize: '11px',
    fontWeight: 900,
    marginBottom: '8px'
  },
  achievementCategory: {
    display: 'inline-block',
    color: '#93c5fd',
    fontSize: '11px',
    fontWeight: 800,
    marginBottom: '8px'
  },
  achievementTitle: {
    color: '#e5e7eb',
    fontSize: '16px',
    fontWeight: 900,
    marginBottom: '6px'
  },
  achievementText: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.6
  },
  achievementHint: {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.5,
    marginTop: '8px'
  },
  settingsBox: {
    maxWidth: '520px',
    padding: '18px',
    borderRadius: '10px',
    background: 'rgba(30,41,59,0.78)',
    border: '1px solid rgba(148,163,184,0.14)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  settingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(148,163,184,0.12)'
  },
  settingActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  settingLabel: {
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: 800
  },
  settingValue: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: 800
  },
  dbOk: {
    color: '#99f6e4',
    fontSize: '12px'
  },
  dbWarn: {
    color: '#fde68a',
    fontSize: '12px'
  },
  settingInput: {
    padding: '12px 14px',
    borderRadius: '8px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#e5e7eb',
    fontSize: '14px'
  },
  schoolBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(148,163,184,0.12)'
  },
  schoolContact: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.5
  }
}

const CHAPTER_ACCENTS: Record<string, string> = {
  act1: '#2dd4bf',
  act2: '#38bdf8',
  act3: '#f59e0b',
  act4: '#a78bfa',
  act5: '#86efac',
  act6: '#60a5fa',
  act7: '#f472b6',
  act8: '#facc15'
}
