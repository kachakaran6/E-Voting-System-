import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api";

export type Role = "SUPER_ADMIN" | "ADMIN" | "VOTER";

export type AuthUser = {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
  role: Role;
  voterId?: string;
  state?: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  sendOtp: (email: string, type?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPass: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_TOKEN = "securevote_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem(LS_TOKEN),
    user: null,
    loading: true,
  });

  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  const refreshMe = useCallback(async () => {
    if (!state.token) {
      setState((s) => ({ ...s, user: null, loading: false }));
      return;
    }
    try {
      const res = await api.get("/api/auth/me");
      setState((s) => ({ ...s, user: res.data.user, loading: false }));
    } catch {
      localStorage.removeItem(LS_TOKEN);
      setState({ token: null, user: null, loading: false });
    }
  }, [state.token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await api.post("/api/auth/login", { identifier, password });
    const token = res.data.token as string;
    localStorage.setItem(LS_TOKEN, token);
    setState({ token, user: res.data.user, loading: false });
  }, []);

  const register = useCallback(async (data: any) => {
    await api.post("/api/auth/register", data);
    // No auto-login
  }, []);

  const sendOtp = useCallback(async (email: string, type: string = "REGISTER") => {
    await api.post("/api/auth/send-otp", { email, type });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await api.post("/api/auth/forgot-password", { email });
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    await api.post("/api/auth/reset-password", { email, otp, newPassword });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    setState({ token: null, user: null, loading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, refreshMe, sendOtp, forgotPassword, resetPassword }),
    [state, login, register, logout, refreshMe, sendOtp, forgotPassword, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

