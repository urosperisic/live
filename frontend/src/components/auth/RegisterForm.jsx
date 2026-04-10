import { useState } from 'react'
import useAuthStore from '../../store/authStore'

const INIT = { username: '', email: '', password: '', password2: '' }

export default function RegisterForm({ onSwitch }) {
  const { register, error, clearError } = useAuthStore()
  const [fields, setFields]   = useState(INIT)
  const [local, setLocal]     = useState({})   // client-side validation errors
  const [loading, setLoading] = useState(false)

  const set = (e) => {
    clearError()
    setLocal({})
    setFields(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const errs = {}
    if (fields.username.trim().length < 3)
      errs.username = 'Username must be at least 3 characters.'
    if (fields.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'
    if (fields.password !== fields.password2)
      errs.password2 = 'Passwords do not match.'
    return errs
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setLocal(errs); return }

    setLoading(true)
    try {
      await register(fields.username, fields.email, fields.password, fields.password2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__group">
        <label className="form__label" htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          name="username"
          className="form__input"
          type="text"
          autoComplete="username"
          autoFocus
          value={fields.username}
          onChange={set}
          required
        />
        {local.username && <span className="form__error">{local.username}</span>}
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="reg-email">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <input
          id="reg-email"
          name="email"
          className="form__input"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={set}
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          name="password"
          className="form__input"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          onChange={set}
          required
        />
        {local.password && <span className="form__error">{local.password}</span>}
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="reg-password2">Confirm password</label>
        <input
          id="reg-password2"
          name="password2"
          className="form__input"
          type="password"
          autoComplete="new-password"
          value={fields.password2}
          onChange={set}
          required
        />
        {local.password2 && <span className="form__error">{local.password2}</span>}
        {error && <span className="form__error">{error}</span>}
      </div>

      <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <div className="auth-card__switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch}>Sign in</button>
      </div>
    </form>
  )
}