import React, { useState } from "react";
import { C, Spinner, ErrorMsg } from "../components/ui";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    const ok = await onLogin(password);
    if (!ok) setError("Senha incorreta. Tente novamente.");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380, background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 20, padding: 36,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff",
          }}>
            W
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>LinkedIn Manager</div>
          <div style={{ fontSize: 13, color: C.muted }}>Willian Pimentel · CRO CULTSEC</div>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>Senha de acesso</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoFocus
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.surface,
                color: C.text, fontSize: 14, boxSizing: "border-box",
              }}
            />
          </div>

          <ErrorMsg>{error}</ErrorMsg>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: loading || !password.trim()
                ? C.surface
                : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              color: loading || !password.trim() ? C.muted : "#fff",
              fontSize: 14, fontWeight: 700,
              boxShadow: loading || !password.trim() ? "none" : `0 4px 16px ${C.accent}33`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            {loading ? <><Spinner size={18} /> Entrando...</> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
