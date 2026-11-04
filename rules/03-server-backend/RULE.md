# RULE: BACKEND API, RENDER QUEUE & DATABASE (SERVER BACKEND)

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ mã nguồn trong `apps/server/src/`, các route trong `routes/`, các job trong `jobs/`, và tài liệu hợp đồng tại `docs/API.md`.

---

## 1. Chuẩn mực API Contract & Định dạng phản hồi

Hợp đồng duy nhất giữa `apps/web` và `apps/server` được ghi tại `docs/API.md`. Mọi thay đổi về endpoint hoặc payload **BẮT BUỘC** phải cập nhật `docs/API.md` trước:

1. **Chuẩn JSON & Mã lỗi**:
   - Luôn trả UTF-8 JSON.
   - Khi có lỗi, trả đúng định dạng chuẩn:
     ```json
     {
       "error": {
         "code": "INVALID_TIMELINE",
         "message": "Chi tiết lỗi bằng tiếng Việt hoặc tiếng Anh rõ ràng"
       }
     }
     ```
   - Đi kèm HTTP status tương ứng (400, 401, 403, 404, 409, 500).
   - Đối với lỗi có dữ liệu cấu trúc bổ sung (như `issues` khi validate Zod, `current` khi xung đột phiên bản), truyền qua `HttpError(status, code, message, extra)` để đặt ngang hàng với `error`.
2. **Quy ước định danh (IDs)**:
   - Job ID: `job_<nanoid>`.
   - Chat session ID: `sess_<nanoid>`.
   - Project ID: Luôn là chuỗi `kebab-case` trùng với tên thư mục trong `video-projects/`.
   - Mốc thời gian: Chuỗi ISO 8601 UTC.

---

## 2. Bảo mật Localhost & Xác thực Token

Hệ thống bảo vệ nghiêm ngặt chống tấn công CSRF hoặc DNS Rebinding từ các trang web độc hại khác:

- **Kiểm tra yêu cầu nội bộ (`isLocalRequest` trong `util.ts`)**:
  - Socket phải là Loopback (`127.0.0.1` hoặc `::1`).
  - Không có header proxy lạ (chặn spoofing).
  - Header `Host` phải là `localhost` hoặc `127.0.0.1`.
  - Chặn request có `Sec-Fetch-Site: cross-site`.
- **Cơ chế Token 2 tầng**:
  - `aiev_token` Cookie (HttpOnly, SameSite=Strict): Dùng cho các request `GET`/`HEAD` không gắn được header (ảnh `<img>`, video `<video>`, EventSource SSE, link tải file).
  - Header `x-aiev-token`: **Bắt buộc** cho mọi thao tác ghi dữ liệu (`POST`, `PUT`, `DELETE`).

---

## 3. Hàng đợi Render tuần tự & Khóa an toàn (Render Queue)

File phụ trách: `apps/server/src/queue.ts` và `apps/server/src/jobRules.ts`.

1. **Giới hạn song song (`QUEUE_CONCURRENCY`)**:
   - Mặc định là 2 (cấu hình qua biến môi trường).
   - **QUY TẮC SỐNG CÒN**: Hai job của **CÙNG MỘT PROJECT** không bao giờ được phép chạy đồng thời! Chạy song song chỉ được áp dụng giữa các project khác nhau. Quy tắc này ngăn chặn triệt để tình trạng ghi đè hỏng `meta.json` hoặc xung đột file tạm render.
2. **Luật Draft luôn trước Final**:
   - Backend chủ động từ chối mọi job `*-final` (`scene-final`, `assemble-final`) bằng mã lỗi `409 DRAFT_REQUIRED` nếu project chưa từng có bản `assemble-draft` thành công tương ứng.
3. **Cổng kiểm định QC bắt buộc (Automated QC Gate)**:
   - Job `assemble-final` (lắp ráp xuất bản cuối) **bị từ chối ngay lập tức** với mã `409 QC_REQUIRED` hoặc `409 QC_FAILED` nếu chưa có báo cáo QC đạt chuẩn (`status: "pass"`) trên đúng file `outputs/<id>-draft.mp4`.
   - Báo cáo QC bị cũ (file draft bị sửa sau khi đo) cũng bị từ chối với `409 QC_REQUIRED`.
4. **Đẩy trạng thái thời gian thực qua Server-Sent Events (SSE)**:
   - Mọi tiến độ % khung hình đọc từ CLI của HyperFrames / Remotion phải được parse và broadcast ngay qua kênh SSE để Web UI cập nhật trực tiếp.

---

## 4. Cưỡng chế công tắc Brief ở tầng Server (Brief Switch Enforcement)

> **Luật quan trọng**: Công tắc trong Brief là công tắc THẬT. Tắt là phải chặn từ Server!

1. Nếu `brief.autoCut = false`: Endpoint `POST /api/projects/:id/auto-trim/apply` và job `auto-trim` **phải ném lỗi 409 AUTO_CUT_DISABLED**.
2. Nếu `brief.autoIllustrations = false`: Endpoint `POST /api/illustrations` **phải ném lỗi 409 ILLUSTRATIONS_DISABLED**.
3. Prompt bàn giao cho AI phải in rõ ràng cả hai chiều **BẬT** và **TẮT** của mọi tùy chọn. Không bao giờ im lặng khi công tắc bị tắt.

---

## 5. Quản lý Cơ sở dữ liệu SQLite & File System

1. **SQLite (`better-sqlite3`) trong `apps/server/src/db.ts`**:
   - Chỉ lưu trữ: Bảng `jobs`, `chat_sessions`, `chat_messages`, `metrics`, và cache phụ.
   - Thao tác đồng bộ, an toàn, hiệu năng cao.
2. **File System là nguồn sự thật cho Project**:
   - Cấu trúc video, các scene, các track âm thanh nằm hoàn toàn tại `video-projects/<id>/meta.json`.
   - SQLite không lưu bản sao của cấu trúc video. Muốn đọc thông tin video, luôn gọi hàm `readMeta(projectId)` từ `apps/server/src/meta.json`.

---

## 6. Môi trường Thực thi Tiến trình Con (Child Process Isolation)

- Khi gọi lệnh thực thi bên ngoài (`spawn`, `exec`), luôn sử dụng `childEnv()` từ `apps/server/src/config.ts`.
- Thứ tự tìm kiếm Python thực thi (`transcribe.ts`, `ttsLocal.ts`):
  `PYTHON_BIN` (luôn ưu tiên số 1) → `.runtime/venv` → `PYTHON` → `python` / `py` / `python3`.

