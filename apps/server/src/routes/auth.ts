import { Router, type CookieOptions, type Request, type Response } from "express";
import { generateSessionToken, verifyPassword } from "../authCrypto.js";
import {
  createSession,
  deleteSession,
  getSession,
  getUserByUsername,
  touchSession,
  type SafeUser,
} from "../db.js";
import { cookieValue } from "../util.js";
import { apiToken } from "../config.js";

const router = Router();

export const USER_SESSION_COOKIE = "aiev_user_session";

/** Thời hạn phiên: Ghi nhớ = 30 ngày, Không ghi nhớ = 24 giờ */
const DURATION_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
const DURATION_DEFAULT_MS = 24 * 60 * 60 * 1000;

function isSecureRequest(req: Request): boolean {
  return (
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    req.headers["cf-visitor"]?.toString().includes('"scheme":"https"') === true
  );
}

export function extractSessionToken(req: Request): string | null {
  // 1. Kiểm tra cookie
  const fromCookie = cookieValue(req, USER_SESSION_COOKIE);
  if (fromCookie) return fromCookie;

  // 2. Kiểm tra header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  // 3. Header tùy chỉnh
  const customHeader = req.headers["x-user-session"];
  if (typeof customHeader === "string" && customHeader.trim()) {
    return customHeader.trim();
  }

  return null;
}

/**
 * POST /api/auth/login
 * Đăng nhập người dùng bằng username và password.
 */
router.post("/login", (req: Request, res: Response): void => {
  const { username, password, rememberMe } = req.body ?? {};

  if (!username || typeof username !== "string" || !password || typeof password !== "string") {
    res.status(400).json({
      error: { code: "INVALID_CREDENTIALS", message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." },
    });
    return;
  }

  const user = getUserByUsername(username);
  if (!user) {
    res.status(401).json({
      error: { code: "AUTH_FAILED", message: "Tên đăng nhập hoặc mật khẩu không chính xác." },
    });
    return;
  }

  if (user.isActive !== 1) {
    res.status(403).json({
      error: { code: "USER_LOCKED", message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." },
    });
    return;
  }

  const isMatch = verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({
      error: { code: "AUTH_FAILED", message: "Tên đăng nhập hoặc mật khẩu không chính xác." },
    });
    return;
  }

  const shouldRemember = Boolean(rememberMe);
  const maxAge = shouldRemember ? DURATION_REMEMBER_MS : DURATION_DEFAULT_MS;
  const expiresAt = new Date(Date.now() + maxAge).toISOString();
  const token = generateSessionToken();

  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  createSession({
    token,
    userId: user.id,
    role: user.role,
    rememberMe: shouldRemember,
    expiresAt,
    ip,
    userAgent,
  });

  const secure = isSecureRequest(req);

  // Set cookie phiên user:
  // - Nếu có tích Ghi nhớ: cookie sống 30 ngày (maxAge).
  // - Nếu không tích: cookie phiên (Session Cookie), trình duyệt tự hủy khi đóng tab/trình duyệt.
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...(shouldRemember ? { maxAge: DURATION_REMEMBER_MS } : {}),
  };

  res.cookie(USER_SESSION_COOKIE, token, cookieOptions);
  res.cookie("aiev_token", apiToken(), cookieOptions);

  const safeUser: SafeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.json({
    ok: true,
    user: safeUser,
    token,
    expiresAt,
  });
});

/**
 * POST /api/auth/logout
 * Đăng xuất người dùng, hủy phiên đăng nhập.
 */
router.post("/logout", (req: Request, res: Response): void => {
  const token = extractSessionToken(req);
  if (token) {
    deleteSession(token);
  }

  res.clearCookie(USER_SESSION_COOKIE, { path: "/" });
  res.clearCookie("aiev_token", { path: "/" });

  res.json({ ok: true });
});

/**
 * GET /api/auth/me
 * Lấy thông tin tài khoản hiện đang đăng nhập.
 */
router.get("/me", (req: Request, res: Response): void => {
  const token = extractSessionToken(req);
  if (!token) {
    res.json({ authenticated: false, user: null });
    return;
  }

  const session = getSession(token);
  if (!session) {
    res.clearCookie(USER_SESSION_COOKIE, { path: "/" });
    res.json({ authenticated: false, user: null });
    return;
  }

  // Cập nhật hoạt động lần cuối
  touchSession(token);

  res.json({
    authenticated: true,
    user: session.user,
    role: session.role,
  });
});

export default router;

