const BASE = process.env.NEXT_PUBLIC_API_URL || ''

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function api(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

async function upload(path, formData) {
  const token = getToken()
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

export const apiGet = (path) => api(path)
export const apiPost = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPut = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) })
export const apiDelete = (path) => api(path, { method: 'DELETE' })
export const apiUpload = (path, formData) => upload(path, formData)
