import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("nemesis_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nemesis_access_token"));
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(localStorage.getItem("nemesis_access_token")));

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
        localStorage.setItem("nemesis_user", JSON.stringify(res.data));
      } catch {
        localStorage.removeItem("nemesis_access_token");
        localStorage.removeItem("nemesis_user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, [token]);

  const persistAuth = (data: AuthResponse) => {
    localStorage.setItem("nemesis_access_token", data.access_token);
    localStorage.setItem("nemesis_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    persistAuth(res.data);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    persistAuth(res.data);
  };

  const logout = () => {
    localStorage.removeItem("nemesis_access_token");
    localStorage.removeItem("nemesis_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
