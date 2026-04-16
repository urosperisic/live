import api from './axios'

export async function fetchRooms() {
  const res = await api.get('/chat/rooms/')
  return res.data.data
}

export async function createRoom(name, is_private = false) {
  const res = await api.post('/chat/rooms/', { name, is_private })
  return res.data.data
}

// CHANGED: accepts params ({ before, limit }), returns { data, meta } ↓
export async function fetchMessages(slug, params = {}) {
  const query = new URLSearchParams(params).toString()
  const res   = await api.get(`/chat/rooms/${slug}/messages/${query ? `?${query}` : ''}`)
  return { data: res.data.data, meta: res.data.meta }
}

export async function inviteUser(slug, username) {
  const res = await api.post(`/chat/rooms/${slug}/invite/`, { username })
  return res.data
}

export async function joinRoom(slug) {
  const res = await api.post(`/chat/rooms/${slug}/join/`)
  return res.data
}

export async function leaveRoom(slug) {
  const res = await api.post(`/chat/rooms/${slug}/leave/`)
  return res.data
}