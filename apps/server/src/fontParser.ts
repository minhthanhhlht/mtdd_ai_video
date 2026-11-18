import path from "node:path";

export type FontFormat = "truetype" | "opentype" | "woff" | "woff2";

export interface ParsedFontMeta {
  id: string;
  name: string;
  family: string;
  format: FontFormat;
  weight: number;
}

/**
 * Kiểm tra magic bytes ở đầu file để phát hiện định dạng font thực tế.
 * Tuyệt đối không tin tưởng extension do client gửi.
 */
export function detectFontFormat(buffer: Buffer): FontFormat | null {
  if (buffer.length < 12) return null;

  const b0 = buffer[0];
  const b1 = buffer[1];
  const b2 = buffer[2];
  const b3 = buffer[3];

  // TTF: 0x00010000 hoặc 'true' (0x74727565)
  if ((b0 === 0x00 && b1 === 0x01 && b2 === 0x00 && b3 === 0x00) ||
      (b0 === 0x74 && b1 === 0x72 && b2 === 0x75 && b3 === 0x65)) {
    return "truetype";
  }

  // OTF: 'OTTO' (0x4F54544F)
  if (b0 === 0x4f && b1 === 0x54 && b2 === 0x54 && b3 === 0x4f) {
    return "opentype";
  }

  // WOFF: 'wOFF' (0x774F4646)
  if (b0 === 0x77 && b1 === 0x4f && b2 === 0x46 && b3 === 0x46) {
    return "woff";
  }

  // WOFF2: 'wOF2' (0x774F4632)
  if (b0 === 0x77 && b1 === 0x4f && b2 === 0x46 && b3 === 0x32) {
    return "woff2";
  }

  return null;
}

function decodeUtf16BE(buf: Buffer): string {
  let str = "";
  for (let i = 0; i < buf.length - 1; i += 2) {
    const code = buf.readUInt16BE(i);
    if (code !== 0) {
      str += String.fromCharCode(code);
    }
  }
  return str.trim();
}

/**
 * Phân tích binary header của TTF/OTF để lấy Name table và OS/2 weight.
 * Zero-dependency, cực nhẹ và an toàn.
 */
export function parseFontBuffer(buffer: Buffer, originalFilename: string): ParsedFontMeta {
  const format = detectFontFormat(buffer);
  if (!format) {
    throw new Error("File tải lên không phải là phông chữ hợp lệ (chỉ hỗ trợ TTF, OTF, WOFF, WOFF2).");
  }

  let fontName = "";
  let familyName = "";
  let weight = 400;

  // Với TTF và OTF, bảng SFNT nằm ngay ở đầu file
  if (format === "truetype" || format === "opentype") {
    try {
      const numTables = buffer.readUInt16BE(4);
      let nameTableOffset = 0;
      let os2TableOffset = 0;

      for (let i = 0; i < numTables; i++) {
        const offset = 12 + i * 16;
        if (offset + 16 > buffer.length) break;
        const tag = buffer.toString("utf8", offset, offset + 4);
        if (tag === "name") {
          nameTableOffset = buffer.readUInt32BE(offset + 8);
        } else if (tag === "OS/2") {
          os2TableOffset = buffer.readUInt32BE(offset + 8);
        }
      }

      // Đọc bảng name
      if (nameTableOffset > 0 && nameTableOffset + 6 <= buffer.length) {
        const count = buffer.readUInt16BE(nameTableOffset + 2);
        const stringOffset = buffer.readUInt16BE(nameTableOffset + 4);
        const storageOffset = nameTableOffset + stringOffset;

        const names: Record<number, string> = {};

        for (let i = 0; i < count; i++) {
          const recOffset = nameTableOffset + 6 + i * 12;
          if (recOffset + 12 > buffer.length) break;

          const platformID = buffer.readUInt16BE(recOffset);
          const nameID = buffer.readUInt16BE(recOffset + 6);
          const length = buffer.readUInt16BE(recOffset + 8);
          const offset = buffer.readUInt16BE(recOffset + 10);

          const strStart = storageOffset + offset;
          const strEnd = strStart + length;
          if (strEnd <= buffer.length) {
            const strBuf = buffer.slice(strStart, strEnd);
            let val = "";
            if (platformID === 3 || platformID === 0) {
              val = decodeUtf16BE(strBuf);
            } else {
              val = strBuf.toString("utf8").replace(/\0/g, "").trim();
            }
            if (val && !names[nameID]) {
              names[nameID] = val;
            }
          }
        }

        // Name ID 4 = Full Name, Name ID 1 = Font Family
        fontName = names[4] || names[1] || "";
        familyName = names[1] || fontName;
      }

      // Đọc trọng lượng từ OS/2
      if (os2TableOffset > 0 && os2TableOffset + 6 <= buffer.length) {
        const usWeightClass = buffer.readUInt16BE(os2TableOffset + 4);
        if (usWeightClass >= 100 && usWeightClass <= 900) {
          weight = usWeightClass;
        }
      }
    } catch (err) {
      console.warn("[fontParser] Lỗi khi đọc bảng TTF/OTF:", err);
    }
  }

  // Fallback từ filename nếu không đọc được từ binary header
  const baseFilename = path.basename(originalFilename, path.extname(originalFilename));
  if (!fontName) {
    fontName = baseFilename
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (weight === 400) {
    const lower = (fontName + " " + baseFilename).toLowerCase();
    if (lower.includes("black") || lower.includes("900")) weight = 900;
    else if (lower.includes("extrabold") || lower.includes("800")) weight = 800;
    else if (lower.includes("bold") || lower.includes("700")) weight = 700;
    else if (lower.includes("semibold") || lower.includes("600")) weight = 600;
    else if (lower.includes("medium") || lower.includes("500")) weight = 500;
    else if (lower.includes("light") || lower.includes("300")) weight = 300;
    else if (lower.includes("thin") || lower.includes("100")) weight = 100;
  }

  // Tạo id chuẩn kebab-case
  const cleanId = (familyName || fontName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Tạo family CSS PascalCase: Caption<Name>
  const cleanPascal = (familyName || fontName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  return {
    id: cleanId || "custom-font",
    name: fontName,
    family: `Caption${cleanPascal || "Custom"}`,
    format,
    weight,
  };
}
