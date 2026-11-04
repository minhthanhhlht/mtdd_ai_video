# BÁO CÁO KIỂM TOÁN MÃ NGUỒN (SOURCE AUDIT REPORT)

> **Tài liệu tham chiếu**: Báo cáo kiểm toán kiến trúc, nhận diện các thế mạnh và các điểm rủi ro kỹ thuật cần bảo vệ trong AIEVv2.

---

## 1. Phát hiện Kiến trúc quan trọng

1. **Monorepo đa Workspace**: Next.js (`apps/web`), Express (`apps/server`) và Remotion (`engines/remotion`) là các npm workspace riêng biệt được điều phối qua root `package.json`.
2. **Cổng giao tiếp**: Web chạy port 6868; Backend chạy 6869. Next.js tự rewrite `/api/*` và `/media/*` sang backend, đồng thời tồn tại các kết nối trực tiếp phục vụ tải file LAN từ điện thoại.
3. **Thứ tự Middleware Backend là vùng nhạy cảm bảo mật**: Cấu hình tập trung tại `apps/server/src/index.ts`. Tuyệt đối không thay đổi thứ tự middleware làm hở bảo mật.
4. **Trạng thái Project do Filesystem quản lý**: File `video-projects/<id>/meta.json` là nguồn sự thật duy nhất. SQLite không phải là nơi lưu trữ thay thế cho cấu trúc project.
5. **HyperFrames & Remotion phân vai rạch ròi**: HyperFrames (HTML/GSAP) tạo scene đơn lẻ; Remotion lắp ráp toàn bộ timeline; render cuối cùng thuộc quyền kiểm soát của backend queue.
6. **Tác tử AI sử dụng Claude Agent SDK**: Quyền truy cập công cụ bị giới hạn cục bộ (restricted tools). Cơ chế resume và xử lý ngắt phiên cần được giữ nguyên.
7. **Hệ thống Thiết kế Web có Tool kiểm tra tự động**: Sử dụng CSS tokens, thang chữ 3 bậc, primitives chuẩn và có script `check-design-system.mjs` cưỡng chế.
8. **Trình biên tập Editor là bề mặt công cụ chuyên biệt**: Có mô hình trạng thái, lịch sử, tính toán frame math và hệ thống track locks độc lập.
9. **Dữ liệu người dùng được bảo vệ nghiêm ngặt qua `.gitignore`**: Các file cá nhân, database SQLite, video render, giọng mẫu không bao giờ được lọt vào Git.

---

## 2. Thế mạnh cần gìn giữ (Strengths to Preserve)

- File `CLAUDE.md` gốc chứa các quy tắc bất biến quan trọng và phải luôn được coi là tài liệu chuẩn.
- `apps/web/AGENTS.md` cảnh báo rõ ràng về các thay đổi API của Next.js 16.
- `docs/API.md` là hợp đồng giao tiếp duy nhất giữa Web và Backend.
- Script `check-design-system.mjs` giúp tự động phát hiện lệch chuẩn UI bằng máy đếm.
- Hệ thống Tokens CSS hỗ trợ đồng nhất cả 2 theme Light và Dark cũng như màu sắc các track timeline.
- Hàng đợi Render Queue, SSE, Metadata, Agent và Render engine được tách bạch trách nhiệm rõ ràng.
- File `.gitignore` bảo vệ triệt để dữ liệu người dùng, bí mật môi trường và tài nguyên render.

---

## 3. Các điểm rủi ro kỹ thuật & Khuyến nghị khắc phục (Gaps & Remedies)

1. **Khoảng trống về tự động hóa kiểm thử (Test Automation Gap)**:
   - *Rủi ro*: Kho mã nguồn có rất ít file unit test tự động. CI chủ yếu chỉ chạy `typecheck`, `audit` và `build`, không chạy test tự động và không render video.
   - *Khuyến nghị*: Duy trì việc chạy unit test của Remotion (`npm test`), chạy checker design system và i18n trước khi commit. Mọi thay đổi pipeline bắt buộc phải render draft thực tế và xem bằng mắt.
2. **Bề mặt tính năng rộng lớn (Broad Surface Area)**:
   - *Rủi ro*: Hệ thống có 19 routes web, hàng chục route API, 20 AI skills và nhiều chế độ pipeline. Rất dễ xảy ra tình trạng cập nhật một chỗ nhưng quên cập nhật API docs, locales, guide panel hoặc skills.
   - *Khuyến nghị*: Tuân thủ nghiêm ngặt quy trình 6 bước trong [`rules/10-feature-workflow/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/10-feature-workflow/RULE.md).
3. **Tiến hóa Metadata & Hợp đồng (Contract & Metadata Evolution)**:
   - *Rủi ro*: `meta.json` là trung tâm của Editor, Agent và Render. Bất kỳ thay đổi schema nào cũng có thể làm hỏng các project cũ của người dùng.
   - *Khuyến nghị*: Luôn bảo tồn các trường lạ (`unknown fields`) và kiểm tra tính tương thích ngược khi sửa logic đọc/ghi metadata.
4. **Kiểm định Video không thể dựa vào CI (Render Validation is Not CI-Covered)**:
   - *Rủi ro*: CI trên GitHub không có FFmpeg, không có GPU và không có Chromium render video thật. Build xanh không đồng nghĩa với video render ra đẹp.
   - *Khuyến nghị*: Bắt buộc phải trích xuất ảnh tĩnh bằng ffmpeg và xem bản draft thực tế trước khi phát hành release.

