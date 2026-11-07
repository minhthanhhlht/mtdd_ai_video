import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface NotificationCardProps {
  icon: string;
  text: string;
  topOffset: number;
  width?: number;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  icon,
  text,
  topOffset,
  width = 720,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.5,
      stiffness: 150,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: topOffset,
        left: "50%",
        transform: `translateX(-50%) perspective(800px) scale(${0.78 + pop * 0.22}) rotateX(5deg)`,
        width,
        minHeight: 110,
        background:
          "linear-gradient(135deg, rgba(28, 24, 22, 0.94) 0%, rgba(16, 14, 13, 0.96) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 55,
        border: "1.5px solid rgba(255, 255, 255, 0.28)",
        boxShadow:
          "0 20px 48px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 59, 48, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 24,
        paddingRight: 36,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 20,
        zIndex: 55,
        boxSizing: "border-box",
      }}
    >
      {/* Icon huy hiệu nổi bật */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 22,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          boxShadow:
            "inset 0 1px 4px rgba(255, 255, 255, 0.2), 0 6px 16px rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          lineHeight: 1.3,
          flex: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
};
