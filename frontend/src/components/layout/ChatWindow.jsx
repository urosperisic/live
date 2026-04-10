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
  const { rooms, activeSlug, messages } = useChatStore()
  const { user }                        = useAuthStore()
  const room      = rooms.find(r => r.slug === activeSlug)
  const msgs      = messages[activeSlug] || []
  const bottomRef = useRef(null)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

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

  const grouped = msgs.map((msg, i) => ({
    ...msg,
    isFirst: i === 0 || msgs[i - 1].sender !== msg.sender,
  }))

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
        <ConnectionStatus status={status} />
      </div>

      <div className="chat__messages">
        {grouped.length === 0 && (
          <div className="chat__empty">
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {grouped.map(msg => (
          <MessageBubble key={msg.id} message={msg} isFirst={msg.isFirst} />
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