import { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  getRemotionEnvironment,
} from "remotion";
import type { MediaResolver } from "../media";

/**
 * Font tiếng Việt nạp OFFLINE từ public/fonts (Inter, Montserrat, Be Vietnam Pro,
 * Lexend, Space Grotesk) — dùng chung cho MỌI overlay của tầng lắp ráp
 * (CaptionTrack, HighlightTrack, SubtitleTrack).
 */

const LATIN_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const VIETNAMESE_RANGE =
  "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB";

export const VIETNAMESE_FONT_FAMILY = "CaptionInter";

export interface FontPresetConfig {
  id: string;
  name: string;
  family: string;
  file?: string;
  format?: string;
  weight: number;
  fallback: string;
}

export const BUILTIN_FONTS: Record<string, FontPresetConfig> = {
  inter: {
    id: "inter",
    name: "Inter",
    family: "CaptionInter",
    weight: 700,
    fallback: `'CaptionInter', 'Segoe UI', sans-serif`,
  },
  montserrat: {
    id: "montserrat",
    name: "Montserrat",
    family: "CaptionMontserrat",
    file: "fonts/montserrat-700.ttf",
    format: "truetype",
    weight: 700,
    fallback: `'CaptionMontserrat', 'CaptionInter', 'Segoe UI', sans-serif`,
  },
  bevietnampro: {
    id: "bevietnampro",
    name: "Be Vietnam Pro",
    family: "CaptionBeVietnamPro",
    file: "fonts/bevietnampro-700.ttf",
    format: "truetype",
    weight: 700,
    fallback: `'CaptionBeVietnamPro', 'CaptionInter', 'Segoe UI', sans-serif`,
  },
  lexend: {
    id: "lexend",
    name: "Lexend",
    family: "CaptionLexend",
    file: "fonts/lexend-700.ttf",
    format: "truetype",
    weight: 700,
    fallback: `'CaptionLexend', 'CaptionInter', 'Segoe UI', sans-serif`,
  },
  spacegrotesk: {
    id: "spacegrotesk",
    name: "Space Grotesk",
    family: "CaptionSpaceGrotesk",
    file: "fonts/spacegrotesk-700.ttf",
    format: "truetype",
    weight: 700,
    fallback: `'CaptionSpaceGrotesk', 'CaptionInter', 'Segoe UI', sans-serif`,
  },
};

/**
 * Trả về CSS font-family stack an toàn.
 * Mọi stack đều KẾT bằng 'CaptionInter' để phòng ngừa ký tự tiếng Việt hiếm gặp.
 */
export function resolveFontStack(fontName?: string | null): string {
  if (!fontName) return `'CaptionInter', 'Segoe UI', sans-serif`;
  const clean = fontName.toLowerCase().replace(/[^a-z]/g, "");
  if (BUILTIN_FONTS[clean]) {
    return BUILTIN_FONTS[clean].fallback;
  }
  return `'${fontName}', 'CaptionInter', 'Segoe UI', sans-serif`;
}

const WEIGHTS = [600, 700, 800] as const;

/**
 * Khối @font-face cho các overlay (Inter subset latin + vietnamese).
 */
export const vietnameseFontFaceCss = (resolve: MediaResolver): string =>
  WEIGHTS.flatMap((weight) =>
    (
      [
        ["latin", LATIN_RANGE],
        ["vietnamese", VIETNAMESE_RANGE],
      ] as const
    ).map(
      ([subset, range]) => `@font-face{
  font-family:'${VIETNAMESE_FONT_FAMILY}';
  font-style:normal;
  font-weight:${weight};
  font-display:block;
  src:url('${resolve(`fonts/inter-${subset}-${weight}.woff2`)}') format('woff2');
  unicode-range:${range};
}`
    )
  ).join('\n');

/**
 * Khối @font-face cho TẤT CẢ các font có sẵn trong hệ thống (Inter + Montserrat + Be Vietnam Pro + Lexend + Space Grotesk).
 */
export const allFontsFaceCss = (resolve: MediaResolver): string => {
  const interCss = vietnameseFontFaceCss(resolve);
  const extraCss = Object.values(BUILTIN_FONTS)
    .filter((f) => f.file)
    .map(
      (f) => `@font-face{
  font-family:'${f.family}';
  font-style:normal;
  font-weight:${f.weight};
  font-display:block;
  src:url('${resolve(f.file!)}') format('${f.format || "truetype"}');
}`
    )
    .join('\n');
  return `${interCss}\n${extraCss}`;
};

/**
 * Chặn render tới khi font thật sẵn sàng.
 */
export const useAllFonts = (activeFamily?: string): void => {
  const [handle] = useState(() => delayRender("Nạp font overlay (All Fonts)"));

  useEffect(() => {
    const promises: Promise<unknown>[] = [
      ...WEIGHTS.map((weight) =>
        document.fonts.load(
          `${weight} 60px '${VIETNAMESE_FONT_FAMILY}'`,
          "tiếng Việt đủ dấu"
        )
      ),
    ];
    if (activeFamily) {
      const clean = activeFamily.toLowerCase().replace(/[^a-z]/g, "");
      const f = BUILTIN_FONTS[clean];
      if (f?.family && f.family !== VIETNAMESE_FONT_FAMILY) {
        promises.push(
          document.fonts.load(`${f.weight} 60px '${f.family}'`, "tiếng Việt đủ dấu")
        );
      }
    }
    Promise.all(promises)
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((err: unknown) => {
        const message = `Không nạp được font overlay: ${String(err)}`;
        if (getRemotionEnvironment().isPlayer) {
          console.warn(message);
          continueRender(handle);
          return;
        }
        cancelRender(new Error(message));
      });
  }, [handle, activeFamily]);
};

export const useVietnameseFont = (): void => useAllFonts();
