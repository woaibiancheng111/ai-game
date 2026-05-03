import React from 'react'
import type { GameState } from '../../data/types'

interface GameOverScreenProps {
  gameState: GameState
  onRetry: () => void
}

const getEnding = (state: GameState): { title: string; description: string; level: 'good' | 'normal' | 'bad' } => {
  const { playerStatus, npcAffection } = state
  const avgAffection = Object.values(npcAffection).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(npcAffection).length)
  const overall = (playerStatus.gpa / 4) * 40 + (playerStatus.reputation / 100) * 30 + (avgAffection / 100) * 30

  if (overall >= 80) {
    return {
      title: '校园风云人物',
      description: '你在学业、社交和感情方面都取得了巨大成功。学姐对你的评价非常高，同学们也对你刮目相看。你已经成为校园里的风云人物！',
      level: 'good'
    }
  } else if (overall >= 50) {
    return {
      title: '平淡是真',
      description: '你的大学生活波澜不惊，但也收获了不少。学姐觉得你是个不错的学弟，偶尔会主动和你打招呼。继续保持吧！',
      level: 'normal'
    }
  } else {
    return {
      title: '危机四伏',
      description: '你的校园生活遇到了不少麻烦。学业下滑、社交受挫，学姐也对你有些失望。是时候反思一下，做出改变了。',
      level: 'bad'
    }
  }
}

const LEVEL_COLORS = {
  good: { primary: '#4ade80', secondary: '#166534', text: '#dcfce7' },
  normal: { primary: '#fbbf24', secondary: '#92400e', text: '#fef9c3' },
  bad: { primary: '#f87171', secondary: '#991b1b', text: '#fee2e2' }
}

export default function GameOverScreen({ gameState, onRetry }: GameOverScreenProps) {
  const ending = getEnding(gameState)
  const colors = LEVEL_COLORS[ending.level]

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.levelBadge, background: `${colors.primary}20`, border: `1px solid ${colors.primary}40` }}>
          <span style={{ color: colors.primary }}>第一幕 完</span>
        </div>

        <h1 style={styles.title}>{ending.title}</h1>
        <p style={styles.description}>{ending.description}</p>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>GPA</div>
            <div style={{...styles.statValue, color: colors.primary}}>
              {gameState.playerStatus.gpa.toFixed(2)}
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>金钱</div>
            <div style={{...styles.statValue, color: colors.primary}}>
              ¥{gameState.playerStatus.money}
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>社交</div>
            <div style={{...styles.statValue, color: colors.primary}}>
              {gameState.playerStatus.social}
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>声誉</div>
            <div style={{...styles.statValue, color: colors.primary}}>
              {gameState.playerStatus.reputation}
            </div>
          </div>
        </div>

        <div style={styles.affectionBox}>
          <span style={styles.affectionLabel}>学姐好感度</span>
          <div style={styles.affectionBar}>
            <div
              style={{
                ...styles.affectionFill,
                width: `${gameState.npcAffection.xuejie ?? 50}%`,
                background: colors.primary
              }}
            />
          </div>
          <span style={{ color: colors.primary, fontWeight: 700 }}>
            {gameState.npcAffection.xuejie ?? 50}
          </span>
        </div>

        <button
          onClick={onRetry}
          style={styles.retryButton}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,106,247,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,106,247,0.2)'
          }}
        >
          重新开始
        </button>

        <p style={styles.footnote}>
          AI 校园生存模拟器 v1.0 — 第一幕迎新周已完结
        </p>
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
    maxWidth: '560px',
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 100%)',
    borderRadius: '20px',
    border: '1px solid #2a2a4c',
    padding: '40px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },
  levelBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '20px',
    letterSpacing: '1px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#e8e8f0',
    marginBottom: '16px',
    letterSpacing: '2px'
  },
  description: {
    fontSize: '15px',
    color: '#9898b0',
    lineHeight: 1.8,
    marginBottom: '32px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  },
  statBox: {
    background: 'rgba(37,37,64,0.6)',
    borderRadius: '10px',
    padding: '12px 8px',
    border: '1px solid #2a2a4c'
  },
  statLabel: {
    fontSize: '11px',
    color: '#9898b0',
    marginBottom: '6px',
    textTransform: 'uppercase' as const
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 700
  },
  affectionBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '12px 20px',
    background: 'rgba(37,37,64,0.4)',
    borderRadius: '10px',
    border: '1px solid #2a2a4c'
  },
  affectionLabel: {
    fontSize: '14px',
    color: '#f7a26a',
    fontWeight: 500
  },
  affectionBar: {
    flex: 1,
    maxWidth: '200px',
    height: '8px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  affectionFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  retryButton: {
    padding: '14px 40px',
    background: 'linear-gradient(135deg, #7c6af7 0%, #5a4bbf 100%)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(124,106,247,0.2)',
    transition: 'all 0.2s ease',
    marginBottom: '16px'
  },
  footnote: {
    fontSize: '12px',
    color: '#5a5a7a'
  }
}
