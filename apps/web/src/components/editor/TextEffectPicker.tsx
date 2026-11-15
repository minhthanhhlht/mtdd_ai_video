"use client";

import React, { useEffect, useId, useState } from "react";
import { Check, Pause, Play, RotateCcw, Sparkles, Type } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { IconButton } from "@/components/IconButton";
import { Panel } from "@/components/Panel";
import { Segmented } from "@/components/Segmented";
import { useT } from "@/lib/i18n";
import { useEditor } from "./EditorContext";
import { NumberField } from "./fields";
import { setCaptionStyle } from "./ops";
import type { CaptionPreset, Timeline } from "@/lib/api";

export interface TextEffectPickerProps {
  timeline: Timeline;
  idPrefix?: string;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const BUILTIN_FONT_OPTIONS: readonly FontOption[] = [
  { id: "inter", name: "Inter (Mặc định)", family: "'CaptionInter', 'Segoe UI', sans-serif" },
  { id: "montserrat", name: "Montserrat (Đậm nét)", family: "'CaptionMontserrat', 'CaptionInter', sans-serif" },
  { id: "bevietnampro", name: "Be Vietnam Pro (Chuẩn Việt)", family: "'CaptionBeVietnamPro', 'CaptionInter', sans-serif" },
  { id: "lexend", name: "Lexend (Dễ đọc)", family: "'CaptionLexend', 'CaptionInter', sans-serif" },
  { id: "spacegrotesk", name: "Space Grotesk (Công nghệ)", family: "'CaptionSpaceGrotesk', 'CaptionInter', sans-serif" },
];

export interface PresetCardInfo {
  id: CaptionPreset;
  titleKey: string;
  descKey: string;
}

const PRESET_CARDS: readonly PresetCardInfo[] = [
  {
    id: "default",
    titleKey: "editor.caption.preset.default",
    descKey: "editor.caption.preset.default-desc",
  },
  {
    id: "capcut-spring-pop",
    titleKey: "editor.caption.preset.spring-pop",
    descKey: "editor.caption.preset.spring-pop-desc",
  },
  {
    id: "capcut-moving-pill",
    titleKey: "editor.caption.preset.moving-pill",
    descKey: "editor.caption.preset.moving-pill-desc",
  },
  {
    id: "capcut-karaoke-sweep",
    titleKey: "editor.caption.preset.karaoke-sweep",
    descKey: "editor.caption.preset.karaoke-sweep-desc",
  },
  {
    id: "capcut-stroke-solid",
    titleKey: "editor.caption.preset.stroke-solid",
    descKey: "editor.caption.preset.stroke-solid-desc",
  },
  {
    id: "capcut-neon-flash",
    titleKey: "editor.caption.preset.neon-flash",
    descKey: "editor.caption.preset.neon-flash-desc",
  },
];

const QUICK_TEST_PHRASES = [
  "Khám phá video AI đỉnh cao cùng Noti.vn",
  "Ăn cơm trưa, uống trà sữa phố Huế",
  "Phát triển ứng dụng truyền hình số đa nền tảng",
  "Hiệu ứng chữ CapCut chuyên nghiệp",
];

const COLOR_SWATCHES = [
  { label: "Cyan", value: "#19c8ff" },
  { label: "Blue", value: "#2563eb" },
  { label: "Yellow", value: "#ffea00" },
  { label: "Pink", value: "#ff4081" },
  { label: "Green", value: "#00e676" },
  { label: "White", value: "#ffffff" },
];

export function TextEffectPicker({ timeline, idPrefix }: TextEffectPickerProps) {
  const { t } = useT();
  const { edit, vertical } = useEditor();
  const baseId = useId();
  const id = idPrefix ?? baseId;

  const style = timeline.captionStyle ?? {};
  const currentPreset: CaptionPreset = (style.preset as CaptionPreset) ?? "default";
  const currentFont = typeof style.fontFamily === "string" ? style.fontFamily : "inter";

  const activeColor = style.activeColor ?? "#19c8ff";
  const keywordColor = style.keywordColor ?? "#ffcf4d";
  const idleColor = style.idleColor ?? "rgba(255,255,255,0.92)";

  // Playground state
  const [sampleText, setSampleText] = useState(QUICK_TEST_PHRASES[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  const words = sampleText.trim().split(/\s+/).filter(Boolean);

  // Auto-play animation timer for playground
  useEffect(() => {
    if (!isPlaying || words.length === 0) return;
    const interval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % words.length);
    }, 420);
    return () => clearInterval(interval);
  }, [isPlaying, words.length]);

  const selectedFontObj =
    BUILTIN_FONT_OPTIONS.find((f) => f.id === currentFont) ?? BUILTIN_FONT_OPTIONS[0];

  const handleSelectPreset = (preset: CaptionPreset) => {
    edit((tl) => setCaptionStyle(tl, { preset }));
  };

  const handleSelectFont = (fontId: string) => {
    edit((tl) => setCaptionStyle(tl, { fontFamily: fontId }));
  };

  const handleReset = () => {
    edit((tl) => setCaptionStyle(tl, null));
  };

  // Render a simulated word for preview cards & playground
  const renderSimulatedWord = (
    word: string,
    isActive: boolean,
    isKeyword: boolean,
    preset: CaptionPreset
  ) => {
    const fontStack = selectedFontObj.family;

    if (preset === "capcut-spring-pop") {
      return (
        <span
          key={word}
          style={{
            fontFamily: fontStack,
            color: isActive ? (isKeyword ? keywordColor : activeColor) : (isKeyword ? keywordColor : idleColor),
            WebkitTextStroke: "1px rgba(0,0,0,0.85)",
            filter: isActive
              ? `drop-shadow(0 4px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 12px ${activeColor})`
              : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
            transform: isActive ? "scale(1.15)" : "scale(1)",
            transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            display: "inline-block",
            margin: "0 0.18em",
            fontWeight: 800,
          }}
        >
          {word}
        </span>
      );
    }

    if (preset === "capcut-moving-pill") {
      return (
        <span
          key={word}
          style={{
            fontFamily: fontStack,
            backgroundColor: isActive ? (isKeyword ? keywordColor : activeColor) : "transparent",
            color: isActive ? (isKeyword ? "#000000" : "#ffffff") : (isKeyword ? keywordColor : idleColor),
            borderRadius: "9999px",
            padding: "0.06em 0.3em",
            margin: "0 0.14em",
            transform: isActive ? "scale(1.06)" : "scale(1)",
            boxShadow: isActive
              ? `0 4px 12px ${isKeyword ? "rgba(255,207,77,0.5)" : "rgba(37,99,235,0.4)"}`
              : "none",
            transition: "all 0.15s ease",
            display: "inline-block",
            fontWeight: 700,
          }}
        >
          {word}
        </span>
      );
    }

    if (preset === "capcut-karaoke-sweep") {
      return (
        <span
          key={word}
          style={{
            fontFamily: fontStack,
            color: isActive ? activeColor : (isKeyword ? keywordColor : idleColor),
            display: "inline-block",
            margin: "0 0.18em",
            fontWeight: 700,
            filter: isActive ? `drop-shadow(0 0 10px ${activeColor})` : "none",
            transform: isActive ? "scale(1.08)" : "scale(1)",
            transition: "all 0.15s ease",
          }}
        >
          {word}
        </span>
      );
    }

    if (preset === "capcut-stroke-solid") {
      return (
        <span
          key={word}
          style={{
            fontFamily: fontStack,
            color: isActive ? (isKeyword ? keywordColor : activeColor) : "transparent",
            WebkitTextStroke: isActive ? "1px rgba(0,0,0,0.8)" : `1.5px ${activeColor}`,
            display: "inline-block",
            margin: "0 0.18em",
            fontWeight: 800,
            transform: isActive ? "scale(1.1)" : "scale(1)",
            transition: "all 0.15s ease",
          }}
        >
          {word}
        </span>
      );
    }

    if (preset === "capcut-neon-flash") {
      return (
        <span
          key={word}
          style={{
            fontFamily: fontStack,
            color: isActive ? "#ffffff" : (isKeyword ? keywordColor : idleColor),
            filter: isActive
              ? `drop-shadow(0 0 8px ${activeColor}) drop-shadow(0 0 18px ${activeColor})`
              : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
            display: "inline-block",
            margin: "0 0.18em",
            fontWeight: 800,
            transform: isActive ? "scale(1.12)" : "scale(1)",
            transition: "all 0.12s ease",
          }}
        >
          {word}
        </span>
      );
    }

    // Default
    return (
      <span
        key={word}
        style={{
          fontFamily: fontStack,
          color: isActive ? (isKeyword ? keywordColor : activeColor) : (isKeyword ? keywordColor : idleColor),
          filter: isActive
            ? `drop-shadow(0 0 16px ${isKeyword ? "rgba(255,190,70,0.5)" : "rgba(25,200,255,0.55)"})`
            : "none",
          transform: isActive ? "scale(1.1)" : "scale(1)",
          transition: "all 0.15s ease",
          display: "inline-block",
          margin: "0 0.18em",
          fontWeight: 700,
        }}
      >
        {word}
      </span>
    );
  };

  return (
    <Panel
      title={t("editor.caption.style")}
      actions={
        timeline.captionStyle ? (
          <Button variant="secondary" small onClick={handleReset}>
            <RotateCcw size={14} strokeWidth={2} />
            {t("editor.caption.style-reset")}
          </Button>
        ) : undefined
      }
    >
      <p className="text-meta text-[var(--text-muted)]">{t("editor.caption.style-hint")}</p>

      {/* 1. Chọn Font chữ tiếng Việt */}
      <Field label={t("editor.caption.font")} htmlFor={`${id}-font`}>
        <div className="flex flex-col gap-2">
          <select
            id={`${id}-font`}
            className="input"
            value={currentFont}
            onChange={(e) => handleSelectFont(e.target.value)}
          >
            {BUILTIN_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <div
            className="p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-sm flex items-center justify-between"
            style={{ fontFamily: selectedFontObj.family }}
          >
            <span className="font-bold">
              Aa Bb Cc Đđ Ưư Ơơ 123 (Font: {selectedFontObj.name})
            </span>
            <Badge tone="muted" label="700 Bold" dot={false} />
          </div>
        </div>
      </Field>

      {/* 2. Chọn Preset Hiệu ứng CapCut */}
      <Field label={t("editor.caption.preset")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
          {PRESET_CARDS.map((card) => {
            const isSelected = currentPreset === card.id;
            return (
              <button
                key={card.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectPreset(card.id)}
                className={`p-3 rounded-[var(--radius)] border text-left transition-all relative flex flex-col gap-2 cursor-pointer ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-1 ring-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary-hover)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--text)] flex items-center gap-1">
                    {t(card.titleKey)}
                  </span>
                  {isSelected && (
                    <Badge tone="success" label={<Check size={12} strokeWidth={2.5} />} dot={false} />
                  )}
                </div>

                <p className="text-meta text-[var(--text-muted)] leading-tight">
                  {t(card.descKey)}
                </p>

                {/* Mini animated preview box */}
                <div className="mt-1 p-2 rounded-[var(--radius)] bg-[rgba(15,20,30,0.92)] text-center overflow-hidden flex items-center justify-center min-h-[44px]">
                  {["Khám", "phá", "video"].map((w, i) =>
                    renderSimulatedWord(
                      w,
                      isPlaying ? activeWordIdx % 3 === i : i === 1,
                      i === 1,
                      card.id
                    )
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      {/* 3. Text Playground: Thử nghiệm chữ mẫu tiếng Việt có dấu */}
      <div className="p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={2} className="text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--text)]">
              {t("editor.caption.preview-title")}
            </span>
          </div>
          <Button
            variant="secondary"
            small
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <>
                <Pause size={14} strokeWidth={2} />
                {t("editor.caption.preview-pause")}
              </>
            ) : (
              <>
                <Play size={14} strokeWidth={2} />
                {t("editor.caption.preview-play")}
              </>
            )}
          </Button>
        </div>

        {/* Live Playground Screen */}
        <div
          className="p-6 rounded-[var(--radius)] text-center overflow-hidden flex items-center justify-center min-h-[96px] transition-all relative"
          style={{
            background:
              style.backdrop === "none"
                ? "rgba(10,12,18,0.75)"
                : style.backdrop === "solid"
                ? style.boxColor ?? "rgba(15,18,25,0.95)"
                : style.boxColor ?? "rgba(10,16,32,0.65)",
            backdropFilter: style.backdrop === "blur" ? "blur(16px)" : undefined,
            WebkitBackdropFilter: style.backdrop === "blur" ? "blur(16px)" : undefined,
            boxShadow:
              style.backdrop === "none"
                ? "none"
                : "inset 0 1px 0 rgba(255,255,255,0.15), 0 12px 30px rgba(0,0,0,0.5)",
            fontSize: typeof style.fontSizePx === "number" ? Math.min(28, style.fontSizePx / 2.2) : 22,
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-y-2">
            {words.map((word, idx) =>
              renderSimulatedWord(
                word,
                activeWordIdx === idx,
                idx === 2 || idx === 5,
                currentPreset
              )
            )}
          </div>
        </div>

        {/* Ô nhập chữ mẫu tự do */}
        <Field label={t("editor.caption.playground-label")} htmlFor={`${id}-playground-input`}>
          <input
            id={`${id}-playground-input`}
            type="text"
            className="input w-full"
            value={sampleText}
            placeholder={t("editor.caption.playground-placeholder")}
            onChange={(e) => {
              setSampleText(e.target.value);
              setActiveWordIdx(0);
            }}
          />
        </Field>

        {/* Nút chọn nhanh câu kiểm tra dấu tiếng Việt */}
        <div className="flex flex-col gap-1">
          <span className="text-meta text-[var(--text-muted)] font-medium">
            {t("editor.caption.quick-test")}
          </span>
          <div className="flex flex-wrap gap-1">
            {QUICK_TEST_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                className="text-xs px-2 py-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-pointer text-left"
                onClick={() => {
                  setSampleText(phrase);
                  setActiveWordIdx(0);
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Tùy chỉnh màu sắc & kiểu nền */}
      <Field label={t("editor.caption.active-color")}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={activeColor.startsWith("#") ? activeColor : "#19c8ff"}
            onChange={(e) => edit((tl) => setCaptionStyle(tl, { activeColor: e.target.value }))}
            className="w-8 h-8 rounded-[var(--radius)] border border-[var(--border)] cursor-pointer p-0 bg-transparent"
          />
          <div className="flex items-center gap-1">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                title={swatch.label}
                onClick={() => edit((tl) => setCaptionStyle(tl, { activeColor: swatch.value }))}
                style={{ backgroundColor: swatch.value }}
                className={`w-6 h-6 rounded-full border border-black/30 hover:scale-110 transition-transform cursor-pointer ${
                  activeColor === swatch.value ? "ring-2 ring-[var(--primary)] scale-110" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </Field>

      <Field label={t("editor.caption.backdrop")}>
        <Segmented
          label={t("editor.caption.backdrop")}
          value={style.backdrop ?? "blur"}
          onChange={(backdrop) => edit((tl) => setCaptionStyle(tl, { backdrop }))}
          options={[
            { value: "blur", label: t("editor.caption.backdrop-blur") },
            { value: "solid", label: t("editor.caption.backdrop-solid") },
            { value: "none", label: t("editor.caption.backdrop-none") },
          ]}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id={`${id}-size`}
          label={t("editor.caption.size")}
          unit="px"
          digits={0}
          step={1}
          value={typeof style.fontSizePx === "number" ? style.fontSizePx : 62}
          min={24}
          max={160}
          onCommit={(v) =>
            edit((tl) => setCaptionStyle(tl, { fontSizePx: Math.round(v) }))
          }
        />
        <NumberField
          id={`${id}-bottom`}
          label={t("editor.caption.bottom")}
          unit="px"
          digits={0}
          step={1}
          value={
            typeof style.bottomPx === "number"
              ? style.bottomPx
              : vertical
              ? 320
              : 130
          }
          min={0}
          onCommit={(v) =>
            edit((tl) => setCaptionStyle(tl, { bottomPx: Math.round(v) }))
          }
        />
      </div>
    </Panel>
  );
}
