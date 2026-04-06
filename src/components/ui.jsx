export const C = {
  bg: '#080d18', surface: '#0f1623', card: '#161f30', border: '#1d3354',
  accent: '#2d7ff9', glow: '#5b9cff', purple: '#7c5cfc',
  green: '#0fba81', orange: '#f5a623', red: '#f04b4b', teal: '#0ec4c4',
  text: '#eef2f8', muted: '#5a6a85', subtle: '#8899b4',
}

export const PILLAR_C = { '🏆': C.orange, '🔐': C.purple, '🧠': C.green, '🌎': C.accent, '🔥': C.red }

export function Badge({ children, color = C.accent, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 20, background: `${color}22`, border: `1px solid ${color}44`,
      color, fontSize: 11, fontWeight: 700, ...style }}>
      {children}
    </span>
  )
}

export function Card({ children, highlight, style = {} }) {
  return (
    <div className="fade-in" style={{
      background: highlight ? `${C.accent}0a` : C.card,
      border: `1px solid ${highlight ? C.accent + '55' : C.border}`,
      borderRadius: 14, padding: 20, marginBottom: 14, ...style }}>
      {children}
    </div>
  )
}

export function STitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, color: C.muted,
      textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12 }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const bg = variant === 'primary' ? `linear-gradient(135deg,${C.accent},${C.purple})`
    : variant === 'success' ? `linear-gradient(135deg,${C.green},${C.teal})`
    : C.card
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px 20px', borderRadius: 12,
      border: variant === 'ghost' ? `1px solid ${C.border}` : 'none',
      background: disabled ? C.surface : bg,
      color: disabled ? C.muted : variant === 'ghost' ? C.subtle : '#fff',
      fontSize: 14, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginBottom: 10,
      boxShadow: disabled || variant === 'ghost' ? 'none' : `0 4px 16px ${C.accent}33`,
      transition: 'opacity .2s', ...style }}>
      {children}
    </button>
  )
}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
      borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent',
      color: C.muted, fontSize: 12, cursor: 'pointer', marginBottom: 20 }}>
      ← Voltar
    </button>
  )
}

export function Spinner({ text = 'Carregando...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px', gap: 14 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.accent}`, borderRadius: '50%',
        animation: 'spin .7s linear infinite' }} />
      <div style={{ color: C.muted, fontSize: 13 }}>{text}</div>
    </div>
  )
}

export function CopyBox({ value, id, copied, onCopy, italic }) {
  return (
    <div style={{ position: 'relative', background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '14px 52px 14px 14px', fontSize: 13, lineHeight: 1.8,
      color: italic ? C.subtle : C.text, whiteSpace: 'pre-wrap', marginBottom: 12,
      fontStyle: italic ? 'italic' : 'normal' }}>
      {value || '—'}
      <button onClick={() => onCopy(value, id)} style={{
        position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 6,
        border: `1px solid ${C.border}`, background: copied === id ? `${C.green}22` : C.card,
        color: copied === id ? C.green : C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
        {copied === id ? '✓' : 'Copiar'}
      </button>
    </div>
  )
}

export function Textarea({ value, onChange, placeholder, minHeight = 80 }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 10,
        border: `1px solid ${C.border}`, background: C.surface, color: C.text,
        fontSize: 13, outline: 'none', resize: 'vertical',
        minHeight, fontFamily: 'inherit', boxSizing: 'border-box' }} />
  )
}

export function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 10,
        border: `1px solid ${C.border}`, background: C.surface, color: C.text,
        fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  )
}
