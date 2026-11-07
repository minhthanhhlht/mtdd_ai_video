import React from "react";
import { useCurrentFrame } from "remotion";

export interface HaloLightProps {
  centerX?: number;
  centerY?: number;
  size?: number;
  color?: string;
}

export const HaloLight: React.FC<HaloLightProps> = ({
  centerX = 540,
  centerY = 700,
  size = 580,
  color = "#FFA028",
}) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 14) * 16;
  const currentSize = size + breathe;

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - currentSize / 2,
        top: centerY - currentSize / 2,
        width: currentSize,
        height: currentSize,
        pointerEvents: "none",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Lớp ánh sáng tỏa volumetric ambient glow nền */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}44 0%, ${color}1A 40%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Vòng Neon sắc nét với nhiều tầng phát sáng */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `3.5px solid ${color}`,
          boxShadow: `0 0 35px ${color}, 0 0 70px ${color}AA, inset 0 0 35px ${color}66`,
          opacity: 0.92,
        }}
      />
    </div>
  );
};
