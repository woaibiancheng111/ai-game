import React, { useEffect, useState } from 'react'
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
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (initialPlayerName.trim()) {
      setPlayerName(initialPlayerName)
      setDisplayName(initialPlayerName)
    }
  }, [initialPlayerName])

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTesting(true)
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
        : await window.electronAPI.auth.login({
            username: username.trim(),
            password
          })

      if (!authResult.ok || !authResult.profile || !authResult.session) {
        setError(authResult.message)
        return
      }

      onSubmit(authResult.profile.name, authResult.profile, authResult.session)
    } catch (err) {
      setError(formatSetupError(err))
    } finally {
      setTesting(false)
    }
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTesting(true)
    setError('')

    try {
      if (!playerName.trim()) {
        setError('请输入你的姓名')
        return
      }

      const profile = await window.electronAPI.profiles.upsert(playerName.trim())
      const session = await window.electronAPI.auth.getSession()
      onSubmit(profile.name, profile, session)
    } catch (err) {
      setError(formatSetupError(err))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={styles.container} data-testid="setup-screen">
      <div style={styles.backdrop} />
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>AI</div>
          <h1 style={styles.title}>AI 校园生存模拟器</h1>
          <p style={styles.subtitle}>Campus Survival Simulator</p>
        </div>

        <div style={dbHealth?.available ? styles.dbOnline : styles.dbOffline}>
          {dbHealth?.available ? 'MySQL 已连接，存档将同步到数据库。' : '当前为本地模式：数据库不可用时仍可继续游戏。'}
        </div>

        <div style={styles.tabRow}>
          <button type="button" onClick={() => setActiveTab('account')} style={{ ...styles.tabButton, ...(activeTab === 'account' ? styles.tabActive : {}) }}>账号登录</button>
          <button type="button" onClick={() => setActiveTab('guest')} style={{ ...styles.tabButton, ...(activeTab === 'guest' ? styles.tabActive : {}) }}>昵称开始</button>
        </div>

        {activeTab === 'account' ? (
          <form onSubmit={handleAccountSubmit} style={styles.form}>
            <label style={styles.label}>账号</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入账号" style={styles.input} disabled={testing} data-testid="account-username-input" />

            <label style={styles.label}>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" style={styles.input} disabled={testing} data-testid="account-password-input" />

            {isRegistering && (
              <>
                <label style={styles.label}>显示名称</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="例如：陈一鸣" maxLength={16} style={styles.input} disabled={testing} data-testid="account-display-name-input" />
              </>
            )}

            <button type="button" onClick={() => setIsRegistering(prev => !prev)} style={styles.linkButton}>
              {isRegistering ? '已有账号，返回登录' : '没有账号，注册一个'}
            </button>

            {error && <div style={styles.errorBox}>{error}</div>}
            <button type="submit" style={styles.button} disabled={testing} data-testid="account-start-button">{testing ? '处理中...' : isRegistering ? '注册并开始' : '登录并开始'}</button>
          </form>
        ) : (
          <form onSubmit={handleGuestSubmit} style={styles.form}>
            {profiles.length > 0 && (
              <>
                <label style={styles.label}>已有档案</label>
                <div style={styles.profileGrid}>
                  {profiles.map(profile => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setPlayerName(profile.name)
                        onProfileSelect?.(profile.id)
                      }}
                      style={{ ...styles.profileButton, ...(profile.id === currentProfileId ? styles.profileButtonActive : {}) }}
                      disabled={testing}
                    >
                      <span style={styles.profileName}>{profile.name}</span>
                      <span style={styles.profileDate}>{new Date(profile.lastLoginAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <label style={styles.label}>你的姓名</label>
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="例如：陈一鸣" maxLength={16} style={styles.input} disabled={testing} data-testid="guest-name-input" />
            <div style={styles.autoHint}>商业版默认可离线游玩。AI 对话会在设置中配置代理后自动增强，未配置时使用静态剧情兜底。</div>
            {error && <div style={styles.errorBox}>{error}</div>}
            <button type="submit" style={styles.button} disabled={testing} data-testid="guest-start-button">{testing ? '验证中...' : '开始游戏'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

function formatSetupError(err: unknown): string {
  const msg = err instanceof Error ? err.message : '未知错误'
  return `启动失败: ${msg}`
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    background: 'url(/backgrounds/campus_gate.png) center/cover',
    padding: '20px'
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(11,11,24,0.3) 0%, rgba(11,11,24,0.8) 60%, rgba(11,11,24,0.95) 100%)',
    zIndex: 0,
    pointerEvents: 'none' as const
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '520px',
    background: 'rgba(20, 20, 35, 0.65)',
    borderRadius: '24px',
    border: '1px solid var(--color-border)',
    padding: '34px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)'
  },
  logoArea: { textAlign: 'center', marginBottom: '22px' },
  logoIcon: {
    width: '58px',
    height: '58px',
    margin: '0 auto 14px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #14b8a6, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 900,
    fontSize: '22px'
  },
  title: { fontSize: '28px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#9898b0' },
  dbOnline: {
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(45,212,191,0.1)',
    border: '1px solid rgba(45,212,191,0.22)',
    color: '#99f6e4',
    fontSize: '12px',
    marginBottom: '14px'
  },
  dbOffline: {
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(251,191,36,0.1)',
    border: '1px solid rgba(251,191,36,0.22)',
    color: '#fde68a',
    fontSize: '12px',
    marginBottom: '14px'
  },
  tabRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '18px'
  },
  tabButton: {
    padding: '11px',
    borderRadius: '8px',
    background: 'rgba(15,23,42,0.72)',
    color: '#cbd5e1',
    fontWeight: 800,
    border: '1px solid rgba(148,163,184,0.16)'
  },
  tabActive: {
    background: 'linear-gradient(135deg, rgba(20,184,166,0.22), rgba(37,99,235,0.16))',
    color: '#f8fafc',
    border: '1px solid rgba(45,212,191,0.34)'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '11px' },
  label: { fontSize: '13px', color: '#c8c8e0', fontWeight: 700 },
  input: {
    width: '100%',
    padding: '13px 15px',
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: '8px',
    color: '#e8e8f0',
    fontSize: '15px'
  },
  autoHint: { color: '#4ade80', fontSize: '12px' },
  linkButton: {
    alignSelf: 'flex-start',
    color: '#93c5fd',
    background: 'transparent',
    fontSize: '13px',
    fontWeight: 700
  },
  errorBox: {
    padding: '10px 12px',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '13px'
  },
  button: {
    marginTop: '6px',
    padding: '14px',
    background: 'linear-gradient(135deg, #14b8a6 0%, #2563eb 100%)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 800
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
    gap: '8px'
  },
  profileButton: {
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(15,23,42,0.72)',
    border: '1px solid rgba(148,163,184,0.16)',
    color: '#e8e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left'
  },
  profileButtonActive: {
    border: '1px solid rgba(45,212,191,0.42)'
  },
  profileName: { fontWeight: 800, fontSize: '13px' },
  profileDate: { color: '#9898b0', fontSize: '11px' }
}
