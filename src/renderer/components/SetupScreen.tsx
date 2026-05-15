import React, { useEffect, useState } from 'react'
import { Database, HelpCircle, LogOut, MoreHorizontal, Settings, UserRound } from 'lucide-react'
import type { AuthSession, DbHealth, PlayerProfile } from '../../data/types'

type LoginTab = 'account' | 'guest'

interface SetupScreenProps {
  onSubmit: (playerName: string, profile?: PlayerProfile | null, session?: AuthSession | null) => void
  initialPlayerName?: string
  profiles?: PlayerProfile[]
  currentProfileId?: string
  onProfileSelect?: (profileId: string) => void
  dbHealth?: DbHealth | null
}

export default function SetupScreen({
  onSubmit,
  initialPlayerName = '',
  profiles = [],
  currentProfileId,
  onProfileSelect,
  dbHealth
}: SetupScreenProps) {
  const [activeTab, setActiveTab] = useState<LoginTab>('guest')
  const [playerName, setPlayerName] = useState(initialPlayerName)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState(initialPlayerName)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 860 : false)

  useEffect(() => {
    if (initialPlayerName.trim()) {
      setPlayerName(initialPlayerName)
      setDisplayName(initialPlayerName)
    }
  }, [initialPlayerName])

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 860)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!username.trim() || !password.trim()) {
        setError('请输入账号和密码')
        return
      }

      const authResult = isRegistering
        ? await window.electronAPI.auth.register({
            username: username.trim(),
            password,
            displayName: displayName.trim() || username.trim()
          })
        : await window.electronAPI.auth.login({ username: username.trim(), password })

      if (!authResult.ok || !authResult.profile || !authResult.session) {
        setError(authResult.message)
        return
      }

      onSubmit(authResult.profile.name, authResult.profile, authResult.session)
    } catch (err) {
      setError(formatSetupError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!playerName.trim()) {
        setError('请输入你的昵称')
        return
      }

      const profile = await window.electronAPI.profiles.upsert(playerName.trim())
      const session = await window.electronAPI.auth.getSession()
      onSubmit(profile.name, profile, session)
    } catch (err) {
      setError(formatSetupError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.container} data-testid="setup-screen">
      <div style={styles.photoLayer} />
      <div className="cinema-bg" />

      <main style={{ ...styles.shell, ...(isCompact ? styles.shellCompact : {}) }}>
        <section className="glass-panel-strong" style={styles.entryPanel}>
          <div style={styles.brandLine}>
            <span className="brand-ai">AI</span>
            <div>
              <h1 className="brand-title">校园生存模拟器</h1>
              <p style={styles.subtitle} className="leaf-mark">在大学生活中学习、选择、成长</p>
            </div>
          </div>

          <div style={styles.formCard}>
            <div style={styles.tabRow}>
              <button
                type="button"
                onClick={() => setActiveTab('guest')}
                style={{ ...styles.tabButton, ...(activeTab === 'guest' ? styles.tabActive : {}) }}
                data-testid="tab-guest"
              >
                昵称开始
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                style={{ ...styles.tabButton, ...(activeTab === 'account' ? styles.tabActive : {}) }}
                data-testid="tab-account"
              >
                账号登录
              </button>
            </div>

            {activeTab === 'guest' ? (
              <form onSubmit={handleGuestSubmit} style={styles.form}>
                <label style={styles.label} htmlFor="guest-name-input">请输入你的昵称</label>
                <div style={styles.inputShell}>
                  <UserRound size={20} />
                  <input
                    id="guest-name-input"
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    placeholder="输入你的名字..."
                    maxLength={12}
                    style={styles.input}
                    disabled={submitting}
                    data-testid="guest-name-input"
                    autoFocus
                  />
                </div>
                <div style={styles.lengthHint}>{playerName.trim().length} / 12</div>
                <p style={styles.hint}>离线即可游玩。配置 AI 代理后，NPC 对话会自动增强。</p>
                {error && <div style={styles.errorBox}>{error}</div>}
                <button type="submit" className="primary-cta" style={styles.fullButton} disabled={submitting} data-testid="guest-start-button">
                  {submitting ? '验证中...' : '开始你的大学生活'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAccountSubmit} style={styles.form}>
                <label style={styles.label} htmlFor="account-username">账号</label>
                <input id="account-username" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入账号" style={styles.fieldInput} disabled={submitting} data-testid="account-username-input" />
                <label style={styles.label} htmlFor="account-password">密码</label>
                <input id="account-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" style={styles.fieldInput} disabled={submitting} data-testid="account-password-input" />
                {isRegistering && (
                  <>
                    <label style={styles.label} htmlFor="account-display-name">显示名称</label>
                    <input id="account-display-name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="例如：林知夏" maxLength={12} style={styles.fieldInput} disabled={submitting} data-testid="account-display-name-input" />
                  </>
                )}
                <button type="button" onClick={() => setIsRegistering(prev => !prev)} style={styles.linkButton}>
                  {isRegistering ? '已有账号？返回登录' : '没有账号？去注册'}
                </button>
                {error && <div style={styles.errorBox}>{error}</div>}
                <button type="submit" className="primary-cta" style={styles.fullButton} disabled={submitting} data-testid="account-start-button">
                  {submitting ? '处理中...' : isRegistering ? '注册并开始' : '登录并开始'}
                </button>
              </form>
            )}
          </div>

          <div style={styles.dbCard}>
            <Database size={18} color={dbHealth?.available ? 'var(--color-primary)' : 'var(--color-warning)'} />
            <div>
              <div style={styles.dbTitle}>数据库状态</div>
              <div style={styles.dbLine}>{dbHealth?.available ? '本地数据库：已连接' : '本地模式：可正常游玩'}</div>
              <div style={styles.dbLine}>{dbHealth?.available ? '云端同步：已启用' : dbHealth?.message ?? '数据库不可用时会自动降级'}</div>
            </div>
          </div>
        </section>

        <aside className="glass-panel" style={styles.profilesPanel}>
          <h2 style={styles.panelTitle}>已有档案</h2>
          <div style={styles.profileList}>
            {profiles.slice(0, 3).map((profile, index) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setPlayerName(profile.name)
                  onProfileSelect?.(profile.id)
                }}
                style={{ ...styles.profileCard, ...(profile.id === currentProfileId ? styles.profileCardActive : {}) }}
                disabled={submitting}
              >
                <div style={styles.avatar}>{profile.name.slice(0, 1) || index + 1}</div>
                <div style={styles.profileMeta}>
                  <div style={styles.profileName}>{profile.name}</div>
                  <div style={styles.profileSub}>最后游玩：{new Date(profile.lastLoginAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="progress-track" style={styles.profileProgress}>
                    <div className="progress-fill" style={{ width: `${Math.max(30, 42 + index * 11)}%` }} />
                  </div>
                </div>
                <MoreHorizontal size={18} color="var(--color-text-muted)" />
              </button>
            ))}

            <button type="button" style={styles.newProfileCard} onClick={() => setActiveTab('guest')}>
              <span style={styles.plusCircle}>+</span>
              <div>
                <div style={styles.profileName}>新建档案</div>
                <div style={styles.profileSub}>开启一段新的大学旅程</div>
              </div>
            </button>
          </div>
        </aside>
      </main>

      <footer style={styles.footer}>
        <span>版本 1.0.0</span>
        <div style={styles.footerLinks}>
          <span><Settings size={16} /> 设置</span>
          <span><HelpCircle size={16} /> 帮助</span>
          <span><LogOut size={16} /> 退出游戏</span>
        </div>
      </footer>
    </div>
  )
}

function formatSetupError(err: unknown): string {
  const msg = err instanceof Error ? err.message : '未知错误'
  return `启动失败：${msg}`
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100vw',
    minHeight: '100vh',
    overflow: 'hidden',
    background: 'var(--color-bg)'
  },
  photoLayer: {
    position: 'absolute',
    inset: 0,
    background: 'url(/backgrounds/campus_gate.png) center/cover',
    transform: 'scale(1.02)'
  },
  shell: {
    position: 'relative',
    zIndex: 2,
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: 'minmax(520px, 760px) minmax(320px, 420px)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    padding: '58px 72px 82px'
  },
  shellCompact: {
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    padding: '24px 18px 86px',
    overflowY: 'auto'
  },
  entryPanel: {
    borderRadius: 22,
    padding: '46px 44px'
  },
  brandLine: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 18,
    marginBottom: 30
  },
  subtitle: {
    color: 'var(--color-text-dim)',
    fontSize: 18,
    marginTop: 8
  },
  formCard: {
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.055)',
    border: '1px solid var(--color-border)',
    padding: 26,
    marginBottom: 22
  },
  tabRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: 26
  },
  tabButton: {
    position: 'relative',
    padding: '0 0 16px',
    color: 'var(--color-text-dim)',
    fontSize: 20,
    fontWeight: 800
  },
  tabActive: {
    color: 'var(--color-primary)',
    boxShadow: 'inset 0 -2px 0 var(--color-primary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  label: {
    color: 'var(--color-text)',
    fontSize: 14,
    fontWeight: 800
  },
  inputShell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    padding: '0 16px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.055)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-dim)'
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text)',
    fontSize: 17
  },
  fieldInput: {
    width: '100%',
    minHeight: 48,
    padding: '0 14px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.055)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: 15
  },
  lengthHint: {
    alignSelf: 'flex-end',
    color: 'var(--color-text-muted)',
    fontSize: 13
  },
  hint: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    lineHeight: 1.7
  },
  linkButton: {
    alignSelf: 'flex-start',
    color: 'var(--color-primary)',
    fontSize: 13,
    fontWeight: 800
  },
  errorBox: {
    padding: '10px 12px',
    borderRadius: 10,
    background: 'rgba(238, 127, 113, 0.15)',
    border: '1px solid rgba(238, 127, 113, 0.32)',
    color: '#ffd2cc',
    fontSize: 13,
    lineHeight: 1.5
  },
  fullButton: {
    width: '100%',
    marginTop: 8
  },
  dbCard: {
    display: 'flex',
    gap: 12,
    padding: 17,
    borderRadius: 14,
    background: 'rgba(255, 255, 255, 0.045)',
    border: '1px solid var(--color-border)'
  },
  dbTitle: {
    color: 'var(--color-text)',
    fontSize: 14,
    fontWeight: 900,
    marginBottom: 8
  },
  dbLine: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    lineHeight: 1.6
  },
  profilesPanel: {
    borderRadius: 20,
    padding: 24
  },
  panelTitle: {
    color: 'var(--color-text)',
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 18
  },
  profileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  profileCard: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr 20px',
    alignItems: 'center',
    gap: 14,
    minHeight: 118,
    padding: 16,
    textAlign: 'left',
    borderRadius: 14,
    background: 'rgba(255, 255, 255, 0.055)',
    border: '1px solid var(--color-border)'
  },
  profileCardActive: {
    borderColor: 'var(--color-border-strong)',
    boxShadow: 'var(--shadow-glow)'
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.85), rgba(229,190,101,0.65))',
    color: '#fff',
    fontSize: 24,
    fontWeight: 900
  },
  profileMeta: {
    minWidth: 0
  },
  profileName: {
    color: 'var(--color-text)',
    fontSize: 17,
    fontWeight: 900,
    marginBottom: 6
  },
  profileSub: {
    color: 'var(--color-text-dim)',
    fontSize: 12,
    lineHeight: 1.45
  },
  profileProgress: {
    marginTop: 10
  },
  newProfileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    minHeight: 104,
    padding: 18,
    textAlign: 'left',
    borderRadius: 14,
    background: 'rgba(255, 255, 255, 0.045)',
    border: '1px dashed rgba(244, 239, 228, 0.22)'
  },
  plusCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    border: '1px dashed rgba(244, 239, 228, 0.34)',
    color: 'var(--color-text-dim)',
    fontSize: 34
  },
  footer: {
    position: 'absolute',
    zIndex: 3,
    left: 34,
    right: 34,
    bottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    color: 'var(--color-text-muted)',
    fontSize: 13
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 28
  }
}
