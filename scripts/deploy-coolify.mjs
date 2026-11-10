#!/usr/bin/env node
/**
 * Script kích hoạt build và deploy ứng dụng MTDD AI Video lên nền tảng Coolify.
 * Tuân thủ RULE 15 (Tự động Git Push & Coolify Deployment).
 *
 * Sử dụng:
 *   node scripts/deploy-coolify.mjs [--wait]
 *   npm run deploy:coolify
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Đọc biến từ .env nếu có
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      env[key] = val;
    }
  }
  return env;
}

const fileEnv = loadEnv();
const API_URL = process.env.COOLIFY_API_URL || fileEnv.COOLIFY_API_URL || "https://manage.mtdd.io.vn";
const API_TOKEN = process.env.COOLIFY_API_TOKEN || fileEnv.COOLIFY_API_TOKEN || "1|5APA6tHmfWx64NJ79JJvMpU7rRS2NnOCgWoqhnkVb8c52d68";
const APP_UUID = process.env.COOLIFY_APP_UUID || fileEnv.COOLIFY_APP_UUID || "nxxz3h6rdy0uahktp9biorb9";

const shouldWait = process.argv.includes("--wait");

async function main() {
  console.log(`[Coolify] Kết nối máy chủ quản lý: ${API_URL}`);
  console.log(`[Coolify] Ứng dụng mục tiêu: ${APP_UUID}`);

  // Tự động dọn dẹp Docker cache/images thừa trên máy chủ trước khi build để tránh tràn ổ cứng
  try {
    const srvRes = await fetch(`${API_URL}/api/v1/servers`, {
      headers: { Authorization: `Bearer ${API_TOKEN}`, Accept: "application/json" },
    });
    if (srvRes.ok) {
      const servers = await srvRes.json();
      const hostServer = servers.find((s) => s.is_coolify_host) || servers[0];
      if (hostServer?.uuid) {
        console.log(`[Coolify] Kích hoạt dọn dẹp Docker trên ${hostServer.name} (${hostServer.uuid})...`);
        await fetch(`${API_URL}/api/v1/servers/${hostServer.uuid}/docker-cleanup/run`, {
          method: "POST",
          headers: { Authorization: `Bearer ${API_TOKEN}`, Accept: "application/json" },
        });
        console.log(`[Coolify] Đợi dọn dẹp Docker hoàn tất (25s)...`);
        await new Promise((r) => setTimeout(r, 25000));
      }
    }
  } catch (err) {
    console.warn(`[Coolify] Bỏ qua dọn dẹp tự động (${err.message}).`);
  }

  const deployUrl = `${API_URL}/api/v1/deploy?uuid=${encodeURIComponent(APP_UUID)}`;
  const res = await fetch(deployUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Coolify] Lỗi kích hoạt deploy (HTTP ${res.status}):`, errText);
    process.exit(1);
  }

  const data = await res.json();
  const deployment = data.deployments?.[0];
  const depUuid = deployment?.deployment_uuid;

  console.log(`[Coolify] Đã xếp hàng bản build thành công!`);
  if (deployment?.message) {
    console.log(`[Coolify] Tin nhắn: ${deployment.message}`);
  }
  if (depUuid) {
    console.log(`[Coolify] Mã triển khai (Deployment UUID): ${depUuid}`);
  }

  if (!shouldWait || !depUuid) {
    console.log(`[Coolify] Bạn có thể theo dõi trực tiếp tại: ${API_URL}/project/bp3jkwabepvgqohrl78rhomt/environment/anwtqcceushc1vmvvku8m4hk/application/${APP_UUID}`);
    return;
  }

  console.log(`[Coolify] Đang theo dõi tiến trình build...`);
  const statusUrl = `${API_URL}/api/v1/deployments/${depUuid}`;
  
  while (true) {
    await new Promise((r) => setTimeout(r, 6000));
    try {
      const sRes = await fetch(statusUrl, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
        },
      });
      if (!sRes.ok) continue;
      const sData = await sRes.json();
      const status = sData.status;
      process.stdout.write(`\r[Coolify] Trạng thái build: ${status}... `);

      if (status === "finished" || status === "success") {
        console.log(`\n[Coolify] ✅ Triển khai thành công lên Production!`);
        console.log(`[Coolify] 🌐 Website: https://video.mtdd.io.vn`);
        break;
      }
      if (status === "failed" || status === "cancelled" || status === "error") {
        console.error(`\n[Coolify] ❌ Build thất bại (trạng thái: ${status}).`);
        if (sData.logs) {
          const lines = sData.logs.split("\n");
          console.error(lines.slice(-20).join("\n"));
        }
        process.exit(1);
      }
    } catch {
      // Bỏ qua lỗi mạng tạm thời
    }
  }
}

main().catch((err) => {
  console.error("[Coolify] Ngoại lệ ngoài ý muốn:", err);
  process.exit(1);
});

