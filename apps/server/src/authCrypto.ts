import crypto from "node:crypto";

/**
 * Băm mật khẩu bằng scrypt với salt ngẫu nhiên 16 bytes.
 * Định dạng lưu trữ: `scrypt:<saltHex>:<hashHex>`
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/**
 * Kiểm tra mật khẩu khớp với chuỗi băm đã lưu hay không.
 * Sử dụng timingSafeEqual để chống lại tấn công dò thời gian (timing attacks).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, expectedHash] = parts;
    const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
    const actualBuf = Buffer.from(actualHash, "hex");
    const expectedBuf = Buffer.from(expectedHash, "hex");
    if (actualBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Sinh token ngẫu nhiên bảo mật 64 ký tự hex (32 bytes entropy).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
