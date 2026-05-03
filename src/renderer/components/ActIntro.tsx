import React, { useState } from 'react'

interface ActIntroProps {
  actNumber: number
  onContinue: () => void
}

const ACT_TITLES: Record<number, { cn: string; en: string; bg: string }> = {
  1: {
    cn: '迎新周',
    en: 'Freshman Orientation Week',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #1a1a2e 100%)'
  }
}

export default function ActIntro({ actNumber, onContinue }: ActIntroProps) {
  const [visible, setVisible] = useState(false)
  const actInfo = ACT_TITLES[actNumber] || ACT_TITLES[1]

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        ...styles.container,
        background: actInfo.bg,
        opacity: visible ? 1 : 0
      }}
    >
      <div style={styles.content}>
        <div style={styles.actLabel}>ACT {actNumber}</div>
        <h1 style={styles.title}>{actInfo.cn}</h1>
        <p style={styles.subtitle}>{actInfo.en}</p>

        <div style={styles.divider} />

        <p style={styles.description}>
          {actNumber === 1 && '你踏入了大学的校门。陌生的校园、新的面孔、无数的选择摆在眼前。这是你的起点，也是决定你四年命运的关键一周。'}
        </p>

        <div style={styles.hint}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="#7c6af7">
            <path d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5A4.5 4.5 0 1 1 7 2.5 4.5 4.5 0 0 1 7 11.5zM7 5h.5v3H7V5zm0 4h.5v1.5H7V9z"/>
          </svg>
          <span>每一个选择都会影响你的 GPA、社交和命运</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        style={styles.startButton}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,106,247,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,106,247,0.3)'
        }}
      >
        开始旅程
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff" style={{ marginLeft: 8 }}>
          <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    padding: '40px',
    transition: 'opacity 1s ease'
  },
  content: {
    textAlign: 'center' as const,
    maxWidth: '600px',
    animation: 'fadeIn 0.8s ease-out'
  },
  actLabel: {
    fontSize: '14px',
    color: '#7c6af7',
    letterSpacing: '6px',
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
    fontWeight: 600
  },
  title: {
    fontSize: '64px',
    fontWeight: 800,
    color: '#e8e8f0',
    marginBottom: '8px',
    letterSpacing: '4px',
    textShadow: '0 0 40px rgba(124,106,247,0.3)'
  },
  subtitle: {
    fontSize: '16px',
    color: '#9898b0',
    letterSpacing: '3px'
  },
  divider: {
    width: '60px',
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #7c6af7, transparent)',
    margin: '32px auto'
  },
  description: {
    fontSize: '16px',
    color: '#c8c8e0',
    lineHeight: 1.9,
    marginBottom: '24px'
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#7c6af7'
  },
  startButton: {
    marginTop: '48px',
    display: 'flex',
    alignItems: 'center',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #7c6af7 0%, #5a4bbf 100%)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: 600,
    boxShadow: '0 4px 20px rgba(124,106,247,0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '1px'
  }
}
