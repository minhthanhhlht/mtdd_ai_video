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
        transform: `translateX(-50%) scale(${0.8 + pop * 0.2})`,
        width,
        height: 105,
        backgroundColor: "rgba(18, 16, 15, 0.92)",
        backdropFilter: "blur(20px)",
        borderRadius: 52,
        border: "1.5px solid rgba(255, 255, 255, 0.22)",
        boxShadow: "0 16px 36px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 59, 48, 0.3)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 32,
        paddingRight: 32,
        gap: 20,
        zIndex: 55,
      }}
    >
      <span style={{ fontSize: 42 }}>{icon}</span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: "#FFFFFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        {text}
      </span>
    </div>
  );
};
