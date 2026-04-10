import { useState } from 'react'
import useAuthStore from '../../store/authStore'

export default function LoginForm({ onSwitch }) {
  const { login, error, clearError } = useAuthStore()
  const [fields, setFields] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (e) => {
    clearError()
    setFields(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(fields.username, fields.password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__group">
        <label className="form__label" htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          className="form__input"
          type="text"
          autoComplete="username"
          autoFocus
          value={fields.username}
          onChange={set}
          required
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          className="form__input"
          type="password"
          autoComplete="current-password"
          value={fields.password}
          onChange={set}
          required
        />
        {error && <span className="form__error">{error}</span>}
      </div>

      <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="auth-card__switch">
        No account?{' '}
        <button type="button" onClick={onSwitch}>Create one</button>
      </div>
    </form>
  )
}