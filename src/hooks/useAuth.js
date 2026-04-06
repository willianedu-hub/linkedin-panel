import { useState, useEffect } from 'react'

const TOKEN_KEY = 'lm_token'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isAuthenticated = Boolean(token)

  const login = async (password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Senha incorreta')
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  const authFetch = async (path, options = {}) => {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      }
    })
    if (res.status === 401) { logout(); throw new Error('Sessão expirada') }
    return res
  }

  return { isAuthenticated, token, loading, error, login, logout, authFetch }
}
