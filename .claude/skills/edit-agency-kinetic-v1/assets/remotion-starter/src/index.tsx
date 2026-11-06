import React from "react";
import { registerRoot, Composition, Sequence, Video, staticFile, useCurrentFrame } from "remotion";
import { KineticText } from "./KineticText";
import { HaloLight } from "./HaloLight";
import { RecViewfinder } from "./RecViewfinder";
import { NotificationCard } from "./NotificationCard";
import { WorkflowCards } from "./WorkflowCards";
import { DynamicIslandCTA } from "./DynamicIslandCTA";
import "./style.css";

export const Video1AgencyKinetic: React.FC = () => {
  const frame = useCurrentFrame();
  const pushIn = 1 + frame * 0.00018; // smooth subtle push-in

  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        backgroundColor: "#0d0d0f",
        overflow: "hidden",
      }}
    >
      {/* Background Video Layer with subtle push-in */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `scale(${pushIn})`,
          transformOrigin: "center center",
          zIndex: 1,
        }}
      >
        <Video
          src={staticFile("1.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Cinematic Vignette Overlay to ensure text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at center, rgba(18, 18, 20, 0.25) 30%, rgba(10, 10, 12, 0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Top and Bottom soft dark gradients for text contrast */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 480,
            background: "linear-gradient(to bottom, rgba(10, 10, 12, 0.9) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 600,
            background: "linear-gradient(to top, rgba(10, 10, 12, 0.95) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 00:00 - 00:03.5 (Frames 0 - 105): THE HOOK */}
      <Sequence from={0} durationInFrames={105}>
        <KineticText
          leadText="Bạn cần tìm"
          keyword="BỮA ĂN NHANH?"
          highlightColor="#CCFF00"
          yOffset={240}
          fontSize={110}
        />
      </Sequence>

      {/* 00:03.5 - 00:07.5 (Frames 105 - 225): THE PAIN POINT / CAMERA REC */}
      <Sequence from={105} durationInFrames={120}>
        <RecViewfinder />
        <HaloLight centerX={540} centerY={820} size={620} color="#FFA028" />
        <KineticText
          leadText="Ngại nấu nướng"
          keyword="QUÁ CẦU KỲ?"
          highlightColor="#CCFF00"
          yOffset={240}
          fontSize={115}
        />
      </Sequence>

      <Sequence from={115} durationInFrames={110}>
        <NotificationCard
          icon="⚠️"
          text="Quá nhiều nồi chảo phức tạp?"
          topOffset={1200}
        />
      </Sequence>

      <Sequence from={155} durationInFrames={70}>
        <NotificationCard
          icon="⏱️"
          text="Đi làm về mệt, ngại vào bếp?"
          topOffset={1330}
        />
      </Sequence>

      {/* 00:07.5 - 00:13.5 (Frames 225 - 405): THE WORKFLOW CARDS */}
      <Sequence from={225} durationInFrames={180}>
        <KineticText
          leadText="Tất cả gói gọn trong"
          keyword="1 CHIẾC NỒI"
          highlightColor="#CCFF00"
          yOffset={240}
          fontSize={120}
        />
        <WorkflowCards
          cards={[
            {
              id: "1",
              icon: "🫕",
              title: "ĐA NĂNG",
              subtitle: "Lẩu - Xào - Nấu",
              position: "left",
              topOffset: 1240,
              delayFrames: 0,
            },
            {
              id: "2",
              icon: "♨️",
              title: "TIỆN LỢI",
              subtitle: "Vừa Nấu Vừa Hấp",
              position: "right",
              topOffset: 1240,
              delayFrames: 25,
            },
            {
              id: "3",
              icon: "⚡",
              title: "SIÊU TỐC",
              subtitle: "Nóng Sau 2 Phút",
              position: "left",
              topOffset: 1240,
              delayFrames: 55,
            },
            {
              id: "4",
              icon: "🍲",
              title: "TRỌN VỊ",
              subtitle: "Thơm Ngon Đậm Đà",
              position: "right",
              topOffset: 1240,
              delayFrames: 85,
            },
          ]}
        />
      </Sequence>

      {/* 00:13.5 - 00:17.1 (Frames 405 - 513): THE CTA */}
      <Sequence from={405} durationInFrames={108}>
        <KineticText
          leadText="Nấu ăn thảnh thơi mỗi ngày"
          keyword="BEAR COOKER"
          highlightColor="#CCFF00"
          yOffset={240}
          fontSize={115}
        />
        <DynamicIslandCTA
          avatarIcon="🫕"
          ctaText="Thử ngay hôm nay..."
          subText="TIỆN ÍCH CHO MỌI NHÀ"
          accentColor="#CCFF00"
        />
      </Sequence>
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video1AgencyKinetic"
      component={Video1AgencyKinetic}
      durationInFrames={513}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

registerRoot(RemotionRoot);
