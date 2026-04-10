import api from './axios'

export async function fetchRooms() {
  const res = await api.get('/chat/rooms/')
  return res.data.data
}

export async function createRoom(name, is_private = false) {
  const res = await api.post('/chat/rooms/', { name, is_private })
  return res.data.data
}

export async function fetchMessages(slug) {
  const res = await api.get(`/chat/rooms/${slug}/messages/`)
  return res.data.data
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