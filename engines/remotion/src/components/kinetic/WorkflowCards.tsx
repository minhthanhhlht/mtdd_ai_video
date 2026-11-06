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

        const leftPos =
          card.position === "left"
            ? "8%"
            : card.position === "right"
            ? "54%"
            : "30%";

        const topPos = card.topOffset ?? 1080;

        return (
          <div
            key={card.id}
            style={{
              position: "absolute",
              top: topPos,
              left: leftPos,
              transform: `scale(${pop})`,
              width: 380,
              height: 280,
              backgroundColor: "rgba(25, 20, 18, 0.88)",
              backdropFilter: "blur(20px)",
              borderRadius: 32,
              border: "1.5px solid rgba(255, 255, 255, 0.22)",
              boxShadow:
                "0 24px 50px rgba(0, 0, 0, 0.75), inset 0 2px 10px rgba(255, 255, 255, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 72, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))" }}>
              {card.icon}
            </div>
            <span
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "0.04em",
                textAlign: "center",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              {card.title}
            </span>
            {card.subtitle && (
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#CCFF00",
                  letterSpacing: "0.02em",
                  textAlign: "center",
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
