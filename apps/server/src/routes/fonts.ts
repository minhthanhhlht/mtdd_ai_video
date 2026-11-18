import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { paths } from "../config.js";
import { detectFontFormat, parseFontBuffer, type FontFormat } from "../fontParser.js";
import { HttpError, ensureDir, sanitizeFileName } from "../util.js";

export interface FontEntry {
  id: string;
  name: string;
  family: string;
  file: string;
  format: FontFormat;
  weight: number;
  isBuiltin: boolean;
  uploadedAt?: string;
  fileSize?: number;
}

const router = Router();

const libraryPath = () => path.join(paths.fontsDir, "library.json");

export function readFontLibrary(): FontEntry[] {
  try {
    const raw = JSON.parse(fs.readFileSync(libraryPath(), "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
      .map((e) => ({
        id: typeof e.id === "string" ? e.id : "",
        name: typeof e.name === "string" ? e.name : "",
        family: typeof e.family === "string" ? e.family : "",
        file: typeof e.file === "string" ? e.file : "",
        format: (typeof e.format === "string" ? e.format : "truetype") as FontFormat,
        weight: typeof e.weight === "number" ? e.weight : 400,
        isBuiltin: Boolean(e.isBuiltin),
        uploadedAt: typeof e.uploadedAt === "string" ? e.uploadedAt : undefined,
        fileSize: typeof e.fileSize === "number" ? e.fileSize : undefined,
      }))
      .filter((e) => e.id && e.file);
  } catch {
    return [];
  }
}

export function writeFontLibrary(entries: FontEntry[]): void {
  ensureDir(paths.fontsDir);
  fs.writeFileSync(libraryPath(), JSON.stringify(entries, null, 2) + "\n", "utf8");

  // Đồng bộ danh sách custom fonts sang engines/remotion/src/customFonts.json
  try {
    const customFonts = entries.filter((e) => !e.isBuiltin);
    fs.writeFileSync(
      paths.remotionCustomFontsJson,
      JSON.stringify(customFonts, null, 2) + "\n",
      "utf8",
    );
  } catch (err) {
    console.warn("[fonts] Không thể đồng bộ sang remotionCustomFontsJson:", err);
  }
}

// Giới hạn upload font tối đa 15MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  defParamCharset: "utf8",
});

// GET /api/fonts - Lấy danh sách toàn bộ phông chữ khả dụng
router.get("/", (_req, res) => {
  const entries = readFontLibrary();
  res.json(entries);
});

// POST /api/fonts - Tải lên file font mới (.ttf, .otf, .woff, .woff2)
router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new HttpError(400, "FILE_REQUIRED", "Vui lòng chọn file phông chữ để tải lên (field `file`).");
  }

  // 1. Kiểm tra magic bytes an toàn (RULE 10)
  const format = detectFontFormat(file.buffer);
  if (!format) {
    throw new HttpError(
      400,
      "INVALID_FONT_FORMAT",
      "Định dạng font không hợp lệ. Chỉ chấp nhận các file phông chữ chuẩn: .ttf, .otf, .woff, .woff2.",
    );
  }

  // 2. Phân tích metadata
  const originalName = sanitizeFileName(file.originalname);
  const parsed = parseFontBuffer(file.buffer, originalName);

  const customName = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const finalName = customName || parsed.name;

  // 3. Đảm bảo ID là duy nhất và an toàn
  const existing = readFontLibrary();
  let finalId = parsed.id;
  let counter = 2;
  while (existing.some((e) => e.id === finalId)) {
    finalId = `${parsed.id}-${counter++}`;
  }

  // 4. Xác định tên file lưu trữ trên đĩa
  const ext = format === "truetype" ? ".ttf" : format === "opentype" ? ".otf" : format === "woff2" ? ".woff2" : ".woff";
  const safeDiskName = `${finalId}${ext}`;

  // 5. Lưu vào assets/fonts/
  ensureDir(paths.fontsDir);
  const destPath = path.join(paths.fontsDir, safeDiskName);
  fs.writeFileSync(destPath, file.buffer);

  // 6. Tự động đồng bộ sang apps/web/public/fonts/ và engines/remotion/public/fonts/
  try {
    ensureDir(paths.webFontsDir);
    fs.writeFileSync(path.join(paths.webFontsDir, safeDiskName), file.buffer);
  } catch (err) {
    console.warn("[fonts] Không thể đồng bộ sang webFontsDir:", err);
  }

  try {
    ensureDir(paths.remotionFontsDir);
    fs.writeFileSync(path.join(paths.remotionFontsDir, safeDiskName), file.buffer);
  } catch (err) {
    console.warn("[fonts] Không thể đồng bộ sang remotionFontsDir:", err);
  }

  // 7. Cập nhật library.json
  const newEntry: FontEntry = {
    id: finalId,
    name: finalName,
    family: parsed.family,
    file: `fonts/${safeDiskName}`,
    format,
    weight: parsed.weight,
    isBuiltin: false,
    uploadedAt: new Date().toISOString(),
    fileSize: file.size,
  };

  existing.push(newEntry);
  writeFontLibrary(existing);

  res.status(201).json(newEntry);
});

// DELETE /api/fonts/:id - Xóa phông chữ tùy chỉnh
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existing = readFontLibrary();
  const font = existing.find((e) => e.id === id);

  if (!font) {
    throw new HttpError(404, "FONT_NOT_FOUND", `Không tìm thấy phông chữ với id '${id}'.`);
  }

  if (font.isBuiltin) {
    throw new HttpError(
      400,
      "CANNOT_DELETE_BUILTIN",
      `Không thể xóa phông chữ mặc định của hệ thống ('${font.name}').`,
    );
  }

  // Xóa khỏi metadata
  const updated = existing.filter((e) => e.id !== id);
  writeFontLibrary(updated);

  // Xóa file vật lý nếu có
  const safeBase = path.basename(font.file);
  const pathsToDelete = [
    path.join(paths.fontsDir, safeBase),
    path.join(paths.webFontsDir, safeBase),
    path.join(paths.remotionFontsDir, safeBase),
  ];

  for (const p of pathsToDelete) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (err) {
      console.warn(`[fonts] Không thể xóa file ${p}:`, err);
    }
  }

  res.json({ ok: true, id });
});

export default router;
