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
  const breathe = Math.sin(frame / 15) * 12;

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - (size + breathe) / 2,
        top: centerY - (size + breathe) / 2,
        width: size + breathe,
        height: size + breathe,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        boxShadow: `0 0 50px ${color}, inset 0 0 30px ${color}88`,
        opacity: 0.85,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
};

