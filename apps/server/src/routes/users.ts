import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { hashPassword } from "../authCrypto.js";
import {
  createUser,
  deleteUser,
  getUserById,
  getUserByUsername,
  listUsers,
  updateUser,
  type UserRole,
} from "../db.js";
import { extractSessionToken } from "./auth.js";
import { getSession } from "../db.js";

const router = Router();

const VALID_ROLES: UserRole[] = ["admin", "editor", "viewer"];

/**
 * Middleware kiểm tra quyền Admin cho toàn bộ route quản lý người dùng
 */
function requireAdmin(req: Request, res: Response, next: () => void): void {
  const token = extractSessionToken(req);
  if (!token) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập." } });
    return;
  }

  const session = getSession(token);
  if (!session || session.role !== "admin") {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Chỉ Quản trị viên (Admin) mới có quyền truy cập." },
    });
    return;
  }

  // Gắn session vào request để các route sử dụng
  (req as Request & { sessionUser?: typeof session.user }).sessionUser = session.user;
  next();
}

router.use(requireAdmin);

/**
 * GET /api/users
 * Lấy danh sách toàn bộ người dùng.
 */
router.get("/", (_req: Request, res: Response): void => {
  const users = listUsers();
  res.json({ users });
});

/**
 * POST /api/users
 * Tạo tài khoản người dùng mới.
 */
router.post("/", (req: Request, res: Response): void => {
  const { username, name, password, role } = req.body ?? {};

  if (!username || typeof username !== "string" || !username.trim()) {
    res.status(400).json({ error: { code: "INVALID_FIELD", message: "Tên đăng nhập không được để trống." } });
    return;
  }

  const cleanUsername = username.toLowerCase().trim();
  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    res.status(400).json({
      error: { code: "INVALID_FIELD", message: "Tên đăng nhập phải có từ 3 đến 30 ký tự." },
    });
    return;
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    res.status(400).json({
      error: {
        code: "INVALID_FIELD",
        message: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, gạch ngang và dấu chấm.",
      },
    });
    return;
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: { code: "INVALID_FIELD", message: "Họ tên không được để trống." } });
    return;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({
      error: { code: "INVALID_FIELD", message: "Mật khẩu phải có tối thiểu 6 ký tự." },
    });
    return;
  }

  const targetRole = (role as UserRole) || "editor";
  if (!VALID_ROLES.includes(targetRole)) {
    res.status(400).json({
      error: { code: "INVALID_FIELD", message: "Vai trò không hợp lệ (admin, editor, viewer)." },
    });
    return;
  }

  const existing = getUserByUsername(cleanUsername);
  if (existing) {
    res.status(409).json({
      error: { code: "USERNAME_TAKEN", message: "Tên đăng nhập này đã tồn tại." },
    });
    return;
  }

  const id = `usr_${crypto.randomBytes(8).toString("hex")}`;
  const passwordHash = hashPassword(password);

  const newUser = createUser({
    id,
    username: cleanUsername,
    name: name.trim(),
    passwordHash,
    role: targetRole,
    isActive: 1,
  });

  res.status(201).json({ user: newUser });
});

/**
 * PATCH /api/users/:id
 * Cập nhật thông tin tài khoản hoặc đổi mật khẩu.
 */
router.patch("/:id", (req: Request, res: Response): void => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { name, role, isActive, password } = req.body ?? {};

  const existing = getUserById(id);
  if (!existing) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Không tìm thấy người dùng." } });
    return;
  }

  const currentAdmin = (req as Request & { sessionUser?: { id: string } }).sessionUser;

  // Không cho phép tự hạ quyền của chính mình nếu là admin duy nhất
  if (currentAdmin && currentAdmin.id === id && role && role !== "admin") {
    res.status(400).json({
      error: { code: "SELF_DEMOTE", message: "Bạn không thể tự hạ quyền Admin của chính mình." },
    });
    return;
  }

  // Không cho phép tự khóa chính mình
  if (currentAdmin && currentAdmin.id === id && isActive === 0) {
    res.status(400).json({
      error: { code: "SELF_LOCK", message: "Bạn không thể tự khóa tài khoản của chính mình." },
    });
    return;
  }

  let newPasswordHash: string | undefined;
  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({
        error: { code: "INVALID_FIELD", message: "Mật khẩu mới phải có tối thiểu 6 ký tự." },
      });
      return;
    }
    newPasswordHash = hashPassword(password);
  }

  let targetRole: UserRole | undefined;
  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) {
      res.status(400).json({
        error: { code: "INVALID_FIELD", message: "Vai trò không hợp lệ (admin, editor, viewer)." },
      });
      return;
    }
    targetRole = role;
  }

  const updated = updateUser(id, {
    name: typeof name === "string" ? name : undefined,
    role: targetRole,
    isActive: typeof isActive === "number" ? isActive : undefined,
    passwordHash: newPasswordHash,
  });

  res.json({ user: updated });
});

/**
 * DELETE /api/users/:id
 * Xóa tài khoản người dùng.
 */
router.delete("/:id", (req: Request, res: Response): void => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const currentAdmin = (req as Request & { sessionUser?: { id: string } }).sessionUser;

  if (currentAdmin && currentAdmin.id === id) {
    res.status(400).json({
      error: { code: "SELF_DELETE", message: "Bạn không thể xóa tài khoản của chính mình." },
    });
    return;
  }

  const existing = getUserById(id);
  if (!existing) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Không tìm thấy người dùng." } });
    return;
  }

  deleteUser(id);
  res.json({ ok: true });
});

export default router;
