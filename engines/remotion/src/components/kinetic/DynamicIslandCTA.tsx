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
  avatarIcon = "🧧",
  ctaText = "Chọn ngay hôm nay...",
  subText = "ƯU ĐÃI TẾT",
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
      stiffness: 125,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 320,
        left: "50%",
        transform: `translateX(-50%) perspective(1000px) scale(${0.78 + expand * 0.22}) rotateX(4deg)`,
        width: 720,
        minHeight: 126,
        background:
          "linear-gradient(135deg, rgba(24, 28, 24, 0.95) 0%, rgba(12, 14, 12, 0.97) 100%)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRadius: 9999,
        border: "1.5px solid rgba(255, 255, 255, 0.28)",
        boxShadow: `0 28px 60px rgba(0, 0, 0, 0.85), 0 0 50px ${accentColor}33, inset 0 1px 2px rgba(255, 255, 255, 0.35)`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 40,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 24,
        zIndex: 70,
        boxSizing: "border-box",
      }}
    >
      {/* Khung chứa Avatar / Icon với viền phát sáng */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          backgroundColor: "#1F261E",
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 20px ${accentColor}66, inset 0 2px 6px rgba(255, 255, 255, 0.2)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
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
          <span style={{ fontSize: 48 }}>{avatarIcon}</span>
        )}
      </div>

      {/* Nội dung thông điệp CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
          minWidth: 0,
        }}
      >
        {subText && (
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textShadow: `0 0 16px ${accentColor}88, 0 2px 6px rgba(0,0,0,0.8)`,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {subText}
          </span>
        )}
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ctaText}
        </span>
      </div>
    </div>
  );
};
