import { create } from 'zustand'
import { fetchCsrf, fetchMe, login, logout, register } from '../api/auth'

const useAuthStore = create((set, get) => ({
  user:    null,
  loading: true,   // true on app init — waiting for /me check
  error:   null,

  // ── Init ──────────────────────────────────────────────
  // Called once on app mount — checks if session is still valid
  init: async () => {
    try {
      await fetchCsrf()
      const user = await fetchMe()
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  // ── Register ──────────────────────────────────────────
  register: async (username, email, password, password2) => {
    set({ error: null })
    try {
      await fetchCsrf()
      const user = await register(username, email, password, password2)
      set({ user })
    } catch (err) {
      const msg = err.response?.data?.errors?.username?.[0]
        || err.response?.data?.errors?.password?.[0]
        || err.response?.data?.message
        || 'Registration failed.'
      set({ error: msg })
      throw err
    }
  },

  // ── Login ─────────────────────────────────────────────
  login: async (username, password) => {
    set({ error: null })
    try {
      await fetchCsrf()
      const user = await login(username, password)
      set({ user })
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials.'
      set({ error: msg })
      throw err
    }
  },

  // ── Logout ────────────────────────────────────────────
  logout: async () => {
    try {
      await logout()
    } finally {
      set({ user: null })
    }
  },

  clearError: () => set({ error: null }),
}))

// ── Session expiry listener ────────────────────────────
// axios.js dispatches this event on 401
window.addEventListener('auth:expired', () => {
  useAuthStore.setState({ user: null })
})

export default useAuthStore