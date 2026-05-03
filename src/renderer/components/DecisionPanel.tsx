import React, { useState } from 'react'
import type { PlayerChoice } from '../../data/types'

interface DecisionPanelProps {
  choices: PlayerChoice[]
  onSelect: (choice: PlayerChoice) => void
  disabled?: boolean
}

export default function DecisionPanel({ choices, onSelect, disabled }: DecisionPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!choices || choices.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyHint}>
          <span style={styles.emptyDot} />
          等待下一步...
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#7c6af7">
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
    padding: '16px 0'
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
    background: 'rgba(26,26,46,0.8)',
    borderRadius: '16px',
    border: '1px solid #2a2a4c',
    padding: '16px 20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#9898b0'
  },
  headerText: {
    letterSpacing: '1px'
  },
  choicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '10px'
  },
  choiceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'rgba(37,37,64,0.7)',
    border: '1px solid #3a3a5c',
    borderRadius: '12px',
    color: '#e8e8f0',
    textAlign: 'left' as const,
    fontSize: '14px',
    transition: 'all 0.15s ease',
    cursor: 'pointer'
  },
  choiceButtonHover: {
    background: 'rgba(124,106,247,0.15)',
    border: '1px solid rgba(124,106,247,0.4)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(124,106,247,0.15)'
  },
  choiceButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none'
  },
  choiceNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(124,106,247,0.2)',
    color: '#7c6af7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '13px',
    flexShrink: 0
  },
  choiceText: {
    flex: 1,
    lineHeight: 1.5
  },
  effects: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
    marginLeft: 'auto',
    flexShrink: 0
  },
  effectTag: {
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const
  }
}
