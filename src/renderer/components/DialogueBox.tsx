import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { StoryNode, ConversationMessage } from '../../data/types'
import { getNPCDisplayName, getNPCInitial } from '../../engine/npc'
import { getMessageRevealDelay } from '../utils/revealTiming'

interface DialogueBoxProps {
  node: StoryNode | null
  messages: ConversationMessage[]
  isLoading: boolean
  sceneImageUrl?: string
  onTypingChange?: (typing: boolean) => void
  skipReveal?: boolean
  spriteUrl?: string | null
}

interface MessageItemProps {
  msg: ConversationMessage
  onNpcTypingChange: (messageId: string, typing: boolean) => void
  onNpcTypingTick: () => void
}

const NPC_TYPEWRITER_BASE_DELAY = 24

export default function DialogueBox({ node, messages, isLoading, skipReveal, spriteUrl, sceneImageUrl, onTypingChange }: DialogueBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const previousMessageIds = useRef<string[]>([])
  const scrollFrame = useRef<number | null>(null)
  const [visibleMessageCount, setVisibleMessageCount] = useState(messages.length)
  const [typingNpcMessageIds, setTypingNpcMessageIds] = useState<Record<string, boolean>>({})
  const messageIds = useMemo(() => messages.map(msg => msg.id), [messages])
  const messageSignature = useMemo(() => messages.map(msg => `${msg.id}:${msg.role}`).join('|'), [messages])
  const messageRevealSignature = useMemo(() => messages.map(msg => `${msg.id}:${msg.role}:${msg.isStreaming ? 'streaming' : 'static'}`).join('|'), [messages])
  const lastRevealTimeRef = useRef<number>(Date.now())

  const visibleContentSignature = useMemo(
    () => messages
      .slice(0, visibleMessageCount)
      .map(msg => `${msg.id}:${msg.content.length}`)
      .join('|'),
    [messages, visibleMessageCount]
  )
  const visibleMessageIdSignature = useMemo(
    () => messages
      .slice(0, visibleMessageCount)
      .map(msg => msg.id)
      .join('|'),
    [messages, visibleMessageCount]
  )

  const scrollToBottom = useCallback(() => {
    if (scrollFrame.current !== null) {
      window.cancelAnimationFrame(scrollFrame.current)
    }

    scrollFrame.current = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
        bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' })
        scrollFrame.current = null
      })
    })
  }, [])

  const handleNpcTypingChange = useCallback((messageId: string, typing: boolean) => {
    setTypingNpcMessageIds(prev => {
      const alreadyTyping = Boolean(prev[messageId])

      if (typing && alreadyTyping) {
        return prev
      }

      if (!typing && !alreadyTyping) {
        return prev
      }

      if (!typing) {
        const next = { ...prev }
        delete next[messageId]
        return next
      }

      return {
        ...prev,
        [messageId]: true
      }
    })
  }, [])

  const handleNpcTypingTick = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  useEffect(() => {
    const previousIds = previousMessageIds.current
    const isSamePrefix = previousIds.every((id, index) => messageIds[index] === id)

    if (skipReveal) {
      setVisibleMessageCount(messages.length)
    } else if (!isSamePrefix || messageIds.length < previousIds.length) {
      setVisibleMessageCount(0)
    } else {
      setVisibleMessageCount(prev => Math.min(prev, messages.length))
    }

    previousMessageIds.current = messageIds
  }, [messageIds, messages.length, skipReveal])

  useEffect(() => {
    const visibleIds = new Set(visibleMessageIdSignature ? visibleMessageIdSignature.split('|') : [])

    setTypingNpcMessageIds(prev => {
      let changed = false
      const next: Record<string, boolean> = {}

      for (const id of Object.keys(prev)) {
        if (visibleIds.has(id)) {
          next[id] = true
        } else {
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [visibleMessageIdSignature])

  useEffect(() => {
    if (visibleMessageCount >= messages.length) {
      return
    }

    const previousMessage = visibleMessageCount > 0 ? messages[visibleMessageCount - 1] : null
    let requiredDelay = 0
    if (previousMessage && !previousMessage.isStreaming) {
      requiredDelay = getMessageRevealDelay(previousMessage)
    } else if (previousMessage?.isStreaming) {
      requiredDelay = 40
    }

    // 如果之前的消息很久以前就显示了，就不要再等了（比如刚点击选项，第一句话应该立刻出来）
    const timeSinceLastReveal = Date.now() - lastRevealTimeRef.current
    const remainingDelay = skipReveal ? 0 : Math.max(0, requiredDelay - timeSinceLastReveal)

    const timer = window.setTimeout(() => {
      setVisibleMessageCount(prev => Math.min(messages.length, prev + 1))
      lastRevealTimeRef.current = Date.now()
    }, remainingDelay)

    return () => window.clearTimeout(timer)
  }, [messages.length, visibleMessageCount, skipReveal])

  useLayoutEffect(() => {
    scrollToBottom()

    return () => {
      if (scrollFrame.current !== null) {
        window.cancelAnimationFrame(scrollFrame.current)
        scrollFrame.current = null
      }
    }
  }, [messageSignature, messages.length, visibleMessageCount, isLoading, scrollToBottom])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [visibleContentSignature, scrollToBottom])

  const hasHiddenMessages = visibleMessageCount < messages.length
  const hasTypingNpcMessages = Object.keys(typingNpcMessageIds).length > 0
  const hasVisibleStreamingMessage = messages
    .slice(0, visibleMessageCount)
    .some(msg => msg.isStreaming)

  useEffect(() => {
    onTypingChange?.(hasHiddenMessages || hasTypingNpcMessages)
  }, [hasHiddenMessages, hasTypingNpcMessages, onTypingChange])

  return (
    <div style={styles.container}>
      <div style={styles.locationBar}>
        <div style={styles.locationLeft}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="#2dd4bf">
            <path d="M7 1C4.8 1 3 2.8 3 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4zm0 5.5A1.5 1.5 0 1 1 7 3.5 1.5 1.5 0 0 1 7 6.5z"/>
          </svg>
          <span style={styles.locationText}>{node?.location ?? '未知地点'}</span>
        </div>
        <span style={styles.nodeTitle}>{node?.title ?? ''}</span>
      </div>

      <div style={styles.scrollArea} ref={scrollRef}>
        <div style={styles.scenePanel}>
          {sceneImageUrl ? (
            <img src={sceneImageUrl} alt={node?.title ?? '当前场景'} style={styles.sceneImage} />
          ) : (
            <div style={styles.scenePlaceholder}>
              <div style={styles.sceneTitle}>{node?.title ?? '校园场景'}</div>
              <div style={styles.scenePrompt}>{node?.imagePrompt ?? '关键剧情场景图将在这里展示。'}</div>
            </div>
          )}
        </div>

        <div style={styles.messageList}>
          {messages.length === 0 && node && (
            <div style={styles.narrationBox}>
              <div style={styles.narrationKicker}>系统提示</div>
              <p style={styles.narrationText}>正在接入校园模拟网络...</p>
            </div>
          )}

          {messages.slice(0, visibleMessageCount).map(msg => (
            <MessageItem
              key={msg.id}
              msg={msg}
              onNpcTypingChange={handleNpcTypingChange}
              onNpcTypingTick={handleNpcTypingTick}
            />
          ))}

          {isLoading && !hasVisibleStreamingMessage && !hasTypingNpcMessages && (
            <div style={styles.loadingRow}>
              <div style={styles.loadingDots}>
                <span style={{...styles.dot, animationDelay: '0ms'}} />
                <span style={{...styles.dot, animationDelay: '200ms'}} />
                <span style={{...styles.dot, animationDelay: '400ms'}} />
              </div>
            </div>
          )}
          <div ref={bottomRef} style={styles.bottomAnchor} />
        </div>
      </div>
    </div>
  )
}

const MessageItem = memo(function MessageItem({ msg, onNpcTypingChange, onNpcTypingTick }: MessageItemProps) {
  const [displayedNpcContent, setDisplayedNpcContent] = useState(() => getInitialNpcDisplayedContent(msg))
  const npcFullChars = useMemo(() => msg.role === 'npc' ? Array.from(msg.content) : [], [msg.content, msg.role])
  const displayedNpcChars = useMemo(
    () => msg.role === 'npc' ? Array.from(displayedNpcContent) : [],
    [displayedNpcContent, msg.role]
  )
  const isNpcTyping = msg.role === 'npc' && (msg.isStreaming || displayedNpcChars.length < npcFullChars.length)

  useEffect(() => {
    if (msg.role !== 'npc') return
    return () => onNpcTypingChange(msg.id, false)
  }, [msg.id, msg.role, onNpcTypingChange])

  useEffect(() => {
    if (msg.role !== 'npc') return
    onNpcTypingChange(msg.id, isNpcTyping)
  }, [isNpcTyping, msg.id, msg.role, onNpcTypingChange])

  useEffect(() => {
    if (msg.role !== 'npc' || !displayedNpcContent) return

    if (!msg.content.startsWith(displayedNpcContent)) {
      setDisplayedNpcContent(msg.content)
      onNpcTypingTick()
    }
  }, [displayedNpcContent, msg.content, msg.role, onNpcTypingTick])

  useEffect(() => {
    if (msg.role !== 'npc' || displayedNpcChars.length >= npcFullChars.length) return

    const nextChar = npcFullChars[displayedNpcChars.length] ?? ''
    const step = getNpcTypewriterStep(npcFullChars.length, displayedNpcChars.length)
    const timer = window.setTimeout(() => {
      const nextLength = Math.min(npcFullChars.length, displayedNpcChars.length + step)
      setDisplayedNpcContent(npcFullChars.slice(0, nextLength).join(''))
      onNpcTypingTick()
    }, getNpcTypewriterDelay(nextChar))

    return () => window.clearTimeout(timer)
  }, [displayedNpcChars.length, msg.role, npcFullChars, onNpcTypingTick])

  const shouldShowNpcCursor = msg.role === 'npc' && (msg.isStreaming || displayedNpcChars.length < npcFullChars.length)

  return (
    <div
      style={{
        ...styles.messageRow,
        ...(msg.role === 'player' ? styles.playerMessageRow : styles.leftMessageRow)
      }}
    >
      {msg.role === 'narration' && (
        <div style={styles.narrationBox}>
          <div style={styles.narrationKicker}>旁白</div>
          <p style={styles.narrationText}>{msg.content}</p>
        </div>
      )}

      {msg.role === 'player' && (
        <div style={styles.playerBubble}>
          <p style={styles.playerText}>{msg.content}</p>
        </div>
      )}

      {msg.role === 'npc' && (
        <div style={styles.npcBubble}>
          <div style={styles.npcAvatarSmall}>
            <span style={styles.npcInitial}>
              {getNPCInitial(msg.npcId)}
            </span>
          </div>
          <div>
            <div style={styles.npcName}>
              {getNPCDisplayName(msg.npcId)}
            </div>
            <div style={{ ...styles.npcBubbleText, ...(msg.isStreaming ? styles.npcBubbleStreaming : {}) }}>
              <p style={styles.npcText}>
                {displayedNpcContent || (msg.isStreaming ? '思考中' : '')}
                {shouldShowNpcCursor && <span style={styles.streamCursor} />}
              </p>
            </div>
          </div>
        </div>
      )}

      {msg.role === 'education' && msg.educationCard && (
        <div style={styles.educationCard}>
          <div style={styles.educationHeader}>
            <span style={styles.educationCategory}>{msg.educationCard.category}</span>
            <span style={styles.educationTitle}>{msg.educationCard.title}</span>
          </div>
          <p style={styles.educationBody}>{msg.educationCard.body}</p>
          <div style={styles.educationChecklist}>
            {msg.educationCard.checklist.map(item => (
              <div key={item} style={styles.educationChecklistItem}>
                <span style={styles.educationCheck}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p style={styles.educationAction}>{msg.educationCard.campusAction}</p>
        </div>
      )}

      {msg.role === 'system' && (
        <div style={styles.systemBox}>
          {msg.content}
        </div>
      )}
    </div>
  )
})

function getInitialNpcDisplayedContent(msg: ConversationMessage): string {
  // 如果不是 NPC 消息，或者正在流式生成中（属于新消息），初始显示为空，准备打字机
  if (msg.role !== 'npc' || msg.isStreaming) {
    return ''
  }

  // 如果组件挂载时，消息已经不是 streaming 状态，说明它是历史消息
  // 历史消息（如读档、跨越节点重绘等）应该直接显示完整内容，不要再打字
  return msg.content
}

function getNpcTypewriterDelay(nextChar: string): number {
  if (nextChar === '\n') {
    return 90
  }

  if ('。！？!?；;'.includes(nextChar)) {
    return 110
  }

  if ('，、,.：:'.includes(nextChar)) {
    return 52
  }

  return NPC_TYPEWRITER_BASE_DELAY
}

function getNpcTypewriterStep(totalChars: number, displayedChars: number): number {
  const remainingChars = totalChars - displayedChars

  if (remainingChars > 120) {
    return 3
  }

  if (remainingChars > 60) {
    return 2
  }

  return 1
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(20, 20, 35, 0.75)',
    borderRadius: '24px',
    border: '1px solid var(--color-border)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
    overflow: 'hidden',
    minHeight: 0,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)'
  },
  locationBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 24px',
    background: 'linear-gradient(90deg, rgba(20,20,35,0.9), rgba(35,35,60,0.8))',
    borderBottom: '1px solid rgba(124,106,247,0.3)',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
  },
  locationLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0
  },
  locationText: {
    color: '#99f6e4',
    fontWeight: 700
  },
  nodeTitle: {
    color: '#cbd5e1',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '8px',
    background: 'rgba(15,23,42,0.58)',
    border: '1px solid rgba(148,163,184,0.12)'
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    scrollbarWidth: 'none' as const
  },
  scenePanel: {
    width: '100%',
    minHeight: '168px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(45,212,191,0.16)',
    background: 'linear-gradient(135deg, rgba(6,78,59,0.36), rgba(30,64,175,0.18), rgba(15,23,42,0.92))',
    boxShadow: 'inset 0 -48px 80px rgba(2,6,23,0.4)',
    flexShrink: 0
  },
  sceneImage: {
    width: '100%',
    height: '210px',
    objectFit: 'cover'
  },
  scenePlaceholder: {
    padding: '26px 28px',
    minHeight: '168px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px'
  },
  sceneTitle: {
    color: '#f8fafc',
    fontSize: '24px',
    fontWeight: 900
  },
  scenePrompt: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.75,
    maxWidth: '780px'
  },
  narrationBox: {
    background: 'linear-gradient(135deg, rgba(124,106,247,0.08), rgba(13,13,26,0.85))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '20px 24px',
    border: '1px solid rgba(124,106,247,0.25)',
    maxWidth: '94%',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    margin: '10px 0'
  },
  narrationKicker: {
    color: '#93c5fd',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: '6px'
  },
  narrationText: {
    fontSize: '15px',
    color: '#dbeafe',
    lineHeight: 1.8,
    fontStyle: 'italic',
    whiteSpace: 'pre-wrap'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    animation: 'messageReveal 0.52s ease-out both'
  },
  leftMessageRow: {
    justifyContent: 'flex-start'
  },
  playerMessageRow: {
    justifyContent: 'flex-end'
  },
  playerBubble: {
    background: 'linear-gradient(135deg, #7c6af7, #5a4ad1)',
    borderRadius: '24px 24px 4px 24px',
    padding: '14px 22px',
    maxWidth: '75%',
    boxShadow: '0 10px 30px rgba(124,106,247,0.25)',
    border: '1px solid rgba(255,255,255,0.1)'
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
    maxWidth: '78%'
  },
  npcAvatarSmall: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b 0%, #38bdf8 100%)',
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
    color: '#fbbf24',
    marginBottom: '4px',
    fontWeight: 500
  },
  npcBubbleText: {
    background: 'rgba(20,20,35,0.82)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px 24px 24px 4px',
    padding: '16px 24px',
    border: '1px solid rgba(124,106,247,0.35)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    position: 'relative'
  },
  npcBubbleStreaming: {
    border: '1px solid var(--color-accent)',
    boxShadow: '0 0 15px var(--color-accent-glow)'
  },
  npcText: {
    fontSize: '15px',
    color: '#e8e8f0',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap'
  },
  streamCursor: {
    display: 'inline-block',
    width: '7px',
    height: '1.15em',
    marginLeft: '3px',
    verticalAlign: '-0.18em',
    borderRadius: '2px',
    background: '#5eead4',
    animation: 'pulse 0.9s ease-in-out infinite'
  },
  educationCard: {
    width: 'min(760px, 92%)',
    background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(20,20,35,0.88))',
    border: '1px solid var(--color-primary-glow)',
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: '0 10px 28px rgba(0,0,0,0.5)'
  },
  educationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  educationCategory: {
    padding: '3px 8px',
    borderRadius: '8px',
    background: 'rgba(45,212,191,0.16)',
    color: '#5eead4',
    fontSize: '11px',
    fontWeight: 700
  },
  educationTitle: {
    color: '#e8e8f0',
    fontSize: '15px',
    fontWeight: 700
  },
  educationBody: {
    color: '#c8c8e0',
    fontSize: '14px',
    lineHeight: 1.75,
    marginBottom: '10px'
  },
  educationChecklist: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '8px',
    marginBottom: '10px'
  },
  educationChecklistItem: {
    display: 'flex',
    gap: '7px',
    color: '#d8d8ef',
    fontSize: '13px',
    lineHeight: 1.5
  },
  educationCheck: {
    color: '#5eead4',
    fontWeight: 800
  },
  educationAction: {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: 1.6,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '9px'
  },
  systemBox: {
    maxWidth: '88%',
    background: 'rgba(0, 240, 255, 0.1)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    borderRadius: '16px',
    padding: '14px 20px',
    color: '#e8e8f0',
    fontSize: '14px',
    lineHeight: 1.6,
    textShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
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
  },
  stageArea: {
    position: 'relative',
    flex: '1', // 占据剩余空间
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center'
  },
  spriteWrapper: {
    position: 'absolute',
    bottom: '-20px', // 让立绘稍微下沉一点
    left: '50%',
    transform: 'translateX(-50%)',
    height: '110%',
    zIndex: 5,
    pointerEvents: 'none'
  },
  spriteImage: {
    height: '100%',
    width: 'auto',
    objectFit: 'contain',
    animation: 'spriteEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.8))',
    mixBlendMode: 'multiply' as any,
    transformOrigin: 'bottom center'
  },
  messageZone: {
    height: '45%', // 固定对话区高度
    width: '100%',
    background: 'linear-gradient(to bottom, rgba(13,13,26,0.3) 0%, rgba(13,13,26,0.9) 20%, rgba(13,13,26,0.95) 100%)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    zIndex: 10
  },
  scrollArea: {
    height: '100%',
    overflowY: 'auto' as const,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    scrollbarWidth: 'none' as const
  },
  bottomAnchor: {
    width: '100%',
    height: '1px',
    flexShrink: 0
  }
}
