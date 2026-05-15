import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, MapPin, ShieldCheck } from 'lucide-react'
import type { ConversationMessage, StoryNode } from '../../data/types'
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

const NPC_TYPEWRITER_BASE_DELAY = 22

export default function DialogueBox({ node, messages, isLoading, skipReveal, onTypingChange }: DialogueBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const previousMessageIds = useRef<string[]>([])
  const scrollFrame = useRef<number | null>(null)
  const [visibleMessageCount, setVisibleMessageCount] = useState(messages.length)
  const [typingNpcMessageIds, setTypingNpcMessageIds] = useState<Record<string, boolean>>({})
  const messageIds = useMemo(() => messages.map(msg => msg.id), [messages])
  const messageSignature = useMemo(() => messages.map(msg => `${msg.id}:${msg.role}`).join('|'), [messages])
  const lastRevealTimeRef = useRef<number>(Date.now())

  const visibleContentSignature = useMemo(
    () => messages.slice(0, visibleMessageCount).map(msg => `${msg.id}:${msg.content.length}`).join('|'),
    [messages, visibleMessageCount]
  )
  const visibleMessageIdSignature = useMemo(
    () => messages.slice(0, visibleMessageCount).map(msg => msg.id).join('|'),
    [messages, visibleMessageCount]
  )

  const scrollToBottom = useCallback(() => {
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' })
        scrollFrame.current = null
      })
    })
  }, [])

  const handleNpcTypingChange = useCallback((messageId: string, typing: boolean) => {
    setTypingNpcMessageIds(prev => {
      if (typing && prev[messageId]) return prev
      if (!typing && !prev[messageId]) return prev
      if (!typing) {
        const next = { ...prev }
        delete next[messageId]
        return next
      }
      return { ...prev, [messageId]: true }
    })
  }, [])

  const handleNpcTypingTick = useCallback(() => scrollToBottom(), [scrollToBottom])

  useEffect(() => {
    const previousIds = previousMessageIds.current
    const isSamePrefix = previousIds.every((id, index) => messageIds[index] === id)
    if (skipReveal) setVisibleMessageCount(messages.length)
    else if (!isSamePrefix || messageIds.length < previousIds.length) setVisibleMessageCount(0)
    else setVisibleMessageCount(prev => Math.min(prev, messages.length))
    previousMessageIds.current = messageIds
  }, [messageIds, messages.length, skipReveal])

  useEffect(() => {
    const visibleIds = new Set(visibleMessageIdSignature ? visibleMessageIdSignature.split('|') : [])
    setTypingNpcMessageIds(prev => {
      let changed = false
      const next: Record<string, boolean> = {}
      for (const id of Object.keys(prev)) {
        if (visibleIds.has(id)) next[id] = true
        else changed = true
      }
      return changed ? next : prev
    })
  }, [visibleMessageIdSignature])

  useEffect(() => {
    if (visibleMessageCount >= messages.length) return
    const previousMessage = visibleMessageCount > 0 ? messages[visibleMessageCount - 1] : null
    let requiredDelay = 0
    if (previousMessage && !previousMessage.isStreaming) requiredDelay = getMessageRevealDelay(previousMessage)
    else if (previousMessage?.isStreaming) requiredDelay = 40
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
  const hasVisibleStreamingMessage = messages.slice(0, visibleMessageCount).some(msg => msg.isStreaming)

  useEffect(() => {
    onTypingChange?.(hasHiddenMessages || hasTypingNpcMessages)
  }, [hasHiddenMessages, hasTypingNpcMessages, onTypingChange])

  return (
    <section className="glass-panel-strong" style={styles.container} data-testid="dialogue-box">
      <div style={styles.locationBar}>
        <div style={styles.locationLeft}>
          <MapPin size={20} color="var(--color-primary)" />
          <span style={styles.locationText} data-testid="current-location">{node?.location ?? '未知地点'}</span>
        </div>
        <span style={styles.nodeTitle} data-testid="current-node-title">{node?.title ?? ''}</span>
      </div>

      <div style={styles.scrollArea} ref={scrollRef}>
        {messages.length === 0 && node && (
          <div style={styles.systemBox}>正在接入校园模拟网络...</div>
        )}

        {messages.slice(0, visibleMessageCount).map(msg => (
          <MessageItem key={msg.id} msg={msg} onNpcTypingChange={handleNpcTypingChange} onNpcTypingTick={handleNpcTypingTick} />
        ))}

        {isLoading && !hasVisibleStreamingMessage && !hasTypingNpcMessages && (
          <div style={styles.loadingRow}>
            <span style={{ ...styles.dot, animationDelay: '0ms' }} />
            <span style={{ ...styles.dot, animationDelay: '160ms' }} />
            <span style={{ ...styles.dot, animationDelay: '320ms' }} />
          </div>
        )}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </section>
  )
}

const MessageItem = memo(function MessageItem({ msg, onNpcTypingChange, onNpcTypingTick }: MessageItemProps) {
  const [displayedNpcContent, setDisplayedNpcContent] = useState(() => getInitialNpcDisplayedContent(msg))
  const npcFullChars = useMemo(() => msg.role === 'npc' ? Array.from(msg.content) : [], [msg.content, msg.role])
  const displayedNpcChars = useMemo(() => msg.role === 'npc' ? Array.from(displayedNpcContent) : [], [displayedNpcContent, msg.role])
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

  if (msg.role === 'narration') {
    return (
      <div style={styles.narrationBox}>
        <span style={styles.kicker}>旁白</span>
        <p style={styles.narrationText}>{msg.content}</p>
      </div>
    )
  }

  if (msg.role === 'player') {
    return (
      <div style={styles.playerRow}>
        <div style={styles.playerBubble}>
          <span style={styles.speakerTag}>你</span>
          <p style={styles.playerText}>{msg.content}</p>
        </div>
      </div>
    )
  }

  if (msg.role === 'npc') {
    return (
      <div style={styles.npcRow}>
        <div style={styles.npcAvatar}>{getNPCInitial(msg.npcId)}</div>
        <div style={styles.npcBubble}>
          <div style={styles.npcName}>{getNPCDisplayName(msg.npcId)}</div>
          <p style={styles.npcText}>
            {displayedNpcContent || (msg.isStreaming ? '思考中...' : '')}
            {shouldShowNpcCursor && <span style={styles.cursor} />}
          </p>
        </div>
      </div>
    )
  }

  if (msg.role === 'education' && msg.educationCard) {
    return (
      <div style={styles.educationCard}>
        <div style={styles.educationHeader}>
          <ShieldCheck size={22} />
          <span style={styles.educationCategory}>教育卡片（{msg.educationCard.category}）</span>
        </div>
        <h3 style={styles.educationTitle}>{msg.educationCard.title}</h3>
        <p style={styles.educationBody}>{msg.educationCard.body}</p>
        <div style={styles.checkList}>
          {msg.educationCard.checklist.map(item => (
            <span key={item} style={styles.checkItem}><CheckCircle2 size={16} />{item}</span>
          ))}
        </div>
      </div>
    )
  }

  if (msg.role === 'system') {
    return <div style={styles.systemBox}>{msg.content}</div>
  }

  return null
})

function getInitialNpcDisplayedContent(msg: ConversationMessage): string {
  if (msg.role !== 'npc' || msg.isStreaming) return ''
  return msg.content
}

function getNpcTypewriterDelay(nextChar: string): number {
  if (nextChar === '\n') return 90
  if ('。！？!?；;'.includes(nextChar)) return 105
  if ('，、,.：:'.includes(nextChar)) return 48
  return NPC_TYPEWRITER_BASE_DELAY
}

function getNpcTypewriterStep(totalChars: number, displayedChars: number): number {
  const remainingChars = totalChars - displayedChars
  if (remainingChars > 120) return 3
  if (remainingChars > 60) return 2
  return 1
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 'min(1120px, 100%)',
    alignSelf: 'center',
    marginTop: 'auto',
    borderRadius: '16px',
    overflow: 'hidden',
    height: 'clamp(320px, 54vh, 520px)',
    minHeight: 300,
    maxHeight: '58vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow:
      '0 24px 72px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
  },
  locationBar: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '0 28px',
    borderBottom: '1px solid var(--color-border)',
    background:
      'linear-gradient(90deg, rgba(159,202,120,0.10), rgba(255,255,255,0.035)), rgba(3,7,6,0.26)'
  },
  locationLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0
  },
  locationText: {
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 900
  },
  nodeTitle: {
    color: 'var(--color-text-dim)',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 28px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: 'inset 0 18px 38px rgba(0,0,0,0.12)'
  },
  narrationBox: {
    padding: '14px 20px',
    borderLeft: '3px solid var(--color-primary)',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.08), rgba(255,255,255,0.035))',
    borderRadius: 10,
    animation: 'messageReveal var(--transition-normal) both'
  },
  kicker: {
    display: 'block',
    color: 'var(--color-primary)',
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 5
  },
  narrationText: {
    color: 'var(--color-text-dim)',
    fontSize: 15,
    lineHeight: 1.75,
    whiteSpace: 'pre-wrap'
  },
  playerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    animation: 'messageReveal var(--transition-normal) both'
  },
  playerBubble: {
    maxWidth: '78%',
    padding: '14px 19px',
    borderRadius: '14px 14px 3px 14px',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.86), rgba(96,126,63,0.92))',
    color: '#fff'
  },
  speakerTag: {
    display: 'block',
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.82,
    marginBottom: 4
  },
  playerText: {
    fontSize: 15,
    lineHeight: 1.65
  },
  npcRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    maxWidth: '90%',
    animation: 'messageReveal var(--transition-normal) both'
  },
  npcAvatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, rgba(229,190,101,0.9), rgba(159,202,120,0.75))',
    color: '#fff',
    fontSize: 28,
    fontWeight: 900,
    boxShadow: 'var(--shadow-gold)'
  },
  npcBubble: {
    minWidth: 0,
    padding: '14px 20px',
    borderRadius: '14px 14px 14px 3px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.04))',
    border: '1px solid var(--color-border)',
    boxShadow: '0 14px 34px rgba(0,0,0,0.24)'
  },
  npcName: {
    color: 'var(--color-primary)',
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 5
  },
  npcText: {
    color: 'var(--color-text)',
    fontSize: 17,
    lineHeight: 1.75,
    whiteSpace: 'pre-wrap'
  },
  cursor: {
    display: 'inline-block',
    width: 8,
    height: '1.05em',
    marginLeft: 4,
    verticalAlign: '-0.12em',
    borderRadius: 2,
    background: 'var(--color-primary)',
    animation: 'pulse 0.9s ease-in-out infinite'
  },
  educationCard: {
    padding: 18,
    borderRadius: 12,
    border: '1px solid var(--color-border-strong)',
    background: 'linear-gradient(135deg, rgba(159,202,120,0.16), rgba(255,255,255,0.055))',
    boxShadow: 'var(--shadow-glow)',
    animation: 'messageReveal var(--transition-normal) both'
  },
  educationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--color-primary)',
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 8
  },
  educationCategory: {
    color: 'var(--color-primary)'
  },
  educationTitle: {
    color: 'var(--color-text)',
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 8
  },
  educationBody: {
    color: 'var(--color-text-dim)',
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 12
  },
  checkList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 8
  },
  checkItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text)',
    fontSize: 13
  },
  systemBox: {
    alignSelf: 'flex-start',
    padding: '10px 14px',
    borderRadius: 10,
    background: 'rgba(142,185,214,0.12)',
    border: '1px solid rgba(142,185,214,0.28)',
    color: 'var(--color-text-dim)',
    fontSize: 14,
    lineHeight: 1.6
  },
  loadingRow: {
    display: 'flex',
    gap: 6,
    padding: '10px 0'
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    animation: 'typingDot 1.1s ease-in-out infinite'
  }
}
