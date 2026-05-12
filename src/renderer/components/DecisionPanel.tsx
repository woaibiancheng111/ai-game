import React, { useState } from 'react'
import type { PlayerChoice } from '../../data/types'

interface DecisionPanelProps {
  choices: PlayerChoice[]
  onSelect: (choice: PlayerChoice) => void
  disabled?: boolean
  emptyText?: string
}

export default function DecisionPanel({ choices, onSelect, disabled, emptyText = '等待下一步...' }: DecisionPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!choices || choices.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyHint}>
          <span style={styles.emptyDot} />
          {emptyText}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#2dd4bf">
          <path d="M8 1.5L9.5 5.5H14L10.5 8L12 12L8 9.5L4 12L5.5 8L2 5.5H6.5L8 1.5Z"/>
        </svg>
        <span style={styles.headerText}>做出你的选择</span>
      </div>
      <div style={styles.choicesGrid}>
        {choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => onSelect(choice)}
            disabled={disabled}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              ...styles.choiceButton,
              ...(hoveredIndex === index && !disabled ? styles.choiceButtonHover : {}),
              ...(disabled ? styles.choiceButtonDisabled : {})
            }}
          >
            <span style={styles.choiceNumber}>
              {String.fromCharCode(65 + index)}
            </span>
            <span style={styles.choiceText}>{choice.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  emptyContainer: {
    minHeight: '74px',
    display: 'none', // Hide empty container to keep screen clean when no choices
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(8,13,24,0.5)',
    border: '1px solid rgba(148,163,184,0.1)',
    backdropFilter: 'blur(10px)'
  },
  emptyHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9898b0',
    fontSize: '14px',
    justifyContent: 'center'
  },
  emptyDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--color-primary)',
    animation: 'pulseGlow 1.5s ease-in-out infinite'
  },
  container: {
    background: 'rgba(20,20,35,0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px',
    border: '1px solid var(--color-border)',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'slideInUp 0.4s ease-out'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    color: 'var(--color-accent)',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    fontWeight: 700,
    textShadow: '0 0 8px var(--color-accent-glow)'
  },
  headerText: {
    letterSpacing: '1px'
  },
  choicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '10px'
  },
  choiceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minHeight: '58px',
    padding: '16px 20px',
    background: 'rgba(35,35,60,0.5)',
    border: '1px solid rgba(124,106,247,0.3)',
    borderRadius: '16px',
    color: 'var(--color-text)',
    textAlign: 'left' as const,
    fontSize: '15px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  choiceButtonHover: {
    background: 'rgba(124,106,247,0.2)',
    border: '1px solid var(--color-primary)',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: 'var(--shadow-glow)',
    color: '#fff'
  },
  choiceButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  },
  choiceNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dim) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(124,106,247,0.4)'
  },
  choiceText: {
    flex: 1,
    lineHeight: 1.55,
    overflowWrap: 'anywhere'
  },
}
