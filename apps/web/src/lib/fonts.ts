"use client";

import { useEffect, useState, useCallback } from "react";
import { getFonts, uploadFont, deleteFont, type FontEntry } from "./api";

export type { FontEntry };

export const DEFAULT_BUILTIN_FONTS: FontEntry[] = [
  {
    id: "inter",
    name: "Inter (Mặc định)",
    family: "CaptionInter",
    file: "fonts/inter-vietnamese-700.woff2",
    format: "woff2",
    weight: 700,
    isBuiltin: true,
  },
  {
    id: "montserrat",
    name: "Montserrat (Đậm nét)",
    family: "CaptionMontserrat",
    file: "fonts/montserrat-700.ttf",
    format: "truetype",
    weight: 700,
    isBuiltin: true,
  },
  {
    id: "bevietnampro",
    name: "Be Vietnam Pro (Chuẩn Việt)",
    family: "CaptionBeVietnamPro",
    file: "fonts/bevietnampro-700.ttf",
    format: "truetype",
    weight: 700,
    isBuiltin: true,
  },
  {
    id: "lexend",
    name: "Lexend (Dễ đọc)",
    family: "CaptionLexend",
    file: "fonts/lexend-700.ttf",
    format: "truetype",
    weight: 700,
    isBuiltin: true,
  },
  {
    id: "spacegrotesk",
    name: "Space Grotesk (Công nghệ)",
    family: "CaptionSpaceGrotesk",
    file: "fonts/spacegrotesk-700.ttf",
    format: "truetype",
    weight: 700,
    isBuiltin: true,
  },
  {
    id: "hltsneakerscript",
    name: "HLT Sneaker Script (Viết tay)",
    family: "CaptionHltSneakerScript",
    file: "fonts/hlt-sneaker-script.ttf",
    format: "truetype",
    weight: 400,
    isBuiltin: true,
  },
];

let globalFontsCache: FontEntry[] = [...DEFAULT_BUILTIN_FONTS];
let listeners: Array<(fonts: FontEntry[]) => void> = [];

function notifyListeners(fonts: FontEntry[]) {
  globalFontsCache = fonts;
  for (const listener of listeners) {
    listener(fonts);
  }
}

export function useFonts() {
  const [fonts, setFonts] = useState<FontEntry[]>(globalFontsCache);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getFonts();
      if (Array.isArray(list) && list.length > 0) {
        notifyListeners(list);
      }
    } catch (err) {
      console.warn("[useFonts] Không tải được danh sách font:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.push(setFonts);
    // Tự động fetch lần đầu nếu chỉ có builtin
    if (globalFontsCache.length <= DEFAULT_BUILTIN_FONTS.length) {
      refresh();
    }
    return () => {
      listeners = listeners.filter((l) => l !== setFonts);
    };
  }, [refresh]);

  const add = useCallback(
    async (file: File, name?: string) => {
      const created = await uploadFont(file, name);
      const updated = [...globalFontsCache.filter((f) => f.id !== created.id), created];
      notifyListeners(updated);
      return created;
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteFont(id);
      const updated = globalFontsCache.filter((f) => f.id !== id);
      notifyListeners(updated);
    },
    []
  );

  return {
    fonts,
    loading,
    error,
    refresh,
    addFont: add,
    removeFont: remove,
  };
}
