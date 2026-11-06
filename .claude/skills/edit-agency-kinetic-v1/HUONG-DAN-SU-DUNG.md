# Hướng dẫn sử dụng Skill Edit Agency Kinetic V1

Đây là gói Skill + Cẩm nang thiết kế + Thư viện component Remotion React chuyên dựng video ngắn dạng dọc (9:16) theo phong cách **Agency Kinetic & Visual Storytelling** (tham chiếu từ `@prime_animator`).

---

## 1. Cài đặt cho Codex / Antigravity / AI Agent

1. Chép toàn bộ thư mục `edit-agency-kinetic-v1` vào thư mục `skills/` của AI Agent (hoặc mở trực tiếp thư mục này trong IDE của bạn).
2. Tải lại phiên làm việc để hệ thống nhận diện file `SKILL.md`.

---

## 2. Mẫu câu lệnh gọi Skill (Prompts)

### Khi muốn dựng video hoàn chỉnh từ video quay thô của bạn:
> "Dùng $edit-agency-kinetic-v1 dựng video này giúp tôi. Giữ nguyên giọng nói và thông điệp. Sử dụng phong cách kinetic typography 2 tầng chữ trắng + xanh chanh neon, thêm vòng sáng halo sau đầu, lớp phủ REC máy quay ở đoạn nói về áp lực quay, bộ 4 thẻ quy trình [Tên bước 1, Bước 2, Bước 3, Bước 4] và thanh CTA dạng Dynamic Island ở cuối video."

### Khi chỉ muốn phân tích kịch bản và lập Edit Map trước:
> "Dùng $edit-agency-kinetic-v1 phân tích video thô này của tôi: bóc tách lời thoại, xác định các điểm rơi từ khóa (Hook, Pain point, Solution, CTA) và lập bảng phân bổ visual motion tương ứng. Chưa cần xuất video."

### Khi muốn tùy biến màu sắc thương hiệu riêng:
> "Dùng $edit-agency-kinetic-v1 nhưng đổi màu nhấn từ Xanh chanh neon (#CCFF00) sang Cam neon (#FF6B00) để đồng bộ với nhận diện thương hiệu của tôi. Giữ nguyên cấu trúc thẻ 3D và typography."

---

## 3. Cấu trúc các thành phần trong gói

- **`SKILL.md`**: Bộ quy tắc ứng xử và kim chỉ nam kỹ thuật cho AI Agent.
- **`references/`**:
  - `style.md`: Bảng thông số canvas (1080×1920), mã màu HEX, kích cỡ font chữ, lề an toàn Reels/TikTok.
  - `timeline-breakdown.md`: Bóc tách chi tiết từng giây của video mẫu tham chiếu.
  - `motion.md`: Hướng dẫn công thức chuyển động spring physics, độ nảy thẻ, tốc độ zoom camera.
  - `camera-masking.md`: Kỹ thuật tách nền (rotoscoping) xếp lớp layer trước/sau người nói.
  - `audio.md` & `sound-cues.json`: Bản đồ âm thanh (SFX shutter, pop, notification, beat nhạc).
  - `qa.md`: Bảng kiểm tra chất lượng trước khi bàn giao video.
  - `reference-video.mp4` & thư mục `frames/`: Video và chuỗi 23 khung hình trích xuất mẫu để tham chiếu.
- **`assets/remotion-starter/`**:
  - Mã nguồn React/Remotion chạy độc lập để lập trình và render video tự động.
  - Chứa sẵn các component: `KineticText.tsx`, `HaloLight.tsx`, `RecViewfinder.tsx`, `WorkflowCards.tsx`, `DynamicIslandCTA.tsx`.
- **`scripts/`**:
  - `validate_package.py`: Script kiểm tra tính toàn vẹn và mã băm SHA-256 của toàn bộ gói.

---

## 4. Lưu ý quan trọng
- Video mẫu đi kèm (`reference-video.mp4`) là tài liệu chứng minh phong cách thị giác và chuyển động. Khi áp dụng cho dự án mới, hãy thay thế bằng chân dung, video và thông điệp kinh doanh thật của bạn.
- Đảm bảo môi trường máy tính đã cài đặt **Node.js** và **npm** để có thể chạy thử nghiệm hoặc render mã Remotion trong `assets/remotion-starter`.

