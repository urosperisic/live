import axios from 'axios'

const api = axios.create({
  baseURL:         '/api',
  withCredentials: true,   // send sessionid cookie on every request
})

// ── CSRF ──────────────────────────────────────────────────
// Read the csrftoken cookie that Django sets via /api/auth/csrf/
function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]
}

// Attach X-CSRFToken header to every unsafe request
api.interceptors.request.use(config => {
  const unsafe = ['post', 'put', 'patch', 'delete']
  if (unsafe.includes(config.method)) {
    const token = getCsrfToken()
    if (token) config.headers['X-CSRFToken'] = token
  }
  return config
})

// ── Response ──────────────────────────────────────────────
// Unwrap the { ok, data, message, errors } envelope automatically.
// On 401 redirect to login (session expired).
api.interceptors.response.use(
  res  => res,
  err => {
    if (err.response?.status === 401) {
      // Clear local state and send to login — store handles this via authStore
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  },
)

export default api