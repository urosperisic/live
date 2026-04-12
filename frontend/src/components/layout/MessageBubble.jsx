import useAuthStore from '../../store/authStore'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isFirst }) {
  const { user } = useAuthStore()
  const codeContent = message.content.replace(/```[\w]*\n?/g, '').trim()

  return (
    <div className={`message${isFirst ? ' message--first' : ''}`}>
      {isFirst && (
        <div className="message__header">
          <span
            className="message__sender"
            style={message.sender === user?.username ? { color: 'var(--success)' } : {}}
          >
            {message.sender}
          </span>
          <span className="message__time">{formatTime(message.created_at)}</span>
        </div>
      )}
      <div className="message__content">
        {message.content.includes('```')
          ? (
            <div style={{ position: 'relative' }}>
              <pre className="code-block">
                <code>{codeContent}</code>
              </pre>
              <button
                className="btn btn--icon"
                style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', fontSize: '1.2rem' }}
                onClick={() => navigator.clipboard.writeText(codeContent)}
                title="Copy"
              >
                ⧉
              </button>
            </div>
          )
          : message.content
        }
      </div>
    </div>
  )
}