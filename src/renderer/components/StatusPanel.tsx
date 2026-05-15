import React from 'react'
import { BookOpen, GraduationCap, HeartPulse, Home, Medal, ShieldAlert, ShieldCheck, Users, Wallet, Zap } from 'lucide-react'
import type { GameState } from '../../data/types'
import { DEFAULT_SCHOOL_CONFIG } from '../../data/school/defaultConfig'
import { getKeyAffectionEntries } from '../../engine/npc'

interface StatusPanelProps {
  gameState: GameState
  open: boolean
  onClose: () => void
}

export default function StatusPanel({ gameState, open, onClose }: StatusPanelProps) {
  const { playerName, playerStatus, npcAffection, week, currentLocation } = gameState
  const affectionEntries = getKeyAffectionEntries(npcAffection, 3)
  const level = playerStatus.gpa >= 3.3 && playerStatus.mood >= 60 ? '良好' : playerStatus.energy < 40 ? '需休整' : '稳定'

  return (
    <>
      {open && <button type="button" aria-label="关闭状态面板" style={styles.scrim} onClick={onClose} />}
      <aside style={{ ...styles.drawer, transform: open ? 'translateX(0)' : 'translateX(110%)' }} data-testid="status-panel">
        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>阶段复盘</div>
            <h2 style={styles.title}>稳步成长的新生</h2>
          </div>
          <div style={styles.levelBadge}><Medal size={19} /> {level}</div>
        </header>

        <section style={styles.profileHero}>
          <div style={styles.avatar}>{(playerName || '新生').slice(0, 1)}</div>
          <div>
            <h3 style={styles.name}>{playerName || '新生'}</h3>
            <p style={styles.meta}>第 {week} 周 · {currentLocation || '校园适应期'}</p>
            <div style={styles.tagRow}>
              <span>宿舍关系</span>
              <span>学习适应</span>
              <span>防骗意识</span>
            </div>
          </div>
        </section>

        <p style={styles.summary}>
          你在本阶段逐渐熟悉校园环境，学习与生活都在走上正轨。继续保持节奏，未来可期。
        </p>

        <section style={styles.statGrid}>
          <StatCard icon={<BookOpen size={31} />} label="GPA" value={playerStatus.gpa.toFixed(2)} suffix="/4.0" progress={playerStatus.gpa / 4} />
          <StatCard icon={<Wallet size={31} />} label="生活费" value={String(playerStatus.money)} suffix="/2000" progress={Math.min(1, playerStatus.money / 2000)} accent="gold" />
          <StatCard icon={<Users size={31} />} label="社交" value={String(playerStatus.social)} suffix="/100" progress={playerStatus.social / 100} />
          <StatCard icon={<Medal size={31} />} label="声誉" value={String(playerStatus.reputation)} suffix="/100" progress={playerStatus.reputation / 100} accent="gold" />
          <StatCard icon={<Zap size={31} />} label="精力" value={String(playerStatus.energy)} suffix="/100" progress={playerStatus.energy / 100} />
          <StatCard icon={<HeartPulse size={31} />} label="心情" value={String(playerStatus.mood)} suffix="/100" progress={playerStatus.mood / 100} accent="warm" />
        </section>

        <SectionTitle>成长报告</SectionTitle>
        <div style={styles.reportGrid}>
          <ReportCard icon={<GraduationCap size={23} />} title="学习表现" text="课堂出勤稳定，作业完成及时，基础知识掌握扎实。" />
          <ReportCard icon={<Home size={23} />} title="生活适应" text="作息规律，能合理安排时间，生活节奏良好。" />
          <ReportCard icon={<Users size={23} />} title="人际关系" text="与室友相处融洽，已结识多位同学，社交圈扩展中。" />
          <ReportCard icon={<ShieldCheck size={23} />} title="风险意识" text="警惕心较强，能识别常见校园骗局，安全意识良好。" />
        </div>

        <SectionTitle>NPC 评价</SectionTitle>
        <div style={styles.npcGrid}>
          {affectionEntries.map(({ npc, value }) => (
            <div key={npc.id} style={styles.npcCard}>
              <div style={styles.npcAvatar}>{npc.avatarInitial}</div>
              <div style={styles.npcBody}>
                <div style={styles.npcTop}><strong>{npc.shortName}</strong><span>♥ {value}</span></div>
                <p>{npc.roleTag} · {value >= 70 ? '信赖' : value >= 45 ? '普通' : '陌生'}</p>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle>踩坑提示</SectionTitle>
        <div style={styles.warningGrid}>
          <WarningCard title="谨防兼职陷阱" text="本阶段出现多起高薪兼职诈骗，切勿轻信校外不明信息。" />
          <WarningCard title="警惕网络借贷" text="校园贷风险高，避免提前消费，保护个人征信。" />
          <WarningCard title="注意个人信息" text="身份证、银行卡等信息不要随意提供给陌生人。" />
        </div>

        <SectionTitle>校园帮助与支持</SectionTitle>
        <div style={styles.supportGrid}>
          {DEFAULT_SCHOOL_CONFIG.contacts.slice(0, 3).map(contact => (
            <div key={contact.id} style={styles.supportCard}>
              <ShieldAlert size={27} color="var(--color-primary)" />
              <strong>{contact.label}</strong>
              <span>{contact.value}</span>
            </div>
          ))}
        </div>

        <button type="button" onClick={onClose} className="primary-cta" style={styles.closeCta}>返回游戏</button>
      </aside>
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={styles.sectionTitle}>{children}<span className="leaf-mark" /></h3>
}

function StatCard({ icon, label, value, suffix, progress, accent = 'green' }: { icon: React.ReactNode; label: string; value: string; suffix: string; progress: number; accent?: 'green' | 'gold' | 'warm' }) {
  const color = accent === 'gold' ? 'var(--color-accent)' : accent === 'warm' ? '#d89974' : 'var(--color-primary)'
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, color }}>{icon}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}<span>{suffix}</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, background: color }} /></div>
    </div>
  )
}

function ReportCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={styles.reportCard}>
      <div style={styles.reportTitle}>{icon}{title}</div>
      <p>{text}</p>
      <span style={styles.statusPill}>稳步提升</span>
    </div>
  )
}

function WarningCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.warningCard}>
      <ShieldAlert size={25} color="var(--color-warning)" />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 35,
    background: 'rgba(3,7,6,0.58)',
    backdropFilter: 'blur(3px)'
  },
  drawer: {
    position: 'fixed',
    top: 18,
    right: 18,
    bottom: 18,
    zIndex: 40,
    width: 'min(760px, calc(100vw - 36px))',
    padding: 24,
    overflowY: 'auto',
    borderRadius: 20,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035)), rgba(20,25,22,0.9)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.54)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    transition: 'transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18
  },
  kicker: {
    color: 'var(--color-primary)',
    fontSize: 14,
    fontWeight: 900,
    marginBottom: 4
  },
  title: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    fontSize: 42,
    lineHeight: 1.08
  },
  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 13px',
    borderRadius: 10,
    color: 'var(--color-accent)',
    border: '1px solid rgba(229,190,101,0.35)',
    background: 'rgba(229,190,101,0.1)',
    fontWeight: 900
  },
  profileHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    padding: 18,
    borderRadius: 14,
    background: 'url(/backgrounds/campus_gate.png) center/cover',
    boxShadow: 'inset 0 0 0 999px rgba(3,7,6,0.56)',
    border: '1px solid var(--color-border)',
    marginBottom: 16
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: '#fff',
    fontSize: 34,
    fontWeight: 900,
    background: 'linear-gradient(135deg, rgba(159,202,120,0.9), rgba(229,190,101,0.72))'
  },
  name: {
    color: 'var(--color-text)',
    fontSize: 24,
    fontWeight: 900
  },
  meta: {
    color: 'var(--color-text-dim)',
    marginTop: 4
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  summary: {
    maxWidth: 560,
    padding: 16,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-dim)',
    lineHeight: 1.75,
    marginBottom: 16
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12
  },
  statCard: {
    minHeight: 154,
    padding: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.055)'
  },
  statIcon: {
    marginBottom: 12
  },
  statLabel: {
    color: 'var(--color-text-dim)',
    fontWeight: 900,
    marginBottom: 12
  },
  statValue: {
    color: 'var(--color-text)',
    fontSize: 26,
    fontWeight: 900,
    marginBottom: 12
  },
  sectionTitle: {
    color: 'var(--color-text-dim)',
    fontSize: 18,
    fontWeight: 900,
    margin: '22px 0 12px'
  },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12
  },
  reportCard: {
    padding: 15,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text-dim)',
    lineHeight: 1.65
  },
  reportTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--color-text)',
    fontWeight: 900,
    marginBottom: 8
  },
  statusPill: {
    display: 'inline-block',
    marginTop: 10,
    padding: '4px 10px',
    borderRadius: 8,
    color: 'var(--color-primary)',
    background: 'rgba(159,202,120,0.12)',
    fontSize: 12,
    fontWeight: 900
  },
  npcGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12
  },
  npcCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.055)'
  },
  npcAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    fontSize: 21,
    fontWeight: 900,
    background: 'linear-gradient(135deg, rgba(229,190,101,0.8), rgba(159,202,120,0.7))'
  },
  npcBody: {
    flex: 1,
    minWidth: 0
  },
  npcTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    color: 'var(--color-text)',
    marginBottom: 4
  },
  warningGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12
  },
  warningCard: {
    padding: 15,
    borderRadius: 12,
    border: '1px solid rgba(229,190,101,0.3)',
    background: 'rgba(229,190,101,0.08)',
    color: 'var(--color-text-dim)',
    lineHeight: 1.6
  },
  supportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12
  },
  supportCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 15,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text-dim)'
  },
  closeCta: {
    width: '100%',
    marginTop: 22
  }
}
