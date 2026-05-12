import React from 'react'
import type { GameState } from '../../data/types'
import { createEndingReport, getEndingLevelColor } from '../../engine/ending'

interface GameOverScreenProps {
  gameState: GameState
  onRetry: () => void
}

export default function GameOverScreen({ gameState, onRetry }: GameOverScreenProps) {
  const report = createEndingReport(gameState)
  const color = getEndingLevelColor(report.level)
  const compact = typeof window !== 'undefined' && window.innerWidth < 760

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <div style={styles.card}>
        <div style={{ ...styles.levelBadge, background: `${color}20`, border: `1px solid ${color}40`, color }}>
          {report.typeLabel}
        </div>

        <h1 style={styles.title}>{report.title}</h1>
        <p style={styles.description}>{report.description}</p>

        <div style={styles.tagRow}>
          {report.routeTags.map(tag => <span key={tag} style={styles.routeTag}>{tag}</span>)}
        </div>

        <div style={styles.statusFlag}>
          <span style={styles.flagLabel}>是否被骗</span>
          <span style={{ ...styles.flagValue, color: report.scammed ? '#f87171' : '#4ade80' }}>
            {report.scammed ? '是' : '否'}
          </span>
        </div>

        <div style={{ ...styles.statsGrid, ...(compact ? styles.statsGridCompact : {}) }}>
          <Stat label="GPA" value={gameState.playerStatus.gpa.toFixed(2)} color={color} />
          <Stat label="金钱" value={`¥${gameState.playerStatus.money}`} color={color} />
          <Stat label="社交" value={`${gameState.playerStatus.social}`} color={color} />
          <Stat label="心情" value={`${gameState.playerStatus.mood}`} color={color} />
          <Stat label="反诈意识" value={`${gameState.playerStatus.antiFraudAwareness}`} color={color} />
        </div>

        <InfoBox title="成长报告" text={report.growthSummary} tone="purple" />
        <InfoBox title="关键 NPC 评价" text={report.npcReview} tone="purple" />
        <InfoBox title="本局踩坑提示" text={report.pitfallTip} tone="teal" />

        <div style={{ ...styles.grid, ...(compact ? styles.gridCompact : {}) }}>
          <ListBox title="新生手册建议" items={report.handbookAdvice} />
          <ListBox title="下一步建议" items={report.nextActions} />
        </div>

        <div style={styles.contactBox}>
          <div style={styles.boxTitle}>学校求助入口</div>
          {report.schoolContacts.map(contact => (
            <div key={contact.id} style={styles.contactItem}>
              <span>{contact.label}</span>
              <strong>{contact.value}</strong>
            </div>
          ))}
        </div>

        <div style={styles.actions}>
          <button onClick={onRetry} style={styles.retryButton}>返回首页</button>
        </div>

        <p style={styles.footnote}>AI 校园生存模拟器 v2.0 - 新生入学教育原型</p>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
    </div>
  )
}

function InfoBox({ title, text, tone }: { title: string; text: string; tone: 'purple' | 'teal' }) {
  return (
    <div style={tone === 'purple' ? styles.reviewBox : styles.tipBox}>
      <div style={tone === 'purple' ? styles.reviewTitle : styles.tipTitle}>{title}</div>
      <p style={styles.infoText}>{text}</p>
    </div>
  )
}

function ListBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={styles.listBox}>
      <div style={styles.boxTitle}>{title}</div>
      {items.map(item => <div key={item} style={styles.listItem}>{item}</div>)}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    background: 'url(/backgrounds/dorm.png) center/cover',
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
    maxWidth: '820px',
    maxHeight: '94vh',
    overflowY: 'auto',
    background: 'rgba(20, 20, 35, 0.65)',
    borderRadius: '24px',
    border: '1px solid var(--color-border)',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)'
  },
  levelBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '14px',
    letterSpacing: '1px'
  },
  title: {
    fontSize: '34px',
    fontWeight: 900,
    color: '#f8fafc',
    marginBottom: '10px'
  },
  description: {
    fontSize: '15px',
    color: '#cbd5e1',
    lineHeight: 1.8,
    marginBottom: '14px'
  },
  tagRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px'
  },
  routeTag: {
    padding: '5px 9px',
    borderRadius: '8px',
    background: 'rgba(45,212,191,0.12)',
    color: '#99f6e4',
    fontSize: '12px',
    fontWeight: 800
  },
  statusFlag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    borderRadius: '10px',
    background: 'rgba(37,37,64,0.7)',
    border: '1px solid #2a2a4c',
    marginBottom: '16px'
  },
  flagLabel: { color: '#9898b0', fontSize: '13px' },
  flagValue: { fontSize: '15px', fontWeight: 800 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
    marginBottom: '16px'
  },
  statsGridCompact: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
  },
  statBox: {
    background: 'rgba(30,41,59,0.66)',
    borderRadius: '10px',
    padding: '12px 8px',
    border: '1px solid rgba(148,163,184,0.14)'
  },
  statLabel: { fontSize: '11px', color: '#9898b0', marginBottom: '6px' },
  statValue: { fontSize: '18px', fontWeight: 800 },
  reviewBox: {
    textAlign: 'left',
    padding: '13px 15px',
    background: 'rgba(96,165,250,0.08)',
    border: '1px solid rgba(96,165,250,0.18)',
    borderRadius: '10px',
    marginBottom: '10px'
  },
  tipBox: {
    textAlign: 'left',
    padding: '13px 15px',
    background: 'rgba(45,212,191,0.08)',
    border: '1px solid rgba(45,212,191,0.18)',
    borderRadius: '10px',
    marginBottom: '14px'
  },
  reviewTitle: { color: '#93c5fd', fontSize: '13px', fontWeight: 800, marginBottom: '6px' },
  tipTitle: { color: '#2dd4bf', fontSize: '13px', fontWeight: 800, marginBottom: '6px' },
  infoText: { color: '#d8d8ef', fontSize: '14px', lineHeight: 1.7 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  },
  gridCompact: {
    gridTemplateColumns: '1fr'
  },
  listBox: {
    textAlign: 'left',
    background: 'rgba(30,41,59,0.58)',
    border: '1px solid rgba(148,163,184,0.14)',
    borderRadius: '10px',
    padding: '13px 15px'
  },
  boxTitle: { color: '#e8e8f0', fontSize: '13px', fontWeight: 800, marginBottom: '8px' },
  listItem: {
    color: '#c8c8e0',
    fontSize: '12px',
    lineHeight: 1.55,
    padding: '4px 0',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  contactBox: {
    textAlign: 'left',
    background: 'rgba(15,23,42,0.48)',
    border: '1px solid rgba(148,163,184,0.14)',
    borderRadius: '10px',
    padding: '13px 15px',
    marginBottom: '16px'
  },
  contactItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    color: '#94a3b8',
    fontSize: '12px',
    padding: '5px 0',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  actions: { display: 'flex', justifyContent: 'center', marginBottom: '10px' },
  retryButton: {
    padding: '12px 34px',
    background: 'linear-gradient(135deg, #14b8a6 0%, #2563eb 100%)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 800
  },
  footnote: { fontSize: '12px', color: '#5a5a7a' }
}
