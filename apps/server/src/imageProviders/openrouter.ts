import fs from "node:fs";
import { HttpError } from "../util.js";
import { addTokenUsage } from "../db.js";

export const OPENROUTER_IMAGE_MODELS = [
  "black-forest-labs/flux.2-flex",
  "black-forest-labs/flux.2-pro",
  "black-forest-labs/flux.2-klein-4b",
  "recraft/recraft-v4.1",
  "recraft/recraft-v3",
  "bytedance-seed/seedream-5-0-flash",
  "openai/gpt-image-2",
  "qwen/qwen-image-3",
] as const;

export type OpenrouterImageModel = (typeof OPENROUTER_IMAGE_MODELS)[number];

export const DEFAULT_OPENROUTER_IMAGE_MODEL: OpenrouterImageModel = "black-forest-labs/flux.2-flex";

export function openrouterApiKey(): string | null {
  const k = process.env.OPENROUTER_API_KEY?.trim();
  return k ? k : null;
}

export interface GenerateOpenrouterImageInput {
  prompt: string;
  width?: number;
  height?: number;
  aspect?: string;
  model?: string;
  projectId?: string;
}

/**
 * Tạo ảnh qua OpenRouter Unified Image Generation API (POST https://openrouter.ai/api/v1/images)
 * Hỗ trợ các model như FLUX.2, Recraft, Seedream, OpenAI GPT Image...
 */
export async function generateOpenrouterImage(input: GenerateOpenrouterImageInput): Promise<Buffer> {
  const key = openrouterApiKey();
  if (!key) {
    throw new HttpError(
      503,
      "NO_OPENROUTER_KEY",
      "Chưa có OPENROUTER_API_KEY. Vui lòng nhập key tại trang Kết nối.",
    );
  }

  const model =
    input.model && OPENROUTER_IMAGE_MODELS.includes(input.model as OpenrouterImageModel)
      ? input.model
      : DEFAULT_OPENROUTER_IMAGE_MODEL;

  const body: Record<string, unknown> = {
    model,
    prompt: input.prompt,
  };
  if (input.aspect) {
    body.aspect_ratio = input.aspect;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mtdd.io.vn",
        "X-Title": "AIEV Video Editor",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    throw new HttpError(
      502,
      "OPENROUTER_NETWORK_ERROR",
      `Không kết nối được tới OpenRouter API: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new HttpError(
      res.status || 502,
      "OPENROUTER_INVALID_RESPONSE",
      `OpenRouter trả về dữ liệu không hợp lệ: ${text.slice(0, 200)}`,
    );
  }

  if (!res.ok || data.error) {
    if (res.status === 402 || data.error?.code === 402) {
      throw new HttpError(
        402,
        "OPENROUTER_INSUFFICIENT_CREDITS",
        "Tài khoản OpenRouter của bạn không đủ số dư để tạo ảnh. Vui lòng nạp thêm credits tại https://openrouter.ai/settings/credits (hoặc chuyển sang dùng Gemini API).",
      );
    }
    const msg = data.error?.message || `Lỗi OpenRouter (${res.status})`;
    throw new HttpError(res.status || 500, "OPENROUTER_IMAGE_FAILED", msg);
  }

  const item = Array.isArray(data.data) ? data.data[0] : null;
  if (!item) {
    throw new HttpError(502, "OPENROUTER_NO_DATA", "OpenRouter không trả về dữ liệu ảnh nào.");
  }

  // Ghi nhận token usage nếu có
  try {
    if (data.usage?.cost) {
      addTokenUsage(
        `img_${input.projectId ?? "unknown"}`,
        input.projectId ?? null,
        data.usage.prompt_tokens ?? 0,
        data.usage.completion_tokens ?? 0,
        Number(data.usage.cost),
        "openrouter",
      );
    }
  } catch {
    /* usage logging non-blocking */
  }

  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }

  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) {
      throw new HttpError(
        502,
        "OPENROUTER_IMAGE_DOWNLOAD_FAILED",
        `Không tải được ảnh từ URL của OpenRouter (${imgRes.status})`,
      );
    }
    const arrBuf = await imgRes.arrayBuffer();
    return Buffer.from(arrBuf);
  }

  throw new HttpError(502, "OPENROUTER_UNRECOGNIZED_FORMAT", "Định dạng ảnh từ OpenRouter không hỗ trợ.");
}
