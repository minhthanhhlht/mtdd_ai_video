import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CaptionCue, CaptionStyle, CaptionWord } from "../manifest";
import { useMediaSrc } from "../media";
import { cueBoxAttrs, cueOffsetCss, cueScaleOf } from "./cueTransform";
import { fadeInOut } from "./fade";
import {
  allFontsFaceCss,
  resolveFontStack,
  useAllFonts,
} from "./vietnameseFont";

/**
 * Phụ đề karaoke overlay toàn bài — tầng lắp ráp (skill video-pipeline giao
 * "overlay caption toàn bài" cho Remotion, motion-graphics cho HyperFrames).
 *
 * Hỗ trợ preset CapCut ('capcut-spring-pop', 'capcut-moving-pill',
 * 'capcut-karaoke-sweep', 'capcut-stroke-solid', 'capcut-neon-flash')
 * và font tiếng Việt tự chọn (Inter, Montserrat, Be Vietnam Pro, Lexend, Space Grotesk).
 */

const DEFAULT_ACTIVE = "#19c8ff";
const DEFAULT_KEYWORD = "#ffcf4d";
const DEFAULT_IDLE = "rgba(255,255,255,0.92)";

interface WordProps {
  word: CaptionWord;
  frame: number;
  style?: CaptionStyle;
  fps: number;
}

const Word: React.FC<WordProps> = ({ word, frame, style, fps }) => {
  const preset = style?.preset ?? "default";
  const activeColor = style?.activeColor ?? DEFAULT_ACTIVE;
  const keywordColor = style?.keywordColor ?? DEFAULT_KEYWORD;
  const idleColor = style?.idleColor ?? DEFAULT_IDLE;
  const customStrokeColor = style?.strokeColor;
  const customStrokeWidth = style?.strokeWidth;

  const spoken = frame >= word.start && frame <= word.end;
  const passed = frame > word.end;

  // 1. CAPCUT SPRING POP (Nảy vật lý kiểu CapCut)
  if (preset === "capcut-spring-pop") {
    const springProgress = spoken
      ? spring({
          frame: Math.max(0, frame - word.start),
          fps,
          config: {
            damping: 10,
            stiffness: 180,
            mass: 0.6,
          },
        })
      : 0;

    const scale = spoken ? 1 + springProgress * 0.2 : 1;
    const color = spoken
      ? (word.hi ? keywordColor : activeColor)
      : (word.hi ? keywordColor : idleColor);
    const stroke = customStrokeWidth
      ? `${customStrokeWidth}px ${customStrokeColor || "rgba(0,0,0,0.85)"}`
      : "1.5px rgba(0,0,0,0.85)";

    return (
      <span
        style={{
          display: "inline-block",
          margin: "0 0.22em",
          transform: `scale(${scale})`,
          transformOrigin: "center bottom",
          color,
          fontWeight: word.hi ? 900 : 800,
          WebkitTextStroke: stroke,
          filter: spoken
            ? `drop-shadow(0 4px 12px rgba(0,0,0,0.85)) drop-shadow(0 0 16px ${word.hi ? keywordColor : activeColor})`
            : "drop-shadow(0 2px 6px rgba(0,0,0,0.7))",
        }}
      >
        {word.text}
      </span>
    );
  }

  // 2. CAPCUT MOVING PILL (Khối nền pill nổi bật di chuyển theo từng từ)
  if (preset === "capcut-moving-pill") {
    const pillBg = spoken
      ? (word.hi ? keywordColor : activeColor)
      : "transparent";
    const pillTextColor = spoken
      ? (word.hi ? "#000000" : "#ffffff")
      : (word.hi ? keywordColor : idleColor);
    const pillScale = spoken ? 1.06 : 1;

    return (
      <span
        style={{
          display: "inline-block",
          margin: "0.1em 0.15em",
          padding: "0.06em 0.32em",
          borderRadius: "9999px",
          backgroundColor: pillBg,
          color: pillTextColor,
          fontWeight: word.hi ? 800 : 700,
          transform: `scale(${pillScale})`,
          transformOrigin: "center center",
          boxShadow: spoken
            ? `0 4px 14px ${word.hi ? "rgba(255,207,77,0.5)" : "rgba(37,99,235,0.45)"}`
            : "none",
          transition: "all 0.1s ease",
        }}
      >
        {word.text}
      </span>
    );
  }

  // 3. CAPCUT KARAOKE SWEEP (Quét màu gradient mượt mà từ trái sang phải)
  if (preset === "capcut-karaoke-sweep") {
    let sweepPct = 0;
    if (frame < word.start) {
      sweepPct = 0;
    } else if (frame > word.end) {
      sweepPct = 100;
    } else {
      sweepPct = interpolate(frame, [word.start, word.end], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }

    const fillCol = word.hi ? keywordColor : activeColor;
    const unfillCol = word.hi ? "rgba(255,207,77,0.4)" : idleColor;

    return (
      <span
        style={{
          display: "inline-block",
          margin: "0 0.2em",
          fontWeight: word.hi ? 800 : 700,
          backgroundImage: `linear-gradient(to right, ${fillCol} ${sweepPct}%, ${unfillCol} ${sweepPct}%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: spoken
            ? `drop-shadow(0 0 14px ${word.hi ? "rgba(255,207,77,0.6)" : "rgba(25,200,255,0.6)"})`
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        }}
      >
        {word.text}
      </span>
    );
  }

  // 4. CAPCUT STROKE SOLID (Viền rỗng ban đầu, đổ đầy màu khi đọc tới)
  if (preset === "capcut-stroke-solid") {
    const strokeCol = customStrokeColor || (word.hi ? keywordColor : activeColor);
    const strokeW = customStrokeWidth ? `${customStrokeWidth}px` : "2px";
    const scale = spoken ? 1.08 : 1;

    let fillText = idleColor;
    let strokeText = "1px rgba(0,0,0,0.7)";
    let shadow = "none";

    if (spoken) {
      fillText = word.hi ? keywordColor : activeColor;
      strokeText = "1.5px rgba(0,0,0,0.9)";
      shadow = "drop-shadow(0 4px 10px rgba(0,0,0,0.8))";
    } else if (!passed) {
      fillText = "transparent";
      strokeText = `${strokeW} ${strokeCol}`;
    }

    return (
      <span
        style={{
          display: "inline-block",
          margin: "0 0.2em",
          fontWeight: 800,
          transform: `scale(${scale})`,
          transformOrigin: "center bottom",
          color: fillText,
          WebkitTextStroke: strokeText,
          filter: shadow,
        }}
      >
        {word.text}
      </span>
    );
  }

  // 5. CAPCUT NEON FLASH (Phát sáng Neon + nhấp nháy chớp sáng 2 frame đầu)
  if (preset === "capcut-neon-flash") {
    const flash = spoken && frame - word.start <= 2;
    const glowColor = word.hi ? keywordColor : (style?.activeColor || "#00f0ff");
    const scale = spoken ? 1.1 : 1;

    return (
      <span
        style={{
          display: "inline-block",
          margin: "0 0.2em",
          color: spoken
            ? (flash ? "#ffffff" : glowColor)
            : (word.hi ? keywordColor : idleColor),
          fontWeight: word.hi ? 800 : 700,
          transform: `scale(${scale})`,
          transformOrigin: "center bottom",
          filter: spoken
            ? `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 20px ${glowColor}) ${flash ? "brightness(2)" : ""}`
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
        }}
      >
        {word.text}
      </span>
    );
  }

  // 6. DEFAULT (Bảo toàn 100% logic Noti.vn/GĐT)
  const grow = 0.1 * Math.min(1, 6 / Math.max(1, word.text.length));
  const scale = spoken
    ? interpolate(frame, [word.start, word.start + 3], [1, 1 + grow], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const color = spoken
    ? (word.hi ? keywordColor : activeColor)
    : (word.hi ? keywordColor : idleColor);

  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 0.2em",
        transform: `scale(${scale})`,
        transformOrigin: "center bottom",
        color,
        fontWeight: word.hi ? 800 : 700,
        filter: spoken
          ? `drop-shadow(0 0 22px ${word.hi ? "rgba(255,190,70,0.5)" : "rgba(25,200,255,0.55)"})`
          : "none",
      }}
    >
      {word.text}
    </span>
  );
};

interface CueProps {
  cue: CaptionCue;
  index: number;
  style?: CaptionStyle;
}

const Cue: React.FC<CueProps> = ({ cue, index, style }) => {
  const frame = useCurrentFrame(); // 0 tại cue.from
  const { width, height, fps } = useVideoConfig();
  const absFrame = frame + cue.from;
  const last = cue.durationInFrames - 1;

  const vertical = height >= width;
  const u = vertical ? height / 1920 : height / 1080;
  const bottomBase = vertical ? 320 : 130;
  const bottomPx = style?.bottomPx != null ? Math.round(style.bottomPx * u) : Math.round(bottomBase * u);

  const opacity = fadeInOut(frame, last, 4, 4);
  const y = interpolate(frame, [0, 5], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fontFamily = resolveFontStack(style?.fontFamily);
  const fontSize = style?.fontSizePx != null ? Math.round(style.fontSizePx * u) : Math.round(62 * u);

  // Cấu hình Backdrop theo style
  const backdropMode = style?.backdrop ?? "blur";
  let backgroundStyle: React.CSSProperties = {
    background: style?.boxColor ?? "rgba(10,16,32,0.52)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: Math.round(28 * u),
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(120,200,255,0.14), 0 18px 50px rgba(0,0,0,0.45)",
    padding: `${Math.round(30 * u)}px ${Math.round(44 * u)}px ${Math.round(34 * u)}px`,
  };

  if (backdropMode === "solid") {
    backgroundStyle = {
      background: style?.boxColor ?? "rgba(15,18,25,0.88)",
      borderRadius: Math.round(24 * u),
      boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
      padding: `${Math.round(26 * u)}px ${Math.round(40 * u)}px ${Math.round(30 * u)}px`,
    };
  } else if (backdropMode === "none") {
    backgroundStyle = {
      background: "transparent",
      boxShadow: "none",
      padding: `${Math.round(10 * u)}px ${Math.round(20 * u)}px`,
    };
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottomPx,
        paddingLeft: Math.round(72 * u),
        paddingRight: Math.round(72 * u),
        opacity,
      }}
    >
      <div
        {...cueBoxAttrs("caption", index)}
        style={{
          transform: `${cueOffsetCss(cue.transform, width, height)}translateY(${y}px) scale(${cueScaleOf(cue.transform)})`,
          display: "block",
          fontFamily,
          fontSize,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          textAlign: "center",
          maxWidth: "100%",
          ...backgroundStyle,
        }}
      >
        {cue.words.map((word, wIdx) => (
          <Word
            key={`${word.text}-${wIdx}`}
            word={word}
            frame={absFrame}
            style={style}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionTrack: React.FC<{
  captions: CaptionCue[];
  style?: CaptionStyle;
}> = ({ captions, style }) => {
  useAllFonts(style?.fontFamily);
  const mediaSrc = useMediaSrc();

  return (
    <>
      {/* @font-face phải nằm trong DOM render, không import CSS ngoài */}
      <style>{allFontsFaceCss(mediaSrc)}</style>
      {captions.map((cue, index) => (
        <Sequence
          key={`cue-${cue.from}-${index}`}
          from={cue.from}
          durationInFrames={cue.durationInFrames}
        >
          <Cue cue={cue} index={index} style={style} />
        </Sequence>
      ))}
    </>
  );
};
