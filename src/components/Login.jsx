import { useState } from 'react'
import { C } from './ui.jsx'

export default function Login({ onLogin, loading, error }) {
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.trim()) onLogin(password)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: C.bg, padding: 20 }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg,${C.accent},${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 auto 16px' }}>
            W
          </div>
          <div style={{ fontSize: 22, fontWeight: 800,
            background: `linear-gradient(135deg,${C.text},${C.glow})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LinkedIn Manager
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Willian Pimentel · CRO CULTSEC
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: C.muted,
                fontWeight: 600, marginBottom: 8 }}>
                Senha de acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: `1px solid ${error ? C.red + '88' : C.border}`,
                  background: C.surface, color: C.text, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.red}15`,
                border: `1px solid ${C.red}44`, color: C.red, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !password.trim()}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: loading ? C.surface : `linear-gradient(135deg,${C.accent},${C.purple})`,
                color: loading ? C.muted : '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : `0 4px 16px ${C.accent}33` }}>
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
