import api from './axios'

export async function fetchCsrf() {
  await api.get('/auth/csrf/')
}

export async function register(username, email, password, password2) {
  const res = await api.post('/auth/register/', { username, email, password, password2 })
  return res.data.data.user
}

export async function login(username, password) {
  const res = await api.post('/auth/login/', { username, password })
  return res.data.data.user
}

export async function logout() {
  await api.post('/auth/logout/')
}

export async function fetchMe() {
  const res = await api.get('/auth/me/')
  return res.data.data.user
}