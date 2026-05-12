import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b0b18 0%, #1a1040 100%)',
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif", color: '#e8e8f0'
        }}>
          <div style={{
            maxWidth: 420, padding: '40px 36px', borderRadius: 16, textAlign: 'center',
            background: 'rgba(20, 20, 35, 0.85)', border: '1px solid rgba(124, 106, 247, 0.3)',
            backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, marginBottom: 12, color: '#fbbf24' }}>遇到了一点问题</h2>
            <p style={{ fontSize: 14, color: '#9898b0', lineHeight: 1.6, marginBottom: 24 }}>
              游戏加载时出现异常，你的存档不会丢失。<br />
              点击下方按钮重新加载。
            </p>
            {this.state.error && (
              <details style={{ marginBottom: 20, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, color: '#7c6af7' }}>技术详情</summary>
                <pre style={{
                  marginTop: 8, padding: 12, borderRadius: 8, fontSize: 11, color: '#ff003c',
                  background: 'rgba(255,0,60,0.08)', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  maxHeight: 120, overflow: 'auto'
                }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button onClick={this.handleReload} style={{
              padding: '12px 32px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c6af7, #5a4bbf)', color: '#fff',
              fontSize: 15, fontWeight: 600, transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(124,106,247,0.4)'
            }}
            onMouseOver={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)' }}
            onMouseOut={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
