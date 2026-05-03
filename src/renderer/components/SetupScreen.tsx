import React, { useEffect, useState } from 'react'

interface SetupScreenProps {
  onSubmit: (apiKey: string, playerName: string) => void
  initialApiKey?: string
  initialPlayerName?: string
}

export default function SetupScreen({ onSubmit, initialApiKey = '', initialPlayerName = '' }: SetupScreenProps) {
  const [playerName, setPlayerName] = useState(initialPlayerName)
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [apiKeyDetected, setApiKeyDetected] = useState(Boolean(initialApiKey.trim()))
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (initialApiKey.trim()) {
      setApiKey(initialApiKey)
      setApiKeyDetected(true)
    }
  }, [initialApiKey])

  useEffect(() => {
    if (initialPlayerName.trim()) {
      setPlayerName(initialPlayerName)
    }
  }, [initialPlayerName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim()) {
      setError('请输入你的姓名')
      return
    }

    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }

    setTesting(true)
    setError('')

    try {
      await window.electronAPI.config.setApiKey(apiKey.trim())
      const testResult = await window.electronAPI.llm.chat({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'qwen-plus',
        temperature: 0.1
      })

      if (testResult) {
        onSubmit(apiKey.trim(), playerName.trim())
      } else {
        setError('API Key 验证失败，请检查 Key 是否正确')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      if (msg.includes('API Key 未配置')) {
        setError('API Key 不能为空')
      } else if (msg.includes('401') || msg.includes('403')) {
        setError('API Key 无效或已过期')
      } else {
        setError(`验证失败: ${msg}`)
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#7c6af7" strokeWidth="3" />
              <path d="M20 32 L28 40 L44 24" stroke="#7c6af7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="32" cy="20" r="4" fill="#f7a26a" />
              <path d="M22 44 L32 36 L42 44" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={styles.title}>AI 校园生存模拟器</h1>
          <p style={styles.subtitle}>Campus Survival Simulator</p>
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            这是一款基于 AI 大模型的校园生存模拟游戏。你的每一个选择都将影响你在校园中的命运。
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            你的姓名
          </label>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="例如：陈一鸣"
              maxLength={16}
              style={styles.input}
              disabled={testing}
            />
          </div>

          <label style={styles.label}>
            百连/通义千问 API Key
          </label>
          <div style={styles.inputWrapper}>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              style={styles.input}
              disabled={testing}
            />
          </div>

          {apiKeyDetected && (
            <div style={styles.autoHint}>
              已自动读取 API Key，可直接开始游戏。
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#f87171">
                <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 12.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM7 5h2v4H7V5z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: testing ? 0.7 : 1,
              cursor: testing ? 'wait' : 'pointer'
            }}
            disabled={testing}
          >
            {testing ? '验证中...' : '开始游戏'}
          </button>
        </form>

        <div style={styles.hint}>
          <a
            href="https://dashscope.console.aliyun.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            获取 API Key
          </a>
          <span style={styles.hintText}>（免费注册，每月有免费额度）</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 70%)',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 100%)',
    borderRadius: '20px',
    border: '1px solid #2a2a4c',
    padding: '48px 40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,106,247,0.1)'
  },
  logoArea: {
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  logoIcon: {
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#e8e8f0',
    marginBottom: '8px',
    letterSpacing: '2px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#7c6af7',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const
  },
  infoBox: {
    background: 'rgba(124,106,247,0.08)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '28px',
    border: '1px solid rgba(124,106,247,0.15)'
  },
  infoText: {
    fontSize: '14px',
    color: '#9898b0',
    lineHeight: 1.7,
    textAlign: 'center' as const
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  label: {
    fontSize: '14px',
    color: '#e8e8f0',
    fontWeight: 500,
    marginBottom: '4px'
  },
  inputWrapper: {
    position: 'relative' as const
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: '#0f0f1a',
    border: '1px solid #3a3a5c',
    borderRadius: '10px',
    color: '#e8e8f0',
    fontSize: '15px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'var(--font-mono)'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(248,113,113,0.1)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '13px',
    border: '1px solid rgba(248,113,113,0.2)'
  },
  autoHint: {
    fontSize: '12px',
    color: '#93c5fd',
    background: 'rgba(96,165,250,0.1)',
    border: '1px solid rgba(96,165,250,0.2)',
    borderRadius: '8px',
    padding: '8px 10px'
  },
  button: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #7c6af7 0%, #5a4bbf 100%)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '8px',
    letterSpacing: '1px',
    boxShadow: '0 4px 16px rgba(124,106,247,0.3)'
  },
  hint: {
    marginTop: '20px',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#9898b0'
  },
  link: {
    color: '#7c6af7',
    textDecoration: 'none'
  },
  hintText: {
    marginLeft: '4px'
  }
}
