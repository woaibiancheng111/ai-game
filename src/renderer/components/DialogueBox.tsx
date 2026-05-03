import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { StoryNode, ConversationMessage } from '../../data/types'

interface DialogueBoxProps {
  node: StoryNode | null
  messages: ConversationMessage[]
  isLoading: boolean
  playerName: string
}

interface DisplayedMessage extends ConversationMessage {
  isFullyDisplayed: boolean
  displayedContent: string
}

export default function DialogueBox({ node, messages, isLoading, playerName }: DialogueBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>([])
  const [currentTypingIndex, setCurrentTypingIndex] = useState<number>(-1)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesRef = useRef<ConversationMessage[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayedMessages])

  const updateDisplayedMessage = useCallback((index: number, updates: Partial<DisplayedMessage>) => {
    setDisplayedMessages(prev => {
      const newMessages = [...prev]
      if (newMessages[index]) {
        newMessages[index] = { ...newMessages[index], ...updates }
      }
      return newMessages
    })
  }, [])

  const typeMessage = useCallback((messageIndex: number, fullContent: string) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }

    let currentCharIndex = 0
    const typingSpeed = 30

    const typeNextChar = () => {
      if (currentCharIndex < fullContent.length) {
        currentCharIndex++
        const newContent = fullContent.slice(0, currentCharIndex)
        updateDisplayedMessage(messageIndex, { displayedContent: newContent })
        
        typingTimerRef.current = setTimeout(typeNextChar, typingSpeed)
      } else {
        updateDisplayedMessage(messageIndex, { isFullyDisplayed: true })
        setCurrentTypingIndex(-1)
        
        setTimeout(() => {
          if (messagesRef.current.length > messageIndex + 1) {
            const nextMessage = messagesRef.current[messageIndex + 1]
            if (nextMessage.role === 'narration' || nextMessage.role === 'player') {
              setCurrentTypingIndex(messageIndex + 1)
            }
          }
        }, 500)
      }
    }

    typeNextChar()
  }, [updateDisplayedMessage])

  useEffect(() => {
    const currentDisplayedIds = displayedMessages.map(m => m.id)
    const newMessages = messages.filter(m => !currentDisplayedIds.includes(m.id))
    
    if (newMessages.length > 0) {
      const newDisplayedMessages: DisplayedMessage[] = newMessages.map(msg => ({
        ...msg,
        isFullyDisplayed: msg.role !== 'narration' && msg.role !== 'player',
        displayedContent: msg.role === 'narration' || msg.role === 'player' ? '' : msg.content
      }))
      
      setDisplayedMessages(prev => [...prev, ...newDisplayedMessages])
      
      const firstNewNarrationIndex = displayedMessages.length + 
        newMessages.findIndex(m => m.role === 'narration' || m.role === 'player')
      
      if (firstNewNarrationIndex >= displayedMessages.length && currentTypingIndex === -1) {
        setCurrentTypingIndex(firstNewNarrationIndex)
      }
    }
  }, [messages, displayedMessages, currentTypingIndex])

  useEffect(() => {
    if (currentTypingIndex >= 0 && currentTypingIndex < displayedMessages.length) {
      const message = displayedMessages[currentTypingIndex]
      if (!message.isFullyDisplayed && message.displayedContent === '') {
        typeMessage(currentTypingIndex, message.content)
      }
    }
    
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = null
      }
    }
  }, [currentTypingIndex, displayedMessages, typeMessage])

  const getMessageContent = (msg: DisplayedMessage): string => {
    if (msg.role === 'narration' || msg.role === 'player') {
      return msg.displayedContent || ''
    }
    return msg.content
  }

  const latestNarration = messages.filter(m => m.role === 'narration').pop()

  return (
    <div style={styles.container}>
      <div style={styles.locationBar}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="#f7a26a">
          <path d="M7 1C4.8 1 3 2.8 3 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4zm0 5.5A1.5 1.5 0 1 1 7 3.5 1.5 1.5 0 0 1 7 6.5z"/>
        </svg>
        <span style={styles.locationText}>{node?.location ?? '未知地点'}</span>
        <span style={styles.nodeTitle}>{node?.title ?? ''}</span>
      </div>

      <div style={styles.scrollArea} ref={scrollRef}>
        {displayedMessages.length === 0 && node && (
          <div style={styles.narrationBox}>
            <p style={styles.narrationText}>{node.description}</p>
          </div>
        )}

        {displayedMessages.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'player' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.role === 'narration' && (
              <div style={styles.narrationBox}>
                <p style={styles.narrationText}>{getMessageContent(msg)}</p>
              </div>
            )}

            {msg.role === 'player' && (
              <div style={styles.playerBubble}>
                <p style={styles.playerText}>{getMessageContent(msg)}</p>
              </div>
            )}

            {msg.role === 'npc' && (
              <div style={styles.npcBubble}>
                <div style={styles.npcAvatarSmall}>
                  <span style={styles.npcInitial}>
                    {msg.npcId === 'xuejie' ? '学' : '?'}
                  </span>
                </div>
                <div>
                  <div style={styles.npcName}>
                    {msg.npcId === 'xuejie' ? `${playerName}的学姐` : 'NPC'}
                  </div>
                  <div style={styles.npcBubbleText}>
                    <p style={styles.npcText}>{getMessageContent(msg)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={styles.loadingRow}>
            <div style={styles.loadingDots}>
              <span style={{...styles.dot, animationDelay: '0ms'}} />
              <span style={{...styles.dot, animationDelay: '200ms'}} />
              <span style={{...styles.dot, animationDelay: '400ms'}} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(26,26,46,0.6)',
    borderRadius: '16px',
    border: '1px solid #2a2a4c',
    overflow: 'hidden',
    minHeight: 0
  },
  locationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(37,37,64,0.8)',
    borderBottom: '1px solid #2a2a4c',
    fontSize: '13px'
  },
  locationText: {
    color: '#f7a26a',
    fontWeight: 500
  },
  nodeTitle: {
    color: '#9898b0',
    marginLeft: 'auto',
    fontSize: '12px'
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  narrationBox: {
    background: 'rgba(124,106,247,0.08)',
    borderRadius: '12px',
    padding: '14px 18px',
    border: '1px solid rgba(124,106,247,0.12)',
    maxWidth: '85%'
  },
  narrationText: {
    fontSize: '15px',
    color: '#c8c8e0',
    lineHeight: 1.8,
    fontStyle: 'italic'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px'
  },
  playerBubble: {
    background: 'linear-gradient(135deg, #7c6af7 0%, #5a4bbf 100%)',
    borderRadius: '16px 16px 4px 16px',
    padding: '12px 16px',
    maxWidth: '70%'
  },
  playerText: {
    fontSize: '15px',
    color: '#fff',
    lineHeight: 1.6
  },
  npcBubble: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    maxWidth: '75%'
  },
  npcAvatarSmall: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f7a26a 0%, #e8825a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  npcInitial: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700
  },
  npcName: {
    fontSize: '12px',
    color: '#f7a26a',
    marginBottom: '4px',
    fontWeight: 500
  },
  npcBubbleText: {
    background: 'rgba(37,37,64,0.9)',
    borderRadius: '16px 16px 16px 4px',
    padding: '12px 16px',
    border: '1px solid #3a3a5c'
  },
  npcText: {
    fontSize: '15px',
    color: '#e8e8f0',
    lineHeight: 1.7
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center'
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
    padding: '10px 16px',
    background: 'rgba(37,37,64,0.9)',
    borderRadius: '16px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#7c6af7',
    animation: 'pulse 1.2s ease-in-out infinite'
  }
}
