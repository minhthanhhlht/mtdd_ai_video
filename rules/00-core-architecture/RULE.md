# RULE: CỐT LÕI KIẾN TRÚC HỆ THỐNG (CORE ARCHITECTURE)

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ cấu trúc dự án `AIEVv2`, cách phân tầng, kết nối mạng giữa các service, quản lý thư mục runtime và quy ước chạy trên môi trường Windows / Linux / macOS.

---

## 1. Mô hình 3 tầng phân vai nghiêm ngặt (Strict 3-Tier Architecture)

Tuyệt đối tuân thủ phân vai sau — **KHÔNG BAO GIỜ TRỘN LẪN VAI TRÒ**:

```
┌────────────────────────────────────────────────────────┐
│  Web UI (Next.js, Port 6868)                           │
│  - Dashboard quản lý, cấu hình, kết nối                │
│  - Trình biên tập Video (/projects/[id]/editor):       │
│    Xem trước thời gian thực bằng Remotion Player       │
│  - TUYỆT ĐỐI KHÔNG MÃ HÓA HOẶC RENDER VIDEO Ở CLIENT   │
└───────────────────────┬────────────────────────────────┘
                        │ REST + SSE/WebSocket (web rewrites /api/*, /media/*)
┌───────────────────────┴────────────────────────────────┐
│  Backend API & Coordinator (Node.js/Express, Port 6869)│
│  - Điều phối tác tử: Claude Agent SDK headless         │
│  - Render queue tuần tự theo project, giới hạn song song│
│  - SQLite (better-sqlite3): Quản lý jobs & chat        │
│  - File system: meta.json là nguồn sự thật dự án       │
└───────┬────────────────────────────────────────┬───────┘
        │                                        │
┌───────┴───────────────┐        ┌───────────────┴───────┐
│ HyperFrames           │        │ Remotion              │
│ SCENE ENGINE          │        │ ASSEMBLER             │
│ HTML + GSAP           │───────▶│ Lắp scene + footage   │
│ Render từng scene MP4 │ MP4/   │ + audio ducking + sfx │
│ / frames ra renders/  │ frames │ → Video hoàn chỉnh    │
└───────────────────────┘        └───────────────────────┘
```

### Nguyên tắc phân chia công việc:
1. **HyperFrames làm gì giỏi thì để nó làm**: Kinetic typography, karaoke text di chuyển theo lời bài hát, đếm số (counter), motion graphics phức tạp, shader, hiệu ứng đồ họa HTML/CSS/GSAP.
2. **Remotion làm gì giỏi thì để nó làm**: Ghép các sequence, cắt cúp video gốc (footage), tạo chuyển cảnh (transition), hòa âm (mix narration, ducking nhạc nền, sound effects theo frame), đóng dấu watermark, xuất file MP4 cuối cùng.
3. **Agent AI là đạo diễn**: Điều phối cả hai thông qua CLI + file — toàn bộ tác vụ đều phải thực thi qua code và queue, không làm tắt.
4. **Trình duyệt chỉ XEM TRƯỚC (Preview)**: Tuyệt đối không nhúng logic ffmpeg.wasm hay render video client-side. Mọi thao tác xuất file đều chuyển thành Job gửi về Backend Render Queue.

---

## 2. Quy ước Port & Mạng nội bộ

| Thành phần | Port | Ghi chú vận hành |
|---|---|---|
| **Web UI** (Next.js) | **6868** | Cổng duy nhất người dùng truy cập: `http://localhost:6868`. Chạy trên host `0.0.0.0` để hỗ trợ quét QR tải file từ điện thoại qua mạng LAN. |
| **Backend API** (Express) | **6869** | Cổng nội bộ. Web Next.js tự động rewrite `/api/*` và `/media/*` sang `http://localhost:6869`. |
| **HyperFrames Studio Preview** | **3002** | Nội bộ, chỉ bật khi cần soi scene chi tiết bằng mắt. |
| **Remotion Studio** | **3000** | Nội bộ, chỉ bật khi debug cấu trúc composition lắp ráp. |

---

## 3. Phân lập thư mục Runtime (`.runtime/`) — Cấm xả rác ổ C:

Mọi tiến trình render, mô hình AI tải về, virtualenv Python phải được gom gọn trong `<repoRoot>/.runtime/`, tuyệt đối không ghi tràn lan ra thư mục `AppData` hay `C:\Users\...\.cache`:

```
<repoRoot>/.runtime/
  ├── tmp/              # Thư mục tạm cho mọi tiến trình con (TEMP / TMP / TMPDIR)
  ├── models/           # HF_HOME & HUGGINGFACE_HUB_CACHE (Whisper, VieNeu)
  ├── venv/             # Virtualenv Python dùng chung (faster-whisper, vieneu)
  ├── bin/              # Binary tải tự động (ffmpeg, cloudflared)
  ├── pip-cache/        # PIP_CACHE_DIR
  ├── venv-gateway/     # Virtualenv riêng cho gateway tạo ảnh (Python >= 3.13)
  ├── chatgpt-gateway/  # Dữ liệu SQLite tài khoản & session ChatGPT
  └── gemini-web/       # Cache cookie Google của gemini-webapi
```

### Quy tắc bất biến:
- Luôn sử dụng hàm `paths.runtime.*` trong `apps/server/src/config.ts`.
- Mọi tiến trình con (`child_process.spawn`) phải lấy biến môi trường từ `childEnv()`. Hàm này nhân bản `process.env` và ghi đè `TEMP`, `TMP`, `TMPDIR`, `HF_HOME`, `PIP_CACHE_DIR`.
- **TUYỆT ĐỐI KHÔNG GHI ĐÈ `process.env` CỦA SERVER CHÍNH**.

---

## 4. Tương thích môi trường & Đường dẫn Windows

1. **Đường dẫn tệp tin**:
   - Luôn sử dụng `path.join(...)` hoặc `path.resolve(...)`.
   - Tuyệt đối không hardcode dấu phân cách `/` hoặc `\` trong logic chuỗi đường dẫn.
   - Khi format URL hiển thị trên web, chuyển đổi chuẩn hóa: `relPath.replace(/\\/g, "/")`.
2. **Hệ điều hành Windows**:
   - Mọi script khởi động hoặc tự động hóa phải chạy trơn tru trên **PowerShell** (`start/start.ps1`, `update/update.ps1`).
   - Môi trường máy chủ yêu cầu: **Node >= 22.23.4**, **FFmpeg trên PATH**, **Chrome/Chromium mới nhất** (phục vụ headless render cho cả HyperFrames và Remotion).

---

## 5. Nguồn sự thật duy nhất (Single Source of Truth)

- **Thông tin cấu trúc Video**: Nằm tại `video-projects/<id>/meta.json`. File này quyết định toàn bộ kích thước, fps, danh sách `scenes[]`, âm thanh `audio`, phụ đề `subtitles`, watermark.
- **Cơ sở dữ liệu SQLite (`apps/server/src/db.ts`)**: CHỈ lưu trữ trạng thái hàng đợi `jobs`, lịch sử chat `chat_messages`, phiên làm việc `chat_sessions`, và cache metadata.
- **Không bao giờ suy diễn trạng thái**: Web UI không tự quyết định video render xong hay chưa từ các file vụn trên đĩa; Web UI phải hỏi Backend API hoặc nghe stream SSE từ server.

