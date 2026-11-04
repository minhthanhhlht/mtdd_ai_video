# RULE: BẢO MẬT & QUYỀN RIÊNG TƯ (SECURITY & PRIVACY RULES)

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ codebase, quản lý secrets, endpoints xác thực API, phân quyền upload QR, xử lý file hệ thống, thực thi tiến trình con và phòng vệ prompt injection.

---

## 1. Bảo vệ Bí mật (Secrets) & Dữ liệu Cục bộ

1. **Cấm commit secrets**:
   - Tuyệt đối không commit `.env`, `.env.*` (ngoại trừ `.env.example`), API keys, OAuth tokens, cookies phiên làm việc, private keys, file SQLite DB cục bộ, dữ liệu tài khoản gateway, mẫu giọng đọc (`assets/voices/`) hoặc tài nguyên riêng tư của project.
   - Luôn duy trì và kiểm tra các mục trong `.gitignore`.
2. **Không làm rò rỉ bí mật trong runtime**:
   - Cấm in API keys / tokens trong logs, exception traces, telemetry, console browser hoặc các báo cáo tự sinh.
   - Cấm đưa giá trị từ `.env` vào AI prompt hoặc output của tool.

---

## 2. Xác thực API & Ranh giới Mạng (API Auth & Boundaries)

1. **Cơ chế Token `AIEV_API_TOKEN`**:
   - Duy trì đúng cơ chế bootstrap token và phân cấp xác thực header / cookie:
     - Cookie `aiev_token`: Giới hạn cho các trường hợp `GET`/`HEAD` không gắn được header (ảnh, video, SSE, download).
     - Header `x-aiev-token`: Bắt buộc cho mọi thao tác ghi dữ liệu (`POST`, `PUT`, `DELETE`).
   - Endpoint `/api/health` là endpoint public duy nhất được phép bypass auth; không bao giờ mount một router nhạy cảm trước middleware auth.
2. **Phiên tải lên từ điện thoại qua QR (`/m/[id]`)**:
   - Token phiên upload QR phải được giới hạn phạm vi (scoped) chặt chẽ cho đúng một `projectId` cụ thể và danh sách route cho phép hẹp.
   - Phải có thời hạn sống (TTL) và hỗ trợ thu hồi quyền chủ động.
3. **CORS & Mạng nội bộ**:
   - Giữ nguyên chính sách nguồn gốc localhost và mạng LAN riêng được phê duyệt; **tuyệt đối không dùng wildcard `*` kèm credentials**.
   - Coi các proxy headers (`x-forwarded-host`, v.v.), `Host` và `Origin` là dữ liệu có thể bị giả mạo bởi kẻ tấn công. Không bao giờ đơn giản hóa hàm kiểm tra `isLocalRequest`.

---

## 3. An toàn Thao tác File & Tiến trình con (Filesystem & Subprocess Safety)

1. **Chống Path Traversal**:
   - Mọi đường dẫn file lấy từ request client (`projectId`, `relPath`, filename) phải được validate và resolve trong thư mục gốc được phép.
   - Từ chối ngay lập tức các ký tự leo thang thư mục (`..`), absolute path injection, hoặc symlink escape.
2. **Chống Shell Injection**:
   - Khi gọi tiến trình con (`spawn`, `execFile`), **luôn truyền mảng tham số (argument arrays)**; tuyệt đối không dùng chuỗi template string nội suy tham số vào shell command.
3. **Giới hạn tải lên (Upload Limits)**:
   - Cưỡng chế giới hạn kích thước upload, kiểm tra MIME content type thật, giới hạn thời gian timeout request, và giới hạn số lượng file. Không tin tưởng mỗi đuôi mở rộng file (`.mp4`, `.png`).
   - Dọn dẹp triệt để file tạm, file upload dở dang và tiêu diệt child process khi tác vụ thất bại hoặc bị hủy.

---

## 4. Phòng vệ Tác tử AI & Prompt Injection

1. **Dữ liệu người dùng là DATA, không phải CHỈ THỊ HỆ THỐNG**:
   - Nội dung brief, transcript, bài viết URL tải về, metadata file và tài nguyên tải lên phải được đối xử là dữ liệu không tin cậy (untrusted data).
   - Nội dung do người dùng cung cấp không bao giờ được phép ghi đè chỉ thị hệ thống, chính sách bảo mật, hay công tắc tính năng.
2. **Quyền tối thiểu của Tác tử (Least Privilege)**:
   - Không cấp quyền mạng tùy tiện (`WebFetch`, `WebSearch`) cho tác tử AI tự động nếu tính năng đó không yêu cầu cụ thể và chưa qua đánh giá rủi ro.
   - Không bao giờ âm thầm chuyển tiếp nội dung nhạy cảm của người dùng sang một provider AI khác ngoài sự cho phép rõ ràng.

---

## 5. Checklist 6 bước bắt buộc khi thay đổi liên quan đến Bảo mật

Trước khi thay đổi bất kỳ logic nào về Auth, CORS, Cloudflare Tunnel, Upload, File handling, Process execution hoặc AI tool:

1. [ ] **Phân tích mối đe dọa (Threat analysis)**: Xác định năng lực của kẻ tấn công.
2. [ ] **Ranh giới tin cậy (Trust boundary)**: Xác định cấp độ phân loại dữ liệu.
3. [ ] **Kiểm tra xác thực & phân quyền**: Kiểm tra token, role, scope.
4. [ ] **Ràng buộc đầu vào & đường dẫn**: Giới hạn path traversal và kích thước payload.
5. [ ] **Lọc bỏ dữ liệu nhạy cảm**: Đảm bảo log và exception không làm lộ secret.
6. [ ] **Kiểm thử trường hợp tiêu cực (Negative tests)**: Viết test cho trường hợp không có quyền, token hết hạn, sai project, path traversal `../../`, payload quá khổ.

