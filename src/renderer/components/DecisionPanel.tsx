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
    display: 'flex',
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
    background: '#7c6af7',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  container: {
    background: 'rgba(8,13,24,0.76)',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.18)',
    padding: '14px 16px 16px',
    boxShadow: '0 18px 42px rgba(0,0,0,0.28)',
    backdropFilter: 'blur(14px)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#94a3b8'
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
    alignItems: 'flex-start',
    gap: '12px',
    minHeight: '58px',
    padding: '13px 15px',
    background: 'linear-gradient(180deg, rgba(30,41,59,0.76), rgba(15,23,42,0.9))',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: '10px',
    color: '#e8e8f0',
    textAlign: 'left' as const,
    fontSize: '14px',
    transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
    cursor: 'pointer'
  },
  choiceButtonHover: {
    background: 'linear-gradient(180deg, rgba(20,184,166,0.16), rgba(30,41,59,0.94))',
    border: '1px solid rgba(45,212,191,0.38)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 18px rgba(20,184,166,0.12)'
  },
  choiceButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none'
  },
  choiceNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    background: 'rgba(45,212,191,0.14)',
    color: '#5eead4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '13px',
    flexShrink: 0
  },
  choiceText: {
    flex: 1,
    lineHeight: 1.55,
    overflowWrap: 'anywhere'
  },
}
