# ANTIGRAVITY / GEMINI AI PAIR PROGRAMMING RULES — AIEVv2

> **BẮT BUỘC ĐỌC VÀ TUÂN THỦ**: Dự án này (AIEVv2 — AI Edit Video by noti.vn) có cấu trúc kiến trúc và hệ thống thiết kế cực kỳ chặt chẽ.
> Mọi thay đổi code hoặc tính năng mới khi thực hiện **BẮT BUỘC PHẢI TUÂN THỦ** các bộ RULE được lưu trữ tại thư mục [`rules/`](file:///d:/AI/mtdd_ai_video/rules/README.md).
> Tuyệt đối không được làm chệch hướng cấu trúc, không phá vỡ UI/UX, không vi phạm thang chữ 3 bậc, và không bỏ qua quy trình kiểm soát chất lượng video.
> Mọi thay đổi code phải được ghi chép chi tiết vào `SESSION_LOG.md` để bảo toàn ngữ cảnh làm việc cho các phiên sau.
> **LUẬT THÉP**: "Do No Harm" — Tuyệt đối không làm hỏng tính năng đang chạy tốt khi thêm tính năng mới hoặc sửa bug.

---

## Danh mục các bộ RULE bắt buộc đọc trước khi code:

1. **Kiến trúc tổng thể & Môi trường**: [`rules/00-core-architecture/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/00-core-architecture/RULE.md)
   - 3 tầng phân vai: Web UI (port 6868), Backend Express (port 6869), HyperFrames (Scene engine) & Remotion (Assembly engine).
   - Tuyệt đối cấm render/mã hóa video ở browser.
   - Thư mục `.runtime/` tập trung, cấm ghi rác ra ổ C:. Luôn dùng `childEnv()` cho tiến trình con.

2. **Giao diện Web UI & UX**: [`rules/01-web-ui-ux/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/01-web-ui-ux/RULE.md)
   - Thang chữ 3 bậc: `text-sm` (14px mặc định), `text-meta` (13px), `text-xs` (12px badge/th). CẤM các cỡ chữ tùy ý khác.
   - Nhịp khoảng cách: 4/8/12/16/24px (`gap-1, 2, 3, 4, 6`; `p-2, 3, 4`). `<PageHeader>` không có `mb-4`.
   - CẤM mã màu hex, cấm class màu Tailwind (`text-white`, `bg-gray-100`). 100% dùng Design Tokens (`--primary`, `--bg`, `--surface`, `--border`...). Màu `--primary` hiện tại là Xanh dương (`#2563eb`).
   - Bắt buộc dùng primitives: `<Button>`, `<IconButton>`, `<Card>`, `<Panel>`, `<Field>`, `<Badge>`, `<Banner>`, `<Skeleton>`, `<Toolbar>`, `<EmptyState>`. Cấm tự viết lại bằng Tailwind thô.
   - Luôn hỗ trợ song ngữ `t()` (`locales/vi.ts` và `locales/en.ts`).
   - Cưỡng chế tự động: `node apps/web/scripts/check-design-system.mjs`.

3. **Trình biên tập Video (Editor)**: [`rules/02-video-editor/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/02-video-editor/RULE.md)
   - Trình duyệt chỉ xem trước bằng Remotion Player. `meta.json` là nguồn sự thật duy nhất.
   - Mọi thay đổi timeline là hàm thuần khiết trong `ops.ts`, bảo toàn 100% các trường lạ (preserve unknown fields).
   - Khớp khung hình frame-for-frame với `timing.ts`.
   - Phím tắt, track locks, bọc `EditorErrorBoundary`.

4. **Backend API, Render Queue & DB**: [`rules/03-server-backend/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/03-server-backend/RULE.md)
   - API contract tại `docs/API.md`. Mã lỗi chuẩn JSON + HTTP status.
   - Bảo mật loopback localhost (`isLocalRequest`, cookie `aiev_token`, header `x-aiev-token`).
   - Hàng đợi render: CẤM 2 job cùng project chạy đồng thời. Draft luôn trước final (`409 DRAFT_REQUIRED`).
   - Cổng QC chặn `assemble-final` nếu chưa pass (`409 QC_REQUIRED`, `409 QC_FAILED`).
   - Cưỡng chế công tắc Brief ở tầng server (409 nếu request tính năng đã bị tắt).

5. **Quy trình sản xuất Video & QC**: [`rules/04-video-pipeline-qc/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/04-video-pipeline-qc/RULE.md)
   - Quy trình: Init -> HyperFrames -> Frame verification (bắt buộc trích ảnh bằng ffmpeg) -> Remotion Draft -> Automated QC Gate (8 tiêu chí) -> Final.
   - `finishMode`: `"draft"` dừng sau QC, CẤM render final.
   - Logo thương hiệu: Style Design tự đóng watermark góc trên trái, cấm vẽ thêm. Logo khác lấy từ `assets/brand-logos/`, cấm AI tự vẽ logo.
   - Phân biệt Style Design (100% cưỡng chế) vs Video Style (chất liệu/chuyển động).

6. **Remotion Assembler**: [`rules/05-remotion-assembly/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/05-remotion-assembly/RULE.md)
   - Lắp ráp hoàn toàn data-driven từ `props.resolved.json` / `meta.json`.
   - Đảm bảo audio ducking, karaoke font chữ tiếng Việt, layer geometry. Test: `npm test -w engines/remotion`.

7. **HyperFrames Scene Engine**: [`rules/06-hyperframes-scenes/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/06-hyperframes-scenes/RULE.md)
   - HTML + CSS + GSAP (`window.__timelines`). TUYỆT ĐỐI CẤM REACT TRONG SCENE.
   - Chống vỡ/mất dấu tiếng Việt khi làm text reveal và gradient. Chạy `npx hyperframes lint`.

8. **Gateways & Tích hợp ngoại vi**: [`rules/07-gateways-integrations/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/07-gateways-integrations/RULE.md)
   - ChatGPT 3.2.x (`gpt-image-2` pinned vs `2.5`). Gemini Web & Watermark Remover.
   - Dual-engine TTS: Gemini Cloud vs VieNeu-TTS local offline (nhân bản giọng).
   - An toàn mạng với `safeFetch`.

9. **Kỹ năng & AI Agent**: [`rules/08-skills-ai-agents/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/08-skills-ai-agents/RULE.md)
   - Skill viết bằng tiếng Anh tại `.claude/skills/<tên>/SKILL.md`.
   - Tích lũy tri thức sửa bug vào skill ngay khi fix xong.
   - Quy trình bàn giao tôn trọng 100% chỉnh sửa thủ công của người dùng.

10. **Bảo mật & Quyền riêng tư**: [`rules/09-security-privacy/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/09-security-privacy/RULE.md)
    - Chống lộ secrets/mẫu giọng/DB, xác thực token, chống Path Traversal, chống Shell Injection, giới hạn upload.

11. **Quy trình phát triển tính năng**: [`rules/10-feature-workflow/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/10-feature-workflow/RULE.md)
    - Quy trình 6 pha kỹ thuật chuẩn mực (Intake -> Discover -> Design -> Implement vertical slices -> Validate -> Deliver -> Release gate).

12. **Tiêu chuẩn Code & Quy ước**: [`rules/11-code-standards/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/11-code-standards/RULE.md)
    - TypeScript ESM NodeNext, quy chuẩn đặt tên Pascal/camel/kebab, hàm thuần khiết, bắt lỗi lan truyền, ghim dependencies.

13. **Kiểm thử & Đảm bảo chất lượng**: [`rules/12-testing-qa/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/12-testing-qa/RULE.md)
    - Ma trận kiểm tra bắt buộc theo loại thay đổi, thiết kế test theo hành vi/hợp đồng, QA giao diện chuẩn 1440x900, soi video thực tế.

14. **Nhật ký phiên làm việc (BẮT BUỘC)**: [`rules/13-session-logging/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/13-session-logging/RULE.md)
    - Mọi phiên chỉnh sửa code BẮT BUỘC phải ghi nối mục chi tiết vào [`SESSION_LOG.md`](file:///d:/AI/mtdd_ai_video/SESSION_LOG.md) trước khi bàn giao.

15. **Phòng chống hỏng tính năng cũ (BẮT BUỘC)**: [`rules/14-regression-prevention/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/14-regression-prevention/RULE.md)
    - Phân tích vùng ảnh hưởng (blast radius) trước khi sửa. Tương thích ngược tuyệt đối.
    - Kiểm thử hồi quy kép: Test tính năng mới VÀ test lại tính năng cũ liên quan.
    - Cấm đập đi xây lại code đang chạy ổn định.

16. **Tự động đẩy Git & Triển khai Coolify (BẮT BUỘC)**: [`rules/15-git-coolify-deploy/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/15-git-coolify-deploy/RULE.md)
    - Sau khi hoàn thành tính năng/sửa lỗi, kiểm định đạt chuẩn và cập nhật nhật ký, BẮT BUỘC phải `git push origin main` và kích hoạt deploy lên Coolify (`npm run deploy:coolify`).
    - Tuyệt đối không để tồn đọng code cục bộ hay để máy chủ production lệch phiên bản so với kho mã nguồn.

---

## Lệnh kiểm tra bắt buộc trước khi bàn giao:
```bash
npm run typecheck
node apps/web/scripts/check-design-system.mjs
node apps/web/scripts/check-i18n.mjs
npm run build
# Kiểm thử hồi quy tính năng cũ (Rule 14)
# Ghi nhận nhật ký vào SESSION_LOG.md (Rule 13)
# Đẩy code lên GitHub & Triển khai Coolify (Rule 15):
git add .
git commit -m "..."
git push origin main
npm run deploy:coolify
```
