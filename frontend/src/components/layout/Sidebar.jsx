import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import useChatStore from '../../store/chatStore'
import UserAvatar from './UserAvatar'

export default function Sidebar({ open, onClose }) {
  const { user, logout }                    = useAuthStore()
  const { rooms, activeSlug, setActiveRoom, createRoom } = useChatStore()
  const [showModal, setShowModal]           = useState(false)
  const [roomName, setRoomName]             = useState('')
  const [isPrivate, setIsPrivate]           = useState(false)
  const [creating, setCreating]             = useState(false)
  const [err, setErr]                       = useState('')

  const handleRoomClick = (slug) => {
    setActiveRoom(slug)
    onClose()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) { setErr('Room name is required.'); return }
    setCreating(true)
    setErr('')
    try {
      const room = await createRoom(roomName.trim(), isPrivate)
      setActiveRoom(room.slug)
      setShowModal(false)
      setRoomName('')
      onClose()
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to create room.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        {/* Header */}
        <div className="sidebar__header">
          <h1 className="sidebar__title">Rooms</h1>
          {user?.role === 'admin' && (
            <button className="btn btn--icon" onClick={() => setShowModal(true)} title="New room">
              +
            </button>
          )}
        </div>

        {/* Room list */}
        <nav className="sidebar__rooms">
          {rooms.length === 0 && (
            <p style={{ padding: '1.6rem', fontSize: '1.3rem', color: 'var(--text-muted)' }}>
              No rooms yet.
            </p>
          )}
          {rooms.map(room => (
            <div
              key={room.slug}
              className={`room-item${activeSlug === room.slug ? ' room-item--active' : ''}`}
              onClick={() => handleRoomClick(room.slug)}
            >
              <span className="room-item__hash" aria-hidden="true">{room.is_private ? '^' : '#'}</span>
              <span>{room.name}</span>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <UserAvatar username={user?.username} />
          <span className="sidebar__username">{user?.username}</span>
          <button className="btn btn--icon btn--danger" onClick={logout} title="Sign out">
            ↩
          </button>
        </div>
      </aside>

      {/* Create room modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <span className="modal__title">New Room</span>
              <button className="btn btn--icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form className="form" onSubmit={handleCreate}>
              <div className="form__group">
                <label className="form__label" htmlFor="room-name">Room name</label>
                <input
                  id="room-name"
                  className="form__input"
                  type="text"
                  autoFocus
                  value={roomName}
                  onChange={e => { setErr(''); setRoomName(e.target.value) }}
                  placeholder="e.g. general"
                />
                {err && <span className="form__error">{err}</span>}
              </div>

              <div className="form__group">
                <label className="form__label" htmlFor="is-private">Private room</label>
                <input
                  id="is-private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                />
              </div>

              <button className="btn btn--primary btn--full" type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}