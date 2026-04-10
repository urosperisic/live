import { useState, useRef } from 'react'

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const ref = useRef(null)

  const submit = () => {
    const content = value.trim()
    if (!content || disabled) return
    if (content.length > 4096) return
    onSend(content)
    setValue('')
    ref.current?.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="chat__input-area">
      <div className="input-form">
        <label htmlFor="message-input" className="visually-hidden">Message</label>
        <textarea
          ref={ref}
          id="message-input"
          className="input-form__field"
          placeholder={disabled ? 'Connecting…' : 'Message…'}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
        />
        <button
          className="input-form__btn"
          onClick={submit}
          disabled={disabled || !value.trim()}
          title="Send"
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
    </div>
  )
}