import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'authenticated' | 'anonymous'

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data?.data || null);
      setStatus(res.data?.data ? "authenticated" : "anonymous");
    } catch (err) {
      // Only treat real auth failures as "logged out". Transient errors
      // (429 rate-limit, 5xx, network) must not silently sign the user out
      // mid-session.
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        setUser(null);
        setStatus("anonymous");
      } else {
        // Keep current user state; if it was 'loading', settle to 'anonymous'
        // so the app doesn't hang indefinitely on the splash.
        setStatus((prev) => (prev === "loading" ? "anonymous" : prev));
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((nextUser) => {
    setUser(nextUser);
    setStatus(nextUser ? "authenticated" : "anonymous");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch {
      // ignore — clearing client-side state regardless
    }
    setUser(null);
    setStatus("anonymous");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
