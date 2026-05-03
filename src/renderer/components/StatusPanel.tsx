import React from 'react'
import type { GameState } from '../../data/types'

interface StatusPanelProps {
  gameState: GameState
}

const GPA_COLOR = (gpa: number) => {
  if (gpa >= 3.5) return '#4ade80'
  if (gpa >= 2.5) return '#fbbf24'
  return '#f87171'
}

const MONEY_COLOR = (money: number) => {
  if (money >= 1500) return '#60a5fa'
  if (money >= 500) return '#fbbf24'
  return '#f87171'
}

const AFFECTION_COLOR = (val: number) => {
  if (val >= 70) return '#f7a26a'
  if (val >= 40) return '#fbbf24'
  return '#9898b0'
}

export default function StatusPanel({ gameState }: StatusPanelProps) {
  const { playerName, playerStatus, npcAffection, week, day } = gameState

  return (
    <div style={styles.container}>
      <div style={styles.timeInfo}>
        <div style={styles.playerBadge}>
          {playerName}
        </div>
        <div style={styles.weekBadge}>
          第 {week} 周
        </div>
        <div style={styles.dayBadge}>
          周{['一', '二', '三', '四', '五', '六', '日'][((day - 1) % 7)]}
        </div>
      </div>

      <div style={styles.statsRow}>
        <StatItem
          icon="📊"
          label="GPA"
          value={playerStatus.gpa.toFixed(2)}
          color={GPA_COLOR(playerStatus.gpa)}
          barWidth={playerStatus.gpa / 4}
        />
        <StatItem
          icon="💰"
          label="金钱"
          value={`¥${playerStatus.money}`}
          color={MONEY_COLOR(playerStatus.money)}
          barWidth={Math.min(1, playerStatus.money / 3000)}
        />
        <StatItem
          icon="🤝"
          label="社交"
          value={`${playerStatus.social}`}
          color="#60a5fa"
          barWidth={playerStatus.social / 100}
        />
        <StatItem
          icon="⭐"
          label="声誉"
          value={`${playerStatus.reputation}`}
          color="#fbbf24"
          barWidth={playerStatus.reputation / 100}
        />
        <StatItem
          icon="⚡"
          label="精力"
          value={`${playerStatus.energy}`}
          color="#a78bfa"
          barWidth={playerStatus.energy / 100}
        />
      </div>

      <div style={styles.affectionSection}>
        <span style={styles.affectionLabel}>学姐好感</span>
        <div style={styles.affectionBar}>
          <div
            style={{
              ...styles.affectionFill,
              width: `${npcAffection.xuejie ?? 50}%`,
              background: `linear-gradient(90deg, #e8825a, ${AFFECTION_COLOR(npcAffection.xuejie ?? 50)})`
            }}
          />
        </div>
        <span style={{
          ...styles.affectionValue,
          color: AFFECTION_COLOR(npcAffection.xuejie ?? 50)
        }}>
          {npcAffection.xuejie ?? 50}
        </span>
      </div>
    </div>
  )
}

interface StatItemProps {
  icon: string
  label: string
  value: string
  color: string
  barWidth: number
}

function StatItem({ icon, label, value, color, barWidth }: StatItemProps) {
  return (
    <div style={styles.statItem}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statContent}>
        <div style={styles.statHeader}>
          <span style={styles.statLabel}>{label}</span>
          <span style={{ ...styles.statValue, color }}>{value}</span>
        </div>
        <div style={styles.barBg}>
          <div
            style={{
              ...styles.barFill,
              width: `${Math.max(0, Math.min(100, barWidth * 100))}%`,
              background: color
            }}
          />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '10px 24px',
    background: 'rgba(26,26,46,0.9)',
    borderBottom: '1px solid #2a2a4c',
    backdropFilter: 'blur(8px)'
  },
  timeInfo: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexShrink: 0
  },
  playerBadge: {
    padding: '4px 10px',
    background: 'rgba(96,165,250,0.16)',
    borderRadius: '6px',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: 600,
    maxWidth: '120px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  weekBadge: {
    padding: '4px 10px',
    background: 'rgba(124,106,247,0.15)',
    borderRadius: '6px',
    color: '#7c6af7',
    fontSize: '13px',
    fontWeight: 600
  },
  dayBadge: {
    padding: '4px 10px',
    background: 'rgba(247,162,106,0.15)',
    borderRadius: '6px',
    color: '#f7a26a',
    fontSize: '13px',
    fontWeight: 600
  },
  statsRow: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    alignItems: 'center'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '120px'
  },
  statIcon: {
    fontSize: '18px',
    flexShrink: 0
  },
  statContent: {
    flex: 1,
    minWidth: 0
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '11px',
    color: '#9898b0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '13px',
    fontWeight: 700
  },
  barBg: {
    height: '4px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease'
  },
  affectionSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
    padding: '6px 14px',
    background: 'rgba(247,162,106,0.08)',
    borderRadius: '10px',
    border: '1px solid rgba(247,162,106,0.15)'
  },
  affectionLabel: {
    fontSize: '13px',
    color: '#f7a26a',
    fontWeight: 500
  },
  affectionBar: {
    width: '80px',
    height: '6px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  affectionFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease'
  },
  affectionValue: {
    fontSize: '14px',
    fontWeight: 700
  }
}
