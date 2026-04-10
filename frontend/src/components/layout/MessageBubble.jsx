import UserAvatar from './UserAvatar'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isFirst }) {
  return (
    <div className={`message${isFirst ? ' message--first' : ''}`}>
      {isFirst && (
        <div className="message__header">
          <span className="message__sender">{message.sender}</span>
          <span className="message__time">{formatTime(message.created_at)}</span>
        </div>
      )}
      <div className="message__content">{message.content}</div>
    </div>
  )
}