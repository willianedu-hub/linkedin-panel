import { useCallback } from "react";

const TOKEN_KEY = "lp_token";

export function useApi() {
  const call = useCallback(async (action, payload = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  }, []);

  return { call };
}
