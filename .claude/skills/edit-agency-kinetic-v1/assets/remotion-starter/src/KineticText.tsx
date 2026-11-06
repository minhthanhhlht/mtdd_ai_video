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
  fontSize = 110,
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
      stiffness: 160,
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
        transform: `scale(${0.7 + pop * 0.3})`,
        opacity,
        zIndex: 50,
        paddingLeft: 40,
        paddingRight: 40,
      }}
    >
      {leadText && (
        <span
          style={{
            fontSize: leadFontSize,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
            marginBottom: 4,
            textShadow: "0 4px 16px rgba(0,0,0,0.85)",
            textTransform: "uppercase",
          }}
        >
          {leadText}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <span
          style={{
            fontSize,
            fontWeight: 900,
            color: highlightColor,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textShadow: `0 8px 30px rgba(0,0,0,0.9), 0 0 40px ${highlightColor}66`,
            textTransform: "uppercase",
          }}
        >
          {keyword}
        </span>
        {accentText && (
          <span
            style={{
              fontSize: Math.round(fontSize * 0.5),
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
  );
};
