import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface WorkflowCardItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  position?: "left" | "right" | "center";
  topOffset?: number;
  delayFrames: number;
}

export interface WorkflowCardsProps {
  cards?: WorkflowCardItem[];
}

export const WorkflowCards: React.FC<WorkflowCardsProps> = ({
  cards = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 40,
        perspective: 1200,
      }}
    >
      {cards.map((card) => {
        const localFrame = frame - card.delayFrames;
        if (localFrame < 0) return null;

        const pop = spring({
          frame: localFrame,
          fps,
          config: {
            damping: 12,
            mass: 0.6,
            stiffness: 140,
          },
        });

        // Nhẹ nhàng lơ lửng trong không gian 3D
        const floatY = Math.sin((localFrame + card.delayFrames) / 16) * 6;

        // Góc nghiêng 3D chân thực theo vị trí
        const rotateY =
          card.position === "left" ? 10 : card.position === "right" ? -10 : 0;
        const rotateX = 6;
        const rotateZ =
          card.position === "left" ? -2 : card.position === "right" ? 2 : 0;

        const leftPos =
          card.position === "left"
            ? "7%"
            : card.position === "right"
            ? "53%"
            : "30%";

        const topPos = card.topOffset ?? 1080;

        return (
          <div
            key={card.id}
            style={{
              position: "absolute",
              top: topPos,
              left: leftPos,
              transform: `scale(${pop}) translateY(${floatY}px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
              transformOrigin: "center center",
              width: 400,
              minHeight: 280,
              background:
                "linear-gradient(145deg, rgba(36, 32, 28, 0.95) 0%, rgba(18, 16, 15, 0.96) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: 34,
              border: "1.5px solid rgba(255, 255, 255, 0.28)",
              boxShadow:
                "0 30px 60px rgba(0, 0, 0, 0.85), inset 0 2px 8px rgba(255, 255, 255, 0.2), 0 0 40px rgba(204, 255, 0, 0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "24px 20px",
              boxSizing: "border-box",
            }}
          >
            {/* Hộp huy hiệu 3D nổi khối cho Icon */}
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 26,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                boxShadow:
                  "inset 0 2px 6px rgba(255, 255, 255, 0.2), 0 10px 24px rgba(0, 0, 0, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 54,
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
              }}
            >
              {card.icon}
            </div>

            {/* Tiêu đề thẻ - Chữ đậm nét rõ ràng */}
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "0.02em",
                textAlign: "center",
                lineHeight: 1.2,
                textShadow: "0 3px 12px rgba(0,0,0,0.9)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {card.title}
            </span>

            {/* Phụ đề thẻ - Màu Neon nổi bật */}
            {card.subtitle && (
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#CCFF00",
                  letterSpacing: "0.03em",
                  textAlign: "center",
                  textShadow:
                    "0 0 16px rgba(204, 255, 0, 0.6), 0 2px 8px rgba(0,0,0,0.9)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {card.subtitle}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
