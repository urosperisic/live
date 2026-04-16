import { create } from 'zustand'
import { fetchRooms, createRoom, joinRoom, leaveRoom, fetchMessages } from '../api/chat' // CHANGED: + fetchMessages

const useChatStore = create((set, get) => ({
  rooms:       [],
  activeSlug:  null,
  messages:    {},   // { [slug]: Message[] }
  online:      {},   // { [slug]: string[] }
  loading:     false,
  error:       null,
  hasMore:     {},
  loadingMore: {},
  oldestId:    {},

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
  // CHANGED: accepts meta, stores has_more + oldest_id ↓
  setHistory: (slug, messages, meta = {}) =>
    set(s => ({
      messages:    { ...s.messages,    [slug]: messages },
      hasMore:     { ...s.hasMore,     [slug]: meta.has_more  ?? false },
      oldestId:    { ...s.oldestId,    [slug]: meta.oldest_id ?? null  },
      loadingMore: { ...s.loadingMore, [slug]: false },
    })),

  addMessage: (slug, message) =>
    set(s => ({
      messages: {
        ...s.messages,
        [slug]: [...(s.messages[slug] || []), message],
      },
    })),

  // CHANGED: new action ↓
  loadMoreMessages: async (slug) => {
      const { oldestId, loadingMore, hasMore } = get()
      if (loadingMore[slug] || !hasMore[slug]) return

      const el = document.querySelector('.chat__messages')
      const prevHeight = el?.scrollHeight ?? 0

      set(s => ({ loadingMore: { ...s.loadingMore, [slug]: true } }))

      try {
        const { data, meta } = await fetchMessages(slug, { before: oldestId[slug] })
        set(s => ({
          messages:    { ...s.messages,    [slug]: [...data, ...(s.messages[slug] || [])] },
          hasMore:     { ...s.hasMore,     [slug]: meta.has_more  ?? false },
          oldestId:    { ...s.oldestId,    [slug]: meta.oldest_id ?? null  },
          loadingMore: { ...s.loadingMore, [slug]: false },
        }))
        // CHANGED: moved after set() so React has rendered new messages ↓
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - prevHeight
        })
      } catch {
        set(s => ({ loadingMore: { ...s.loadingMore, [slug]: false } }))
      }
    },

  // ── Presence ──────────────────────────────────────────
  setOnline: (slug, users) =>
    set(s => ({ online: { ...s.online, [slug]: users } })),

  clearError: () => set({ error: null }),
}))

export default useChatStore