import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface DynamicIslandCTAProps {
  avatarUrl?: string;
  avatarIcon?: string;
  ctaText?: string;
  subText?: string;
  accentColor?: string;
}

export const DynamicIslandCTA: React.FC<DynamicIslandCTAProps> = ({
  avatarUrl,
  avatarIcon = "🍲",
  ctaText = "Nấu ăn thảnh thơi...",
  subText = "BEAR MULTI-COOKER",
  accentColor = "#CCFF00",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const expand = spring({
    frame,
    fps,
    config: {
      damping: 15,
      mass: 0.6,
      stiffness: 120,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 340,
        left: "50%",
        transform: `translateX(-50%) scale(${0.8 + expand * 0.2})`,
        width: 680,
        height: 120,
        backgroundColor: "rgba(18, 22, 18, 0.94)",
        backdropFilter: "blur(24px)",
        borderRadius: 9999,
        border: "1.5px solid rgba(255, 255, 255, 0.25)",
        boxShadow: `0 20px 50px rgba(0, 0, 0, 0.75), 0 0 40px ${accentColor}44`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 18,
        paddingRight: 40,
        gap: 24,
        zIndex: 70,
      }}
    >
      {/* Avatar Container */}
      <div
        style={{
          width: 86,
          height: 86,
          borderRadius: "50%",
          backgroundColor: "#2E362C",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2.5px solid ${accentColor}`,
          boxShadow: `0 0 16px ${accentColor}66`,
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 44 }}>{avatarIcon}</span>
        )}
      </div>

      {/* CTA Text */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {subText && (
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {subText}
          </span>
        )}
        <span
          style={{
            fontSize: 40,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            color: "#FFFFFF",
            letterSpacing: "0.02em",
            textShadow: `0 2px 10px rgba(0,0,0,0.8)`,
          }}
        >
          {ctaText}
        </span>
      </div>
    </div>
  );
};
