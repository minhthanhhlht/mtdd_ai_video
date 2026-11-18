"use client";

import { useFonts } from "../lib/fonts";

/**
 * Tự động chèn các quy tắc @font-face cho toàn bộ phông chữ (cả builtin lẫn custom tải lên)
 * vào tài liệu web để trình duyệt và khung xem trước (Remotion / Canvas) có thể render ngay tức thì.
 */
export function DynamicFontStyles() {
  const { fonts } = useFonts();

  // Chỉ cần sinh cho các font tùy chỉnh (hoặc font có file cụ thể)
  const customFonts = fonts.filter((f) => !f.isBuiltin && f.file);

  if (customFonts.length === 0) return null;

  const cssRules = customFonts
    .map((f) => {
      const url = f.file.startsWith("/") ? f.file : `/${f.file}`;
      const format = f.format || "truetype";
      const weight = f.weight === 400 ? "100 900" : f.weight;
      return `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('${url}') format('${format}');
}`;
    })
    .join("\n\n");

  return <style dangerouslySetInnerHTML={{ __html: cssRules }} />;
}
