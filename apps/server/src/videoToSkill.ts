import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { paths } from "./config.js";
import {
  HttpError,
  ensureDir,
  execFileCapture,
  isKebabCase,
  nowIso,
  toKebabAscii,
} from "./util.js";

export interface VideoToSkillInput {
  videoSource:
    | { type: "url"; url: string }
    | { type: "file"; filePath: string; originalName?: string };
  skillName?: string;
  notes?: string;
  model?: string;
  onProgress?: (step: number, total: number, message: string) => void;
}

export interface VideoToSkillResult {
  name: string;
  description: string;
  skillDir: string;
  frameCount: number;
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  summary: string;
}

interface ParsedStyleData {
  name: string;
  description: string;
  skillMarkdown: string;
  styleMarkdown: string;
  timelineMarkdown: string;
  motionMarkdown: string;
  audioMarkdown: string;
  soundCues: unknown[];
}

/** Trích xuất JSON an toàn và bền bỉ từ chuỗi phản hồi AI */
function extractJsonFromText(rawText: string): any {
  let clean = rawText.trim();

  // 1. Gỡ code fences ```markdown hoặc ```json bao ngoài nếu có
  if (clean.startsWith("```")) {
    const firstNewline = clean.indexOf("\n");
    if (firstNewline !== -1) {
      clean = clean.slice(firstNewline + 1);
    }
  }
  if (clean.endsWith("```")) {
    clean = clean.slice(0, clean.lastIndexOf("```")).trim();
  }

  // 2. Cắt từ dấu { đầu tiên đến dấu } cuối cùng
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1 && lastBrace <= firstBrace) {
    // Bị cắt ngang token, thử vá đóng
    clean = clean.slice(firstBrace) + '"}';
  }

  // 3. Parse trực tiếp
  try {
    return JSON.parse(clean);
  } catch (err) {
    // 4. Khắc phục lỗi control characters / unescaped newlines trong chuỗi markdown JSON
    try {
      const sanitized = clean.replace(/[\u0000-\u001F]+/g, (match) => {
        if (match === "\n") return "\\n";
        if (match === "\r") return "\\r";
        if (match === "\t") return "\\t";
        return "";
      });
      return JSON.parse(sanitized);
    } catch {
      // 5. Fallback trích xuất regex các trường chính
      const nameMatch = clean.match(/"name"\s*:\s*"([^"]+)"/);
      const descMatch = clean.match(/"description"\s*:\s*"([^"]+)"/);
      if (nameMatch) {
        return {
          name: nameMatch[1],
          description: descMatch ? descMatch[1] : "Phong cách dựng video được trích xuất bằng AI.",
          skillMarkdown: clean,
          styleMarkdown: "",
          timelineMarkdown: "",
          motionMarkdown: "",
          audioMarkdown: "",
          soundCues: [],
        };
      }
      throw new HttpError(
        502,
        "INVALID_AI_RESPONSE",
        `AI phản hồi không đúng định dạng JSON: ${(err as Error).message}\nNội dung thô: ${rawText.slice(0, 300)}`,
      );
    }
  }
}

/** Tải video bằng yt-dlp */
async function downloadWithYtDlp(url: string, targetFile: string): Promise<void> {
  // Giới hạn thời lượng tải tối đa 2 phút, ưu tiên MP4
  const args = [
    "--no-playlist",
    "-f",
    "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    "--merge-output-format",
    "mp4",
    "-o",
    targetFile,
    url,
  ];

  try {
    await execFileCapture("yt-dlp", args, {
      timeoutMs: 120_000,
    });
  } catch (err: any) {
    throw new HttpError(
      422,
      "DOWNLOAD_FAILED",
      `Không thể tải video từ link đã cung cấp. Vui lòng kiểm tra lại link hoặc tải file MP4 trực tiếp lên: ${err?.message || err}`,
    );
  }

  if (!fs.existsSync(targetFile)) {
    throw new HttpError(
      422,
      "DOWNLOAD_FAILED",
      "Tiến trình tải video hoàn tất nhưng không tìm thấy file kết quả.",
    );
  }
}

/** Đo thông số kỹ thuật video bằng ffprobe */
async function probeVideoMetadata(videoPath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
}> {
  const args = [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    videoPath,
  ];

  try {
    const rawJson = await execFileCapture("ffprobe", args, { timeoutMs: 15_000 });
    const data = JSON.parse(rawJson);
    const videoStream = data.streams?.find((s: any) => s.codec_type === "video");

    if (!videoStream) {
      throw new HttpError(
        422,
        "NO_VIDEO_STREAM",
        "Liên kết hoặc tệp tải lên không chứa luồng video (ví dụ: bài đăng dạng Album ảnh/Photo Slideshow TikTok, hoặc file chỉ có âm thanh/nhạc nền). Vui lòng chọn một liên kết video thực tế, hoặc lưu video về máy rồi tải tệp MP4 lên.",
      );
    }

    const duration = Number(data.format?.duration || videoStream?.duration || 0);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new HttpError(
        422,
        "INVALID_VIDEO_DURATION",
        "Thời lượng video không hợp lệ hoặc tệp video bị lỗi. Vui lòng kiểm tra lại nguồn video.",
      );
    }

    const width = Number(videoStream?.width || 1080);
    const height = Number(videoStream?.height || 1920);

    let fps = 30;
    if (videoStream?.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split("/");
      if (parts.length === 2 && Number(parts[1]) > 0) {
        fps = Math.round(Number(parts[0]) / Number(parts[1]));
      }
    }

    return { duration, width, height, fps: fps || 30 };
  } catch (err: any) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(
      400,
      "PROBE_FAILED",
      `Không thể đọc thông số kỹ thuật video: ${err?.message || err}`,
    );
  }
}

/** Trích xuất chuỗi khung hình tiêu biểu qua ffmpeg */
async function extractKeyframes(
  videoPath: string,
  outDir: string,
  durationSec: number,
  maxFrames: number = 18,
): Promise<string[]> {
  ensureDir(outDir);

  // Tính interval: nếu video <= 20s lấy 1 frame/s; nếu dài hơn chia đều
  const safeDuration = Math.max(1, durationSec);
  const count = Math.min(maxFrames, Math.max(6, Math.floor(safeDuration)));
  const interval = Math.max(1, Math.floor(safeDuration / count));

  const outPattern = path.join(outDir, "frame_%02d.jpg");
  // Kích thước 720p chiều ngang để vừa nhẹ token AI vừa rõ chữ và chi tiết
  const args = [
    "-y",
    "-i",
    videoPath,
    "-vf",
    `fps=1/${interval},scale=720:-2`,
    "-q:v",
    "3",
    "-frames:v",
    String(count),
    outPattern,
  ];

  try {
    await execFileCapture("ffmpeg", args, { timeoutMs: 30_000 });
  } catch (err: any) {
    throw new HttpError(
      500,
      "FRAME_EXTRACTION_FAILED",
      `Lỗi khi trích xuất khung hình từ video: ${err?.message || err}`,
    );
  }

  const files = fs
    .readdirSync(outDir)
    .filter((f) => f.endsWith(".jpg"))
    .sort()
    .map((f) => path.join(outDir, f));

  return files;
}

/** Gọi AI Vision giải mã 6 tầng phong cách thị giác và chuyển động */
async function analyzeFramesWithVision(input: {
  frames: string[];
  meta: { duration: number; width: number; height: number; fps: number };
  notes?: string;
  suggestedName?: string;
  model?: string;
}): Promise<ParsedStyleData> {
  const { frames, meta, notes, suggestedName } = input;

  // Lấy tối đa 12 frames trải đều để gửi vào Vision API
  const sampleFrames: string[] = [];
  const step = Math.max(1, Math.floor(frames.length / 12));
  for (let i = 0; i < frames.length; i += step) {
    sampleFrames.push(frames[i]);
    if (sampleFrames.length >= 12) break;
  }

  // Chuyển ảnh sang Base64
  const imageContents = sampleFrames.map((framePath) => {
    const data = fs.readFileSync(framePath).toString("base64");
    return {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/jpeg" as const,
        data,
      },
    };
  });

  const promptText = `Bạn là một Đạo diễn Visual Effects, Giám đốc Nghệ thuật & Chuyên gia Motion Graphics hàng đầu.
Tôi cung cấp cho bạn chuỗi ${sampleFrames.length} khung hình trích xuất từ một video ngắn tham chiếu (tỉ lệ: ${meta.width}x${meta.height}, thời lượng ~${Math.round(meta.duration)} giây, ${meta.fps} FPS).

${notes ? `Ghi chú định hướng từ người dùng: "${notes}"\n` : ""}
${suggestedName ? `Tên phong cách gợi ý: "${suggestedName}"\n` : ""}

NHIỆM VỤ CỦA BẠN:
Giải phẫu ngược (Reverse Engineering) toàn bộ phong cách của video này và đóng gói thành một bộ Skill chuẩn Anthropic / Codex để hướng dẫn AI Agent dựng lại video theo đúng chuẩn này cho người dùng khác.

Hãy phân tích cực kỳ chi tiết 6 tầng:
1. HỆ MÀU & THỊ GIÁC (Color Palette): Mã màu HEX chính xác của màu nền, màu chữ chính, màu tương phản neon, màu viền thẻ, màu đổ bóng.
2. PHÂN TẦNG TYPOGRAPHY (2-Tier Kinetic Type): Cách chia chữ Lead text (chữ phụ) vs Hero keyword (từ chốt ý), tỉ lệ cỡ chữ, font pairing (Sans cực dày + Serif nghiêng nhấn cảm xúc).
3. BỐ CỤC & XẾP LỚP (Layering & Safe Zones): Vị trí chủ thể (người nói), lớp hậu cảnh (vòng sáng halo, ambient light sau đầu), lớp tiền cảnh (thẻ 3D, đạo cụ, icon), lề an toàn Reels/TikTok.
4. CÔNG THỨC CHUYỂN ĐỘNG (Motion & Spring Physics): Tốc độ nảy thẻ, độ zoom camera push-in, thông số spring physics (damping, stiffness, mass).
5. TIMELINE BREAKDOWN TỪNG GIÂY: Bóc tách diễn biến từng giây theo 4-7 chặng (Hook, Nỗi đau/Áp lực, Bước ngoặt, Quy trình các bước, Kêu gọi hành động CTA).
6. BẢN ĐỒ ÂM THANH (Sound Map): Các điểm rơi SFX (tiếng camera click, pop nảy thẻ, ding chuông thông báo, whoosh) và nhịp nhạc nền BPM.

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm văn bản dạo đầu hay kết luận ngoài JSON). Các trường markdown viết súc tích, đi thẳng vào các thông số kỹ thuật (HEX, font, spring, thời lượng giây):
{
  "name": "tên-skill-kebab-case",
  "description": "Mô tả ngắn 1-2 câu về phong cách này và khi nào nên dùng",
  "skillMarkdown": "Toàn bộ nội dung file SKILL.md bao gồm frontmatter --- name và description ---, các quyết định làm nên phong cách, quy trình thực hiện",
  "styleMarkdown": "Toàn bộ nội dung references/style.md với bảng màu HEX, kích cỡ font, lề an toàn",
  "timelineMarkdown": "Toàn bộ nội dung references/timeline-breakdown.md bóc tách chi tiết từng giây",
  "motionMarkdown": "Toàn bộ nội dung references/motion.md với công thức spring physics",
  "audioMarkdown": "Toàn bộ nội dung references/audio.md hướng dẫn SFX và nhạc nền",
  "soundCues": [
    { "timeSec": 0.5, "type": "whoosh", "description": "Pop chữ tiêu đề" }
  ]
}`;

  const anthropicKey = (process.env.ANTHROPIC_API_KEY ?? "").trim();
  const openrouterKey = (process.env.OPENROUTER_API_KEY ?? "").trim();
  const geminiKey = (process.env.GEMINI_API_KEY ?? "").trim();

  let rawResponseText = "";

  // 1. Thử gọi Anthropic API chính hãng nếu có ANTHROPIC_API_KEY
  if (anthropicKey) {
    const selectedModel = input.model?.includes("/") ? "claude-sonnet-5-5" : input.model || "claude-sonnet-5-5";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: [...imageContents, { type: "text", text: promptText }],
          },
        ],
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      rawResponseText = data.content?.[0]?.text || "";
    } else {
      const errText = await res.text();
      console.warn(`[VideoToSkill] Anthropic direct call failed (${res.status}): ${errText}`);
    }
  }

  // 2. Fallback sang OpenRouter Vision nếu Anthropic thất bại hoặc chỉ có OpenRouter
  if (!rawResponseText && openrouterKey) {
    const openrouterModel = "google/gemini-2.5-flash";
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          ...sampleFrames.map((framePath) => ({
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${fs.readFileSync(framePath).toString("base64")}`,
            },
          })),
        ],
      },
    ];

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openrouterModel,
          messages,
          max_tokens: 8192,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        rawResponseText = data.choices?.[0]?.message?.content || "";
      }
    } catch (err) {
      console.warn(`[VideoToSkill] OpenRouter call error:`, err);
    }
  }

  // 3. Fallback sang Google AI Studio chính thức nếu có GEMINI_API_KEY
  if (!rawResponseText && geminiKey) {
    const geminiModel = "gemini-2.5-flash";
    try {
      const parts = [
        { text: promptText },
        ...sampleFrames.map((framePath) => ({
          inline_data: {
            mime_type: "image/jpeg",
            data: fs.readFileSync(framePath).toString("base64"),
          },
        })),
      ];
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        rawResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        const errText = await res.text();
        console.warn(`[VideoToSkill] Gemini direct call failed (${res.status}): ${errText}`);
      }
    } catch (err) {
      console.warn(`[VideoToSkill] Gemini direct call error:`, err);
    }
  }

  if (!rawResponseText) {
    throw new HttpError(
      503,
      "AI_VISION_UNAVAILABLE",
      "Không thể kích hoạt mô hình AI Vision để phân tích chuỗi khung hình. Vui lòng kiểm tra lại GEMINI_API_KEY, ANTHROPIC_API_KEY hoặc OPENROUTER_API_KEY trong hệ thống.",
    );
  }

  const parsed = extractJsonFromText(rawResponseText);

  // Đảm bảo tên skill là kebab-case hợp lệ
  let validName = toKebabAscii(parsed.name || suggestedName || "video-style-extracted");
  if (!validName || !isKebabCase(validName)) {
    validName = `skill-${nanoid(6).toLowerCase()}`;
  }

  return {
    name: validName,
    description: parsed.description || "Phong cách dựng video được trích xuất bằng AI.",
    skillMarkdown: parsed.skillMarkdown || "",
    styleMarkdown: parsed.styleMarkdown || "",
    timelineMarkdown: parsed.timelineMarkdown || "",
    motionMarkdown: parsed.motionMarkdown || "",
    audioMarkdown: parsed.audioMarkdown || "",
    soundCues: Array.isArray(parsed.soundCues) ? parsed.soundCues : [],
  };
}

/**
 * Đóng gói toàn bộ tài liệu và khung hình vào kho .claude/skills/<skillName>/
 */
function packageAndRegisterSkill(
  data: ParsedStyleData,
  frames: string[],
): { skillDir: string; frameCount: number } {
  const targetDir = path.join(paths.skillsDir, data.name);
  const referencesDir = path.join(targetDir, "references");
  const framesDir = path.join(referencesDir, "frames");

  ensureDir(targetDir);
  ensureDir(referencesDir);
  ensureDir(framesDir);

  // 1. Viết SKILL.md
  let skillContent = data.skillMarkdown.trim();
  if (!skillContent.startsWith("---")) {
    skillContent = `---
name: ${data.name}
description: "${data.description.replace(/"/g, '\\"')}"
---

${skillContent}`;
  }
  fs.writeFileSync(path.join(targetDir, "SKILL.md"), skillContent, "utf8");

  // 2. Viết các tài liệu tham chiếu
  if (data.styleMarkdown) {
    fs.writeFileSync(path.join(referencesDir, "style.md"), data.styleMarkdown, "utf8");
  }
  if (data.timelineMarkdown) {
    fs.writeFileSync(path.join(referencesDir, "timeline-breakdown.md"), data.timelineMarkdown, "utf8");
  }
  if (data.motionMarkdown) {
    fs.writeFileSync(path.join(referencesDir, "motion.md"), data.motionMarkdown, "utf8");
  }
  if (data.audioMarkdown) {
    fs.writeFileSync(path.join(referencesDir, "audio.md"), data.audioMarkdown, "utf8");
  }
  if (data.soundCues && data.soundCues.length > 0) {
    fs.writeFileSync(
      path.join(referencesDir, "sound-cues.json"),
      JSON.stringify(data.soundCues, null, 2),
      "utf8",
    );
  }

  // 3. Sao chép chuỗi khung hình tham chiếu
  let copiedCount = 0;
  for (let i = 0; i < frames.length; i++) {
    const srcFile = frames[i];
    const fileName = `frame_${String(i + 1).padStart(2, "0")}.jpg`;
    fs.copyFileSync(srcFile, path.join(framesDir, fileName));
    copiedCount++;
  }

  // 4. Tạo manifest.json
  const manifest = {
    name: data.name,
    version: "1.0.0",
    created: nowIso(),
    description: data.description,
    source: "AI Video-to-Skill Reverse Engineering Engine",
    framesCount: copiedCount,
  };
  fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  return { skillDir: targetDir, frameCount: copiedCount };
}

/**
 * Entrypoint: Dịch ngược video (từ URL hoặc file) thành bộ Skill hoàn chỉnh
 */
export async function generateSkillFromVideo(
  input: VideoToSkillInput,
): Promise<VideoToSkillResult> {
  const jobId = `v2s-${nanoid(8)}`;
  const workDir = path.join(paths.runtime.tmp, "video-to-skill", jobId);
  const framesDir = path.join(workDir, "frames");
  ensureDir(workDir);

  const report = (step: number, total: number, msg: string) => {
    input.onProgress?.(step, total, msg);
  };

  try {
    let localVideoFile = "";

    // Bước 1: Tiếp nhận video
    report(1, 5, "Đang tiếp nhận và kiểm tra nguồn video...");
    if (input.videoSource.type === "url") {
      localVideoFile = path.join(workDir, "source.mp4");
      await downloadWithYtDlp(input.videoSource.url, localVideoFile);
    } else {
      localVideoFile = input.videoSource.filePath;
      if (!fs.existsSync(localVideoFile)) {
        throw new HttpError(400, "FILE_NOT_FOUND", "Không tìm thấy file video đã tải lên.");
      }
    }

    // Bước 2: Đọc thông số kỹ thuật
    report(2, 5, "Đang phân tích thông số kỹ thuật video...");
    const meta = await probeVideoMetadata(localVideoFile);

    // Bước 3: Trích xuất khung hình tiêu biểu
    report(3, 5, "Đang trích xuất chuỗi khung hình và bóc tách âm thanh...");
    const frames = await extractKeyframes(localVideoFile, framesDir, meta.duration, 16);
    if (frames.length === 0) {
      throw new HttpError(500, "NO_FRAMES", "Không thể trích xuất khung hình nào từ video nguồn.");
    }

    // Bước 4: AI Vision giải mã phong cách
    report(4, 5, "AI Vision đang giải phẫu hệ thống màu sắc, chữ và chuyển động...");
    const parsedData = await analyzeFramesWithVision({
      frames,
      meta,
      notes: input.notes,
      suggestedName: input.skillName,
      model: input.model,
    });

    // Bước 5: Đóng gói và lưu trữ
    report(5, 5, "Đang lập trình component và đăng ký bộ Skill mới...");
    const { skillDir, frameCount } = packageAndRegisterSkill(parsedData, frames);

    return {
      name: parsedData.name,
      description: parsedData.description,
      skillDir,
      frameCount,
      durationSec: meta.duration,
      width: meta.width,
      height: meta.height,
      fps: meta.fps,
      summary: `Đã phân tích video (${Math.round(meta.duration)}s, ${meta.width}x${meta.height}) và trích xuất thành công bộ Skill "${parsedData.name}" gồm ${frameCount} khung hình tham chiếu.`,
    };
  } finally {
    // Dọn dẹp thư mục tạm của job
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch {
      // Bỏ qua lỗi dọn dẹp tạm
    }
  }
}
