# RULE: HỆ THỐNG KỸ NĂNG & TÁC TỬ AI (SKILLS & AI AGENTS)

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ thư mục `.claude/skills/`, logic khởi tạo prompt trong `apps/server/src/editPrompt.ts`, và tiến trình điều phối tác tử tại `apps/server/src/agent.ts`.

---

## 1. Cấu trúc và Quy chuẩn viết Skill (Skill Authoring Standards)

1. **Cấu trúc thư mục**:
   - Mỗi kỹ năng là một thư mục riêng biệt nằm trong `.claude/skills/<ten-skill>/` chứa file chính `SKILL.md`.
   - Phần đầu (Frontmatter) bắt buộc có định dạng YAML:
     ```markdown
     ---
     name: ten-skill-kebab-case
     description: Mô tả ngắn gọn 1-2 câu về vai trò, khi nào kích hoạt và nhiệm vụ chính.
     ---
     ```
2. **Quy định về Ngôn ngữ**:
   - Nội dung hướng dẫn kỹ thuật trong `SKILL.md` **BẮT BUỘC VIẾT BẰNG TIẾNG ANH** (để mô hình AI hiểu sâu sắc và chính xác nhất các mệnh lệnh logic).
   - Ngoại lệ: Các chuỗi văn bản mẫu mang tính đặc thù tiếng Việt (ví dụ: các từ có dấu để minh họa lỗi font, từ đệm filler như "ừm/à/kiểu") thì giữ nguyên tiếng Việt.
   - Nội dung video, kịch bản, và giao diện Web UI hiển thị cho người dùng vẫn là **Tiếng Việt**.
3. **Tham khảo chuẩn trước khi tạo mới**:
   - Trước khi tạo thêm bất kỳ skill mới nào, phải đọc kỹ hướng dẫn tại `.claude/skills/skill-authoring/SKILL.md`.

---

## 2. Nguyên tắc tích lũy tri thức sau sửa lỗi (Accumulate Know-How)

> **Phương châm cốt lõi**: "Không bao giờ để kinh nghiệm và bài học sửa lỗi chết chìm trong cửa sổ chat."

- Mỗi khi khắc phục thành công một lỗi kỹ thuật trong thực tế sản xuất (ví dụ: lỗi font chữ gradient vỡ dấu, lỗi lệch sync âm thanh, lỗi PATH của FFmpeg trên Windows, lỗi safe-area của TikTok):
  - **BẮT BUỘC PHẢI CẬP NHẬT NGAY** bài học và cách giải quyết vào `SKILL.md` của skill liên quan.
  - Thư viện skills chính là tài sản trí tuệ tích lũy theo thời gian của hệ thống AIEV.

---

## 3. Quy trình Bàn giao từ Trình chỉnh sửa ("Giao cho AI" - Handoff Flow)

Khi người dùng nhấn "Giao cho AI" từ màn hình Editor (`POST /api/projects/:id/editor/handoff`):

1. **Bảo vệ bằng bản chụp (Snapshot Revision)**:
   - Server tự động tạo bản chụp lịch sử `ai-before` trước khi AI bắt đầu làm việc. Người dùng có thể hoàn tác toàn bộ phiên chạy của AI chỉ bằng 1 cú click chuột.
2. **Tôn trọng 100% các chỉnh sửa thủ công của người dùng**:
   - Phải đọc lại `meta.json` trước khi thực hiện thao tác.
   - Tuyệt đối giữ nguyên thứ tự scene, các mốc cắt ghép (`from`, `to`), các cue karaoke đã sửa, các sound effect đã đặt, và các thuộc tính v2 (`layers[]`, `keyframes`, `fit`, `crop`, `color`, `speed`, `transition`).
   - Không được tự tiện xóa sạch các composition HyperFrames đang có để dựng lại từ đầu; chỉ chỉnh sửa đúng scene cần thiết.
3. **Không làm lại các bước đã hoàn tất**:
   - Nếu footage đã được Auto Cut xong (đã có `assets/auto-trim-report.json`), không chạy cắt lại.
   - Nếu phụ đề hoặc nhạc nền đã được chọn, chỉ tập trung giải quyết đúng câu lệnh bổ sung của người dùng.

---

## 4. Quản lý Skills trên Giao diện Web UI

- Người dùng có thể xem danh sách, chỉnh sửa, tạo mới hoặc nhân bản (clone) các skill trực tiếp tại trang **Skills** (`/skills`) trên Web UI.
- Bản chất của tính năng này là các thao tác CRUD đọc/ghi file markdown trực tiếp qua Backend API (`apps/server/src/routes/skills.ts`).
- Thay đổi trong skill có hiệu lực ngay ở phiên chạy tiếp theo của AI mà không cần khởi động lại máy chủ.

