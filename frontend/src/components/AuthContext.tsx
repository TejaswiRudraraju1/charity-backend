 "use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "../lib/api";
import { fetchMe } from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const token = window.localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const me = await fetchMe();
        setUser(me.user);
      } catch {
        window.localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}


