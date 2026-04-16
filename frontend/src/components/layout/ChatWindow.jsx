import { useEffect, useRef, useState } from 'react'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import { inviteUser } from '../../api/chat'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

function ConnectionStatus({ status }) {
  return (
    <div className={`conn-status conn-status--${status}`}>
      <div className="conn-status__dot" />
      {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Disconnected'}
    </div>
  )
}

function OnlineUsers({ slug }) {
  const online  = useChatStore(s => s.online[slug] ?? null)
  const [hover, setHover] = useState(false)

  if (!online || !online.length) return null

  return (
    <div
      className="online-indicator"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="online-indicator__dot" />
      <span className="online-indicator__count">{online.length} online</span>

      {hover && (
        <div className="online-popup" role="tooltip">
          <div className="online-popup__list">
            {[...online].sort().map(u => (
              <div key={u} className="online-popup__user">{u}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InviteModal({ slug, onClose }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await inviteUser(slug, username.trim())
      setSuccess(`${username} added successfully.`)
      setUsername('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite user.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">Invite to room</span>
          <button className="btn btn--icon" onClick={onClose}>✕</button>
        </div>
        <form className="form" onSubmit={submit}>
          <div className="form__group">
            <label className="form__label" htmlFor="invite-username">Username</label>
            <input
              id="invite-username"
              className="form__input"
              type="text"
              autoFocus
              value={username}
              onChange={e => { setError(''); setSuccess(''); setUsername(e.target.value) }}
              placeholder="e.g. john"
            />
            {error   && <span className="form__error">{error}</span>}
            {success && <span style={{ fontSize: '1.2rem', color: 'var(--success)' }}>{success}</span>}
          </div>
          <button className="btn btn--primary btn--full" type="submit" disabled={loading || !username.trim()}>
            {loading ? 'Inviting…' : 'Invite'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ChatWindow({ onMenuClick, status, sendMessage }) {
  const { rooms, activeSlug, messages, hasMore, loadingMore, loadMoreMessages } = useChatStore()
  const { user }    = useAuthStore()
  const room        = rooms.find(r => r.slug === activeSlug)
  const msgs        = messages[activeSlug] || []
  const bottomRef   = useRef(null)
  const scrollRef   = useRef(null)   // CHANGED: ref on messages container
  const [showInvite, setShowInvite] = useState(false)

  // Only scroll to bottom on new messages, not on prepends
  const prevMsgCount = useRef(0)

  useEffect(() => {
    const count = msgs.length
    if (count > prevMsgCount.current) {
      const wasInitialLoad = prevMsgCount.current === 0
      const lastMsg        = msgs[count - 1]
      const prevLastMsg    = msgs[prevMsgCount.current - 1]
      if (wasInitialLoad || lastMsg?.id !== prevLastMsg?.id) {
        bottomRef.current?.scrollIntoView({ behavior: wasInitialLoad ? 'auto' : 'smooth' })
      }
    }
    prevMsgCount.current = count
  }, [msgs])

  useEffect(() => {
  const el = scrollRef.current
  if (!el) return
  if (el.scrollHeight <= el.clientHeight && hasMore[activeSlug] && !loadingMore[activeSlug]) {
    loadMoreMessages(activeSlug)
  }
}, [msgs])

  // CHANGED: auto-trigger load more when scrolled to top ↓
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop === 0 && hasMore[activeSlug] && !loadingMore[activeSlug]) {
      loadMoreMessages(activeSlug)
    }
  }

  if (!room) {
    return (
      <main className="chat">
        <div className="chat__header">
          <button className="sidebar-toggle" onClick={onMenuClick}>☰</button>
        </div>
        <div className="chat__no-room">
          <p>Select a room to start chatting</p>
        </div>
      </main>
    )
  }

  const grouped = msgs.map((msg, i) => {
    const msgDate  = new Date(msg.created_at).toDateString()
    const prevDate = i > 0 ? new Date(msgs[i - 1].created_at).toDateString() : null
    return {
      ...msg,
      isFirst:   i === 0 || msgs[i - 1].sender !== msg.sender || msgDate !== prevDate,
      showDate:  msgDate !== prevDate,
      dateLabel: msgDate === new Date().toDateString()
        ? 'Today'
        : new Date(msg.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    }
  })

  return (
    <main className="chat">
      <div className="chat__header">
        <button className="sidebar-toggle" onClick={onMenuClick} aria-label="Toggle sidebar">☰</button>
        <span className="chat__room-name">
          {room.is_private ? '^' : '#'} {room.name}
        </span>
        {user?.role === 'admin' && room.is_private && (
          <button
            className="btn btn--icon"
            onClick={() => setShowInvite(true)}
            title="Invite user"
            aria-label="Invite user to room"
          >
            +
          </button>
        )}
        <OnlineUsers slug={activeSlug} />
        <ConnectionStatus status={status} />
      </div>

      {/* CHANGED: added ref + onScroll, removed Load More button ↓ */}
      <div className="chat__messages" ref={scrollRef} onScroll={handleScroll}>
        {grouped.length === 0 && (
          <div className="chat__empty">
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {grouped.map(msg => (
          <div key={msg.id}>
            {msg.showDate && (
              <div className="date-separator">
                <span>{msg.dateLabel}</span>
              </div>
            )}
            <MessageBubble message={msg} isFirst={msg.isFirst} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={sendMessage} disabled={status !== 'connected'} />

      {showInvite && (
        <InviteModal slug={activeSlug} onClose={() => setShowInvite(false)} />
      )}
    </main>
  )
}