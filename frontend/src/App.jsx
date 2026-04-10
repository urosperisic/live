import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const { user, loading, init } = useAuthStore()

  useEffect(() => {
    init()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text-muted)',
        fontSize: '1.4rem',
      }}>
        Loading…
      </div>
    )
  }

  return user ? <ChatPage /> : <AuthPage />
}