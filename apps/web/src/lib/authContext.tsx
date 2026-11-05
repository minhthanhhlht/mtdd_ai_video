"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  type UserInfo,
  type UserRole,
} from "./api";

const SESSION_TOKEN_KEY = "aiev_session_token";

interface AuthContextValue {
  user: UserInfo | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  canEdit: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<UserInfo>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        try {
          window.localStorage.removeItem(SESSION_TOKEN_KEY);
        } catch {
          /* ignore */
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (username: string, password: string, rememberMe = false): Promise<UserInfo> => {
      const res = await apiLogin({ username, password, rememberMe });
      if (res.ok && res.user) {
        try {
          window.localStorage.setItem(SESSION_TOKEN_KEY, res.token);
        } catch {
          /* ignore */
        }
        setUser(res.user);
        return res.user;
      }
      throw new Error("Đăng nhập không thành công.");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    } finally {
      try {
        window.localStorage.removeItem(SESSION_TOKEN_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
    }
  }, []);

  const role = user?.role ?? null;
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const isViewer = role === "viewer";
  const canEdit = isAdmin || isEditor;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      isAdmin,
      isEditor,
      isViewer,
      canEdit,
      login,
      logout,
      refreshUser,
    }),
    [user, role, loading, isAdmin, isEditor, isViewer, canEdit, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

