import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";

const isFull = process.argv.includes("--full");
const compositionId = "Video1AgencyKinetic";

async function main() {
  console.log(`Bundling Remotion project...`);
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/index.tsx"),
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
  });

  const durationInFrames = isFull ? composition.durationInFrames : 90;
  const outputPath = isFull
    ? path.resolve("D:/AI/video/1_edited_agency_kinetic.mp4")
    : path.resolve("D:/AI/video/1_preview.mp4");

  console.log(`Rendering ${durationInFrames} frames (${(durationInFrames / 30).toFixed(1)}s) to ${outputPath}...`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    frameRange: [0, durationInFrames - 1],
    onProgress: ({ progress }) => {
      process.stdout.write(`Rendering: ${(progress * 100).toFixed(0)}%\r`);
    },
  });

  console.log(`\nRender completed successfully! Output: ${outputPath}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
