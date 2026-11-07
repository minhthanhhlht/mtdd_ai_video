import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface KineticTextProps {
  leadText?: string;
  keyword: string;
  accentText?: string;
  highlightColor?: string;
  yOffset?: number;
  fontSize?: number;
  leadFontSize?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  leadText,
  keyword,
  accentText,
  highlightColor = "#CCFF00",
  yOffset = 1100,
  fontSize = 115,
  leadFontSize = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: {
      damping: 12,
      mass: 0.5,
      stiffness: 170,
    },
  });

  const opacity = Math.min(1, frame / 3);

  return (
    <div
      style={{
        position: "absolute",
        top: yOffset,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        transform: `perspective(1000px) scale(${0.72 + pop * 0.28}) translateY(${Math.max(0, (1 - pop) * 30)}px)`,
        opacity,
        zIndex: 50,
        paddingLeft: 30,
        paddingRight: 30,
      }}
    >
      {/* Vùng hộp nền bảo vệ mờ cao cấp giúp chữ luôn đanh thép trên mọi loại video */}
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(14, 14, 16, 0.78)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255, 255, 255, 0.18)",
          borderRadius: 28,
          padding: "16px 36px",
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.25)",
          maxWidth: "92%",
        }}
      >
        {leadText && (
          <span
            style={{
              fontSize: leadFontSize,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.06em",
              marginBottom: 4,
              textShadow: "0 3px 12px rgba(0,0,0,0.9)",
              textTransform: "uppercase",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {leadText}
          </span>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize,
              fontWeight: 950,
              color: highlightColor,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textShadow: `0 4px 0 rgba(0,0,0,0.9), 0 8px 30px rgba(0,0,0,0.95), 0 0 35px ${highlightColor}88`,
              textTransform: "uppercase",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {keyword}
          </span>
          {accentText && (
            <span
              style={{
                fontSize: Math.round(fontSize * 0.52),
                fontStyle: "italic",
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#FFFFFF",
                letterSpacing: "0.02em",
                textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              }}
            >
              {accentText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
