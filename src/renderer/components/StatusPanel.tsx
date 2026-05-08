import React from 'react'
import type { GameState } from '../../data/types'
import { getKeyAffectionEntries } from '../../engine/npc'

interface StatusPanelProps {
  gameState: GameState
  open: boolean
  onClose: () => void
}

const GPA_COLOR = (gpa: number) => {
  if (gpa >= 3.5) return '#86efac'
  if (gpa >= 2.5) return '#fde68a'
  return '#fca5a5'
}

const MONEY_COLOR = (money: number) => {
  if (money >= 1500) return '#93c5fd'
  if (money >= 500) return '#fde68a'
  return '#fca5a5'
}

const AFFECTION_COLOR = (value: number) => {
  if (value >= 70) return '#fbbf24'
  if (value >= 40) return '#38bdf8'
  return '#94a3b8'
}

export default function StatusPanel({ gameState, open, onClose }: StatusPanelProps) {
  const { playerName, playerStatus, npcAffection, week, day, currentLocation } = gameState
  const affectionEntries = getKeyAffectionEntries(npcAffection, 4)
  const weekday = ['一', '二', '三', '四', '五', '六', '日'][((day - 1) % 7)]

  return (
    <>
      {open && <button type="button" aria-label="关闭状态面板" style={styles.scrim} onClick={onClose} />}
      <aside style={{ ...styles.drawer, transform: open ? 'translateX(0)' : 'translateX(420px)' }}>
        <div style={styles.header}>
          <div>
            <div style={styles.kicker}>Student File</div>
            <h2 style={styles.title}>状态与手册</h2>
          </div>
          <button type="button" onClick={onClose} style={styles.closeButton}>关闭</button>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.profileName}>{playerName || '新生'}</div>
          <div style={styles.profileMeta}>第 {week} 周 · 周{weekday} · {currentLocation}</div>
        </div>

        <div style={styles.sectionTitle}>当前状态</div>
        <div style={styles.statStack}>
          <StatItem label="GPA" value={playerStatus.gpa.toFixed(2)} color={GPA_COLOR(playerStatus.gpa)} progress={playerStatus.gpa / 4} />
          <StatItem label="金钱" value={`¥${playerStatus.money}`} color={MONEY_COLOR(playerStatus.money)} progress={Math.min(1, playerStatus.money / 3000)} />
          <StatItem label="社交" value={`${playerStatus.social}`} color="#93c5fd" progress={playerStatus.social / 100} />
          <StatItem label="声誉" value={`${playerStatus.reputation}`} color="#fbbf24" progress={playerStatus.reputation / 100} />
          <StatItem label="精力" value={`${playerStatus.energy}`} color="#a78bfa" progress={playerStatus.energy / 100} />
          <StatItem label="心情" value={`${playerStatus.mood}`} color="#f9a8d4" progress={playerStatus.mood / 100} />
          <StatItem label="反诈意识" value={`${playerStatus.antiFraudAwareness}`} color="#5eead4" progress={playerStatus.antiFraudAwareness / 100} />
        </div>

        <div style={styles.sectionTitle}>关键关系</div>
        <div style={styles.affectionStack}>
          {affectionEntries.map(({ npc, value }) => (
            <div key={npc.id} style={styles.affectionItem}>
              <div style={styles.affectionTop}>
                <span style={styles.affectionName}>{npc.shortName}</span>
                <span style={{ ...styles.affectionValue, color: AFFECTION_COLOR(value) }}>{value}</span>
              </div>
              <div style={styles.barBg}>
                <div style={{ ...styles.barFill, width: `${Math.max(0, Math.min(100, value))}%`, background: AFFECTION_COLOR(value) }} />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.manualCard}>
          <div style={styles.manualTitle}>新生手册提示</div>
          <p style={styles.manualText}>信任度作为隐藏变量影响风险分支，不直接显示。遇到兼职、转账、隐私收集或高压选择时，优先执行：暂停、截图、核验、求助。</p>
        </div>
      </aside>
    </>
  )
}

function StatItem({ label, value, color, progress }: { label: string; value: string; color: string; progress: number }) {
  return (
    <div style={styles.statItem}>
      <div style={styles.statTop}>
        <span style={styles.statLabel}>{label}</span>
        <span style={{ ...styles.statValue, color }}>{value}</span>
      </div>
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${Math.max(0, Math.min(100, progress * 100))}%`, background: color }} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 35,
    background: 'rgba(2,6,23,0.42)',
    backdropFilter: 'blur(2px)'
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    width: 'min(400px, 92vw)',
    padding: '24px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(8,13,24,0.98))',
    borderLeft: '1px solid rgba(148,163,184,0.18)',
    boxShadow: '-24px 0 52px rgba(0,0,0,0.38)',
    transition: 'transform 220ms ease',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '18px'
  },
  kicker: {
    color: '#5eead4',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '1px',
    marginBottom: '6px'
  },
  title: {
    color: '#f8fafc',
    fontSize: '26px',
    fontWeight: 900
  },
  closeButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(30,41,59,0.92)',
    border: '1px solid rgba(148,163,184,0.16)',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 800
  },
  profileCard: {
    padding: '16px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(20,184,166,0.14), rgba(37,99,235,0.1))',
    border: '1px solid rgba(45,212,191,0.18)',
    marginBottom: '18px'
  },
  profileName: {
    color: '#f8fafc',
    fontSize: '21px',
    fontWeight: 900,
    marginBottom: '6px'
  },
  profileMeta: {
    color: '#94a3b8',
    fontSize: '13px'
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: 900,
    margin: '18px 0 10px'
  },
  statStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  statItem: {
    padding: '12px',
    borderRadius: '9px',
    background: 'rgba(30,41,59,0.62)',
    border: '1px solid rgba(148,163,184,0.12)'
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 800
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 900
  },
  barBg: {
    height: '6px',
    borderRadius: '4px',
    background: 'rgba(148,163,184,0.14)',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 360ms ease'
  },
  affectionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  affectionItem: {
    padding: '12px',
    borderRadius: '9px',
    background: 'rgba(15,23,42,0.62)',
    border: '1px solid rgba(148,163,184,0.12)'
  },
  affectionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
  },
  affectionName: {
    color: '#e5e7eb',
    fontSize: '13px',
    fontWeight: 800
  },
  affectionValue: {
    fontSize: '13px',
    fontWeight: 900
  },
  manualCard: {
    marginTop: '18px',
    padding: '15px',
    borderRadius: '10px',
    background: 'rgba(45,212,191,0.08)',
    border: '1px solid rgba(45,212,191,0.18)'
  },
  manualTitle: {
    color: '#99f6e4',
    fontSize: '13px',
    fontWeight: 900,
    marginBottom: '8px'
  },
  manualText: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.75
  }
}
