import React from "react";
import { useCurrentFrame } from "remotion";

export interface RecViewfinderProps {
  padding?: number;
  cornerSize?: number;
}

export const RecViewfinder: React.FC<RecViewfinderProps> = ({
  padding = 70,
  cornerSize = 50,
}) => {
  const frame = useCurrentFrame();
  const isBlinking = Math.floor(frame / 15) % 2 === 0;

  const cornerStyle: React.CSSProperties = {
    position: "absolute",
    width: cornerSize,
    height: cornerSize,
    borderColor: "rgba(255, 255, 255, 0.75)",
    borderStyle: "solid",
    borderWidth: 0,
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: padding,
        left: padding,
        right: padding,
        bottom: padding,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* Top Left Corner */}
      <div
        style={{
          ...cornerStyle,
          top: 0,
          left: 0,
          borderTopWidth: 4,
          borderLeftWidth: 4,
        }}
      />
      {/* Top Right Corner */}
      <div
        style={{
          ...cornerStyle,
          top: 0,
          right: 0,
          borderTopWidth: 4,
          borderRightWidth: 4,
        }}
      />
      {/* Bottom Left Corner */}
      <div
        style={{
          ...cornerStyle,
          bottom: 0,
          left: 0,
          borderBottomWidth: 4,
          borderLeftWidth: 4,
        }}
      />
      {/* Bottom Right Corner */}
      <div
        style={{
          ...cornerStyle,
          bottom: 0,
          right: 0,
          borderBottomWidth: 4,
          borderRightWidth: 4,
        }}
      />

      {/* Blinking REC indicator */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 30,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "#FF3B30",
            opacity: isBlinking ? 1 : 0.2,
            boxShadow: isBlinking ? "0 0 16px #FF3B30" : "none",
          }}
        />
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#FFFFFF",
            fontFamily: "monospace",
          }}
        >
          REC
        </span>
      </div>
    </div>
  );
};

