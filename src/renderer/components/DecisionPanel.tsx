import React, { useEffect, useState } from 'react'
import { Eye, MessageSquare, UserRound } from 'lucide-react'
import type { PlayerChoice } from '../../data/types'

interface DecisionPanelProps {
  choices: PlayerChoice[]
  onSelect: (choice: PlayerChoice) => void
  disabled?: boolean
  emptyText?: string
}

export default function DecisionPanel({ choices, onSelect, disabled }: DecisionPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null)

  useEffect(() => {
    if (disabled || choices.length === 0) return
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      const num = Number(event.key)
      if (Number.isFinite(num) && num >= 1 && num <= choices.length) {
        event.preventDefault()
        setKeyboardIndex(num - 1)
        window.setTimeout(() => {
          onSelect(choices[num - 1])
          setKeyboardIndex(null)
        }, 80)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [choices, disabled, onSelect])

  if (!choices || choices.length === 0) return null

  return (
    <div className="glass-panel" style={styles.container} data-testid="decision-panel">
      <div style={styles.choiceList}>
        {choices.map((choice, index) => {
          const active = hoveredIndex === index || keyboardIndex === index
          const Icon = index === 0 ? MessageSquare : index === 1 ? Eye : UserRound
          return (
            <button
              key={choice.id}
              onClick={() => onSelect(choice)}
              disabled={disabled}
              data-testid={`choice-${choice.id}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                ...styles.choiceCard,
                ...(active && !disabled ? styles.choiceCardActive : {}),
                ...(disabled ? styles.choiceCardDisabled : {})
              }}
            >
              <div style={styles.choiceNumber}>{String(index + 1).padStart(2, '0')}</div>
              <Icon size={22} style={styles.choiceIcon} />
              <div style={styles.choiceText}>{choice.text}</div>
            </button>
          )
        })}
      </div>
      <div style={styles.hint}>按数字键 1-{choices.length} 快速选择</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 'min(980px, 100%)',
    alignSelf: 'center',
    borderRadius: '12px',
    padding: '14px 16px 10px',
    animation: 'slideInUp var(--transition-normal) both'
  },
  choiceList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '14px'
  },
  choiceCard: {
    minHeight: '118px',
    display: 'grid',
    gridTemplateColumns: '44px 32px 1fr',
    alignItems: 'center',
    gap: '12px',
    padding: '18px',
    borderRadius: '10px',
    textAlign: 'left',
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    boxShadow: '0 14px 32px rgba(0,0,0,0.22)'
  },
  choiceCardActive: {
    borderColor: 'var(--color-border-strong)',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.18), rgba(255,255,255,0.06))',
    boxShadow: 'var(--shadow-glow)'
  },
  choiceCardDisabled: {
    opacity: 0.48
  },
  choiceNumber: {
    color: 'var(--color-primary)',
    fontSize: '24px',
    fontWeight: 900,
    fontFamily: 'var(--font-mono)'
  },
  choiceIcon: {
    color: 'var(--color-primary)'
  },
  choiceText: {
    color: 'var(--color-text)',
    fontSize: '17px',
    fontWeight: 800,
    lineHeight: 1.45,
    overflowWrap: 'anywhere'
  },
  hint: {
    marginTop: '10px',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: '12px'
  }
}
