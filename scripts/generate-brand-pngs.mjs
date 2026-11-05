import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = process.cwd();
const assetsBrandDir = path.join(repoRoot, 'assets', 'brand');
const publicBrandDir = path.join(repoRoot, 'apps', 'web', 'public', 'brand');

fs.mkdirSync(assetsBrandDir, { recursive: true });
fs.mkdirSync(publicBrandDir, { recursive: true });

// Đọc font Inter local để nhúng trực tiếp
const font700Base64 = fs.readFileSync(
  path.join(repoRoot, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-700-normal.woff2')
).toString('base64');

const font800Base64 = fs.readFileSync(
  path.join(repoRoot, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-800-normal.woff2')
).toString('base64');

const fontStyle = `
@font-face {
  font-family: 'Inter';
  font-weight: 700;
  font-style: normal;
  src: url('data:font/woff2;base64,${font700Base64}') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-weight: 800;
  font-style: normal;
  src: url('data:font/woff2;base64,${font800Base64}') format('woff2');
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function renderHtmlToPng(htmlContent, width, height, outputPath, bgColor = '00000000') {
  const tempHtml = path.join(repoRoot, `.temp_${Date.now()}_${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(tempHtml, htmlContent, 'utf8');
  try {
    const cmd = `"${chromePath}" --headless=new --default-background-color=${bgColor} --window-size=${width},${height} --screenshot="${outputPath}" "${tempHtml}"`;
    execSync(cmd, { stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

async function generateAssets() {
  console.log('--- Đang khởi tạo các biến thể Master Logo MTDD AI (4K / 2K) ---');

  // Master 1: Horizontal Light (Transparent)
  const masterHorizLightHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${fontStyle}
body { background: transparent; width: 3840px; height: 960px; }
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 130px;
  user-select: none;
}
.brand-logo-name {
  font-size: 480px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #101113;
  line-height: 1;
}
.brand-logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 60px 160px;
  border-radius: 130px;
  background: #2563eb;
  color: #ffffff;
  font-size: 350px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}
</style>
</head>
<body>
  <div class="brand-logo">
    <span class="brand-logo-name">MTDD</span>
    <span class="brand-logo-badge">AI</span>
  </div>
</body>
</html>`;

  // Master 2: Horizontal Dark (Transparent)
  const masterHorizDarkHtml = masterHorizLightHtml.replace('color: #101113;', 'color: #ffffff;');

  // Master 3: Horizontal All-White Watermark (Transparent)
  const masterHorizWhiteWatermarkHtml = masterHorizLightHtml
    .replace('color: #101113;', 'color: #ffffff;')
    .replace('background: #2563eb;', 'background: transparent; border: 18px solid #ffffff;')
    .replace('color: #ffffff;', 'color: #ffffff;');

  // Master 4: Horizontal Solid Light (Nền trắng)
  const masterHorizSolidLightHtml = masterHorizLightHtml.replace('background: transparent;', 'background: #ffffff;');

  // Master 5: Horizontal Solid Dark (Nền đen tối #101113)
  const masterHorizSolidDarkHtml = masterHorizDarkHtml.replace('background: transparent;', 'background: #101113;');

  // Master 6: Square Icon Dark (2048x2048)
  const masterSquareDarkHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${fontStyle}
body { background: #101113; width: 2048px; height: 2048px; }
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80px;
}
.brand-logo-name {
  font-size: 420px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
  line-height: 1;
}
.brand-logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 50px 140px;
  border-radius: 110px;
  background: #2563eb;
  color: #ffffff;
  font-size: 300px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}
</style>
</head>
<body>
  <div class="container">
    <span class="brand-logo-name">MTDD</span>
    <span class="brand-logo-badge">AI</span>
  </div>
</body>
</html>`;

  // Master 7: Square Icon Blue (2048x2048)
  const masterSquareBlueHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${fontStyle}
body { background: #2563eb; width: 2048px; height: 2048px; }
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80px;
}
.brand-logo-name {
  font-size: 420px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
  line-height: 1;
}
.brand-logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 50px 140px;
  border-radius: 110px;
  background: #ffffff;
  color: #2563eb;
  font-size: 300px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}
</style>
</head>
<body>
  <div class="container">
    <span class="brand-logo-name">MTDD</span>
    <span class="brand-logo-badge">AI</span>
  </div>
</body>
</html>`;

  // Master 8: Square Icon Light (2048x2048)
  const masterSquareLightHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${fontStyle}
body { background: #ffffff; width: 2048px; height: 2048px; }
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80px;
}
.brand-logo-name {
  font-size: 420px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #101113;
  line-height: 1;
}
.brand-logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 50px 140px;
  border-radius: 110px;
  background: #2563eb;
  color: #ffffff;
  font-size: 300px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}
</style>
</head>
<body>
  <div class="container">
    <span class="brand-logo-name">MTDD</span>
    <span class="brand-logo-badge">AI</span>
  </div>
</body>
</html>`;

  // Master 9: Square Icon Transparent (2048x2048)
  const masterSquareTransparentHtml = masterSquareLightHtml.replace('background: #ffffff;', 'background: transparent;');

  const masterFiles = [
    { name: 'master-horiz-light.png', html: masterHorizLightHtml, w: 3840, h: 960, bg: '00000000' },
    { name: 'master-horiz-dark.png', html: masterHorizDarkHtml, w: 3840, h: 960, bg: '00000000' },
    { name: 'master-horiz-white.png', html: masterHorizWhiteWatermarkHtml, w: 3840, h: 960, bg: '00000000' },
    { name: 'master-horiz-solid-light.png', html: masterHorizSolidLightHtml, w: 3840, h: 960, bg: 'ffffffff' },
    { name: 'master-horiz-solid-dark.png', html: masterHorizSolidDarkHtml, w: 3840, h: 960, bg: 'ff101113' },
    { name: 'master-square-dark.png', html: masterSquareDarkHtml, w: 2048, h: 2048, bg: 'ff101113' },
    { name: 'master-square-blue.png', html: masterSquareBlueHtml, w: 2048, h: 2048, bg: 'ff2563eb' },
    { name: 'master-square-light.png', html: masterSquareLightHtml, w: 2048, h: 2048, bg: 'ffffffff' },
    { name: 'master-square-transparent.png', html: masterSquareTransparentHtml, w: 2048, h: 2048, bg: '00000000' },
  ];

  const tempMasterPaths = {};
  for (const item of masterFiles) {
    console.log(`> Rendering ${item.name} (${item.w}x${item.h})...`);
    const p = path.join(repoRoot, `.temp_${item.name}`);
    renderHtmlToPng(item.html, item.w, item.h, p, item.bg);
    tempMasterPaths[item.name] = p;
  }

  console.log('\n--- Tạo các kích thước tiêu chuẩn bằng sharp ---');

  // Kích thước ngang (Horizontal sizes)
  const horizSizes = [
    { suffix: '4k-3840x960', w: 3840, h: 960 },
    { suffix: '2k-1920x480', w: 1920, h: 480 },
    { suffix: 'large-1200x300', w: 1200, h: 300 },
    { suffix: 'medium-800x200', w: 800, h: 200 },
    { suffix: 'standard-400x100', w: 400, h: 100 },
    { suffix: 'compact-200x50', w: 200, h: 50 },
  ];

  const horizVariants = [
    { key: 'master-horiz-light.png', base: 'mtdd-ai-logo-light' },
    { key: 'master-horiz-dark.png', base: 'mtdd-ai-logo-dark' },
    { key: 'master-horiz-white.png', base: 'mtdd-ai-logo-watermark-white' },
    { key: 'master-horiz-solid-light.png', base: 'mtdd-ai-logo-solid-light' },
    { key: 'master-horiz-solid-dark.png', base: 'mtdd-ai-logo-solid-dark' },
  ];

  const createdFiles = [];

  for (const variant of horizVariants) {
    const src = tempMasterPaths[variant.key];
    for (const size of horizSizes) {
      const fileName = `${variant.base}-${size.suffix}.png`;
      const outAsset = path.join(assetsBrandDir, fileName);
      const outPublic = path.join(publicBrandDir, fileName);

      await sharp(src)
        .resize(size.w, size.h, { kernel: sharp.kernel.lanczos3 })
        .png({ compressionLevel: 9 })
        .toFile(outAsset);

      fs.copyFileSync(outAsset, outPublic);
      createdFiles.push(fileName);
    }
  }

  // Kích thước vuông (Square sizes)
  const squareSizes = [
    { suffix: '2048x2048', w: 2048, h: 2048 },
    { suffix: '1024x1024', w: 1024, h: 1024 },
    { suffix: '512x512', w: 512, h: 512 },
    { suffix: '256x256', w: 256, h: 256 },
    { suffix: '128x128', w: 128, h: 128 },
    { suffix: '64x64', w: 64, h: 64 },
    { suffix: '32x32', w: 32, h: 32 },
    { suffix: '16x16', w: 16, h: 16 },
  ];

  const squareVariants = [
    { key: 'master-square-blue.png', base: 'mtdd-ai-icon-blue' },
    { key: 'master-square-dark.png', base: 'mtdd-ai-icon-dark' },
    { key: 'master-square-light.png', base: 'mtdd-ai-icon-light' },
    { key: 'master-square-transparent.png', base: 'mtdd-ai-icon-transparent' },
  ];

  for (const variant of squareVariants) {
    const src = tempMasterPaths[variant.key];
    for (const size of squareSizes) {
      const fileName = `${variant.base}-${size.suffix}.png`;
      const outAsset = path.join(assetsBrandDir, fileName);
      const outPublic = path.join(publicBrandDir, fileName);

      await sharp(src)
        .resize(size.w, size.h, { kernel: sharp.kernel.lanczos3 })
        .png({ compressionLevel: 9 })
        .toFile(outAsset);

      fs.copyFileSync(outAsset, outPublic);
      createdFiles.push(fileName);
    }
  }

  // Cập nhật các file favicon và logo mặc định trong apps/web/public/brand
  fs.copyFileSync(
    path.join(assetsBrandDir, 'mtdd-ai-icon-blue-64x64.png'),
    path.join(publicBrandDir, 'favicon.png')
  );
  fs.copyFileSync(
    path.join(assetsBrandDir, 'mtdd-ai-logo-dark-medium-800x200.png'),
    path.join(publicBrandDir, 'logo-duong-ban.png')
  );
  fs.copyFileSync(
    path.join(assetsBrandDir, 'mtdd-ai-logo-light-medium-800x200.png'),
    path.join(publicBrandDir, 'logo-am-ban.png')
  );

  // Tạo file favicon.ico đa phân giải (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  const blueIconMaster = tempMasterPaths['master-square-blue.png'];
  for (const s of icoSizes) {
    const buf = await sharp(blueIconMaster)
      .resize(s, s, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toBuffer();
    icoBuffers.push({ size: s, buf });
  }
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(icoBuffers.length, 4);

  let icoOffset = 6 + 16 * icoBuffers.length;
  const icoDirEntries = [];
  for (const item of icoBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size, 0);
    entry.writeUInt8(item.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buf.length, 8);
    entry.writeUInt32LE(icoOffset, 12);
    icoDirEntries.push(entry);
    icoOffset += item.buf.length;
  }
  const finalIco = Buffer.concat([icoHeader, ...icoDirEntries, ...icoBuffers.map((p) => p.buf)]);
  fs.writeFileSync(path.join(repoRoot, 'apps', 'web', 'public', 'favicon.ico'), finalIco);
  fs.writeFileSync(path.join(assetsBrandDir, 'favicon.ico'), finalIco);

  // Nướng base64 data URI vào apps/web/src/lib/brand.ts
  execSync('node apps/web/scripts/build-brand.mjs', { stdio: 'inherit', cwd: repoRoot });

  // Dọn dẹp master temps
  for (const p of Object.values(tempMasterPaths)) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log(`\n✅ Hoàn tất! Đã tạo thành công ${createdFiles.length} file PNG thương hiệu MTDD AI.`);
  console.log(`Thư mục lưu trữ:`);
  console.log(`- ${assetsBrandDir}`);
  console.log(`- ${publicBrandDir}`);
}

generateAssets().catch(console.error);

