import { create } from 'zustand'
import { fetchRooms, createRoom, joinRoom, leaveRoom } from '../api/chat'

const useChatStore = create((set, get) => ({
  rooms:       [],
  activeSlug:  null,
  messages:    {},   // { [slug]: Message[] }
  loading:     false,
  error:       null,

  // ── Rooms ─────────────────────────────────────────────
  loadRooms: async () => {
    set({ loading: true, error: null })
    try {
      const rooms = await fetchRooms()
      set({ rooms, loading: false })
    } catch {
      set({ error: 'Failed to load rooms.', loading: false })
    }
  },

  createRoom: async (name, is_private = false) => {
    const room = await createRoom(name, is_private)
    set(s => ({ rooms: [...s.rooms, room] }))
    return room
  },

  joinRoom: async (slug) => {
    await joinRoom(slug)
    await get().loadRooms()
  },

  leaveRoom: async (slug) => {
    await leaveRoom(slug)
    set(s => ({
      rooms:      s.rooms.filter(r => r.slug !== slug),
      activeSlug: s.activeSlug === slug ? null : s.activeSlug,
    }))
  },

  setActiveRoom: (slug) => set({ activeSlug: slug }),

  // ── Messages ──────────────────────────────────────────
  // Called by useChat hook when history arrives over WebSocket
  setHistory: (slug, messages) =>
    set(s => ({ messages: { ...s.messages, [slug]: messages } })),

  // Called by useChat hook on each incoming message
  addMessage: (slug, message) =>
    set(s => ({
      messages: {
        ...s.messages,
        [slug]: [...(s.messages[slug] || []), message],
      },
    })),

  clearError: () => set({ error: null }),
}))

export default useChatStore