import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import AuthAnimation from '../components/auth/AuthAnimation'

export default function AuthPage() {
  const [mode, setMode] = useState('login')

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div>
          <h1 className="auth-card__title">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="auth-card__sub">
            {mode === 'login'
              ? 'Sign in to continue to the workspace.'
              : 'Join the workspace in seconds.'}
          </p>
        </div>

        {mode === 'login'
          ? <LoginForm    onSwitch={() => setMode('register')} />
          : <RegisterForm onSwitch={() => setMode('login')}    />
        }
      </div>

      <div className="auth-visual" aria-hidden="true">
        <AuthAnimation />
      </div>
    </main>
  )
}