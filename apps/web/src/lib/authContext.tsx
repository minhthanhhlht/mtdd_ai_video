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
const USER_INFO_KEY = "aiev_user_info";

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

function getInitialUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(USER_INFO_KEY) ||
      window.sessionStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserInfo;
    if (parsed && typeof parsed.id === "string") return parsed;
  } catch {}
  return null;
}

function hasSessionToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(
      window.localStorage.getItem(SESSION_TOKEN_KEY) ||
      window.sessionStorage.getItem(SESSION_TOKEN_KEY)
    );
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(getInitialUser);
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const hasToken = hasSessionToken();
    const initialUser = getInitialUser();
    // Nếu có cả token và thông tin user đã lưu: render ngay lập tức không bị chớp hay chặn màn hình
    if (hasToken && initialUser) return false;
    // Nếu không có token nào: chắc chắn chưa đăng nhập, không cần loading
    if (!hasToken) return false;
    // Có token nhưng chưa có cache thông tin user: loading true để tải lần đầu
    return true;
  });

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!hasSessionToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Giới hạn timeout 6 giây để không bao giờ bị treo vô tận
      const fetchPromise = getMe();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AUTH_TIMEOUT")), 6000)
      );
      const res = await Promise.race([fetchPromise, timeoutPromise]);

      if (res.authenticated && res.user) {
        setUser(res.user);
        try {
          if (window.localStorage.getItem(SESSION_TOKEN_KEY)) {
            window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(res.user));
          } else {
            window.sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(res.user));
          }
        } catch {}
      } else {
        setUser(null);
        try {
          window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
          window.sessionStorage.removeItem(USER_INFO_KEY);
          window.localStorage.removeItem(SESSION_TOKEN_KEY);
          window.localStorage.removeItem(USER_INFO_KEY);
        } catch {}
      }
    } catch {
      // Mất mạng tạm thời hoặc timeout: nếu đã có cached user thì giữ nguyên để không văng ra ngoài
      if (!getInitialUser()) {
        setUser(null);
      }
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
          const storage = rememberMe ? window.localStorage : window.sessionStorage;
          const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

          storage.setItem(SESSION_TOKEN_KEY, res.token);
          storage.setItem(USER_INFO_KEY, JSON.stringify(res.user));

          otherStorage.removeItem(SESSION_TOKEN_KEY);
          otherStorage.removeItem(USER_INFO_KEY);
        } catch {}
        setUser(res.user);
        setLoading(false);
        return res.user;
      }
      throw new Error("Đăng nhập không thành công.");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {}
    finally {
      try {
        window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
        window.sessionStorage.removeItem(USER_INFO_KEY);
        window.localStorage.removeItem(SESSION_TOKEN_KEY);
        window.localStorage.removeItem(USER_INFO_KEY);
      } catch {}
      setUser(null);
      setLoading(false);
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

