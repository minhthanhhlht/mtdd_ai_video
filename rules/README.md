# BỘ QUY TẮC PHÁT TRIỂN DỰ ÁN AIEVv2 (AIEV DEVELOPMENT RULES)

> **MỤC ĐÍCH TỐI THƯỢNG**: Đây là tài liệu quy chuẩn kỹ thuật bắt buộc cho bất kỳ Agent AI hoặc lập trình viên nào khi phát triển tính năng mới, sửa lỗi hoặc tái cấu trúc trong dự án **AIEVv2** (AI Edit Video by noti.vn).
>
> Mọi thay đổi code **BẮT BUỘC** phải tuân thủ nghiêm ngặt các bộ luật (RULE) tương ứng dưới đây để đảm bảo:
> 1. Không phá vỡ kiến trúc 3 tầng và ranh giới phân vai của các engine.
> 2. Không làm lệch chuẩn hệ sinh thái UI/UX tối giản (Shopify Admin style), thang chữ 3 bậc, design tokens và hệ thống primitives.
> 3. Không làm sai lệch quy trình sản xuất video (draft -> verify frame -> QC gate -> final).
> 4. Không gây mất mát dữ liệu trên `meta.json` của người dùng.
> 5. Đảm bảo an toàn bảo mật, chống path traversal, shell injection và rò rỉ dữ liệu riêng tư.
> 6. Bắt buộc ghi nhật ký chi tiết từng phiên vào `SESSION_LOG.md` để các phiên sau tiếp quản liền mạch.
> 7. **TUYỆT ĐỐI KHÔNG LÀM HỎNG TÍNH NĂNG ĐANG CHẠY TỐT (Do No Harm / Zero Regressions)**: Kiểm tra tác động lan truyền và kiểm thử hồi quy kép trước khi bàn giao.

---

## 1. Bản đồ danh mục các bộ RULE theo cấu trúc

| STT | Cấu trúc / Phân hệ | File Rule tương ứng | Phạm vi phụ trách chính |
|:---:|---|---|---|
| **00** | **Kiến trúc cốt lõi toàn cục** | [`rules/00-core-architecture/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/00-core-architecture/RULE.md) | Mô hình 3 tầng, phân vai engine, quản lý port, biến môi trường, đường dẫn Windows, phân lập `.runtime/`. |
| **01** | **Giao diện Web UI/UX** | [`rules/01-web-ui-ux/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/01-web-ui-ux/RULE.md) | Next.js 16, thang chữ 3 bậc (`text-sm`, `text-meta`, `text-xs`), nhịp khoảng cách, 100% token CSS, cấm màu thô, bắt buộc dùng primitives, Lucide SVG inline, song ngữ i18n (`vi`/`en`). |
| **02** | **Trình biên tập Video (Editor)** | [`rules/02-video-editor/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/02-video-editor/RULE.md) | `/projects/[id]/editor`, Remotion Player xem trước (không render client), `meta.json` nguồn sự thật, hàm thuần khiết `ops.ts`, khớp khung hình `timing.ts`, phím tắt, track locks, xử lý xung đột. |
| **03** | **Backend API & Render Queue** | [`rules/03-server-backend/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/03-server-backend/RULE.md) | Express 5, chuẩn REST + SSE, SQLite (`better-sqlite3`), hàng đợi render tuần tự theo project, bảo mật localhost (`x-aiev-token`), cưỡng chế công tắc brief. |
| **04** | **Pipeline sản xuất Video & QC** | [`rules/04-video-pipeline-qc/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/04-video-pipeline-qc/RULE.md) | Quy trình 7 bước (Request -> Init -> HyperFrames -> Verify frame -> Assemble Remotion -> QC Gate 8 tiêu chí -> Final), finishMode, bản quyền logo brand, Style Design vs Video Style. |
| **05** | **Engine lắp ráp Remotion** | [`rules/05-remotion-assembly/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/05-remotion-assembly/RULE.md) | `engines/remotion`, composition `Assemble`, data-driven hoàn toàn từ `meta.json`, Layer geometry, Transitions, karaoke typography, audio mix & ducking nhạc nền, watermark. |
| **06** | **Engine dựng cảnh HyperFrames** | [`rules/06-hyperframes-scenes/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/06-hyperframes-scenes/RULE.md) | Motion graphics, kinetic typography, shader, HTML + GSAP (`window.__timelines`). Tuyệt đối CẤM React trong scene. Phòng tránh lỗi vỡ dấu tiếng Việt. |
| **07** | **Cổng kết nối AI & Ngoại vi** | [`rules/07-gateways-integrations/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/07-gateways-integrations/RULE.md) | Cổng ChatGPT (chatgpt2api 3.2.x), Gemini Web, Gemini Watermark Remover, 2 engine TTS (Gemini Cloud vs VieNeu Offline nhân bản giọng). |
| **08** | **Kỹ năng & AI Agent** | [`rules/08-skills-ai-agents/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/08-skills-ai-agents/RULE.md) | Claude Agent SDK, cấu trúc `.claude/skills/<tên>/SKILL.md` (viết bằng tiếng Anh), quy trình bàn giao (handoff), tích lũy know-how sửa lỗi vào skill. |
| **09** | **Bảo mật & Quyền riêng tư** | [`rules/09-security-privacy/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/09-security-privacy/RULE.md) | Chống lộ secrets/mẫu giọng/DB, xác thực token, chống Path Traversal, chống Shell Injection, giới hạn upload, phòng vệ prompt injection. |
| **10** | **Quy trình phát triển tính năng** | [`rules/10-feature-workflow/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/10-feature-workflow/RULE.md) | Quy trình 6 pha kỹ thuật (Intake -> Discover -> Design -> Implement vertical slices -> Validate -> Deliver -> Release gate). |
| **11** | **Tiêu chuẩn Code & Quy ước** | [`rules/11-code-standards/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/11-code-standards/RULE.md) | TypeScript ESM NodeNext, quy chuẩn đặt tên Pascal/camel/kebab, hàm thuần khiết, bắt lỗi lan truyền, ghim phiên bản dependencies. |
| **12** | **Kiểm thử & Đảm bảo chất lượng** | [`rules/12-testing-qa/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/12-testing-qa/RULE.md) | Ma trận kiểm tra bắt buộc theo loại thay đổi, thiết kế test theo hành vi/hợp đồng, QA giao diện chuẩn 1440x900, soi video thực tế. |
| **13** | **Nhật ký phiên làm việc** | [`rules/13-session-logging/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/13-session-logging/RULE.md) | Bắt buộc ghi nhận mọi thay đổi, file sửa, kết quả test và hướng dẫn phiên sau vào `SESSION_LOG.md`. |
| **14** | **Phòng chống hỏng tính năng cũ** | [`rules/14-regression-prevention/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/14-regression-prevention/RULE.md) | Phân tích tác động lan truyền (blast radius), bảo toàn tương thích ngược, kiểm thử hồi quy kép (test cả mới lẫn cũ), cấm đập đi xây lại tùy tiện. |
| **15** | **Tự động đẩy Git & Deploy Coolify** | [`rules/15-git-coolify-deploy/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/15-git-coolify-deploy/RULE.md) | Tự động `git push origin main` và kích hoạt triển khai production lên Coolify (`npm run deploy:coolify`) sau mỗi lần hoàn thành tính năng hoặc sửa lỗi. |

---

## 2. Tài liệu Tham chiếu Kỹ thuật (References)

- [`rules/reference/FEATURE_INVENTORY.md`](file:///d:/AI/mtdd_ai_video/rules/reference/FEATURE_INVENTORY.md): Danh mục chi tiết 19 route frontend, toàn bộ endpoint backend, module dùng chung và 20 AI skills.
- [`rules/reference/SOURCE_AUDIT_REPORT.md`](file:///d:/AI/mtdd_ai_video/rules/reference/SOURCE_AUDIT_REPORT.md): Báo cáo kiểm toán kiến trúc, thế mạnh cần giữ và khuyến nghị phòng ngừa rủi ro.

---

## 3. Checklist kiểm tra bắt buộc trước khi kết thúc bất kỳ tác vụ nào

Bất kỳ khi nào bạn phát triển xong một tính năng mới hoặc chỉnh sửa code, **BẮT BUỘC** phải chạy qua checklist sau:

```bash
# 1. Kiểm tra Type toàn bộ monorepo (server, web, remotion)
npm run typecheck

# 2. Kiểm tra hệ thống thiết kế Web UI (bắt lỗi cỡ chữ ngoài thang 3 bậc, khoảng cách lệch nhịp, màu thô)
node apps/web/scripts/check-design-system.mjs

# 3. Kiểm tra tính đầy đủ của ngôn ngữ giao diện (i18n vi/en)
node apps/web/scripts/check-i18n.mjs

# 4. Kiểm tra các test của tầng Remotion (nếu có đụng vào engine lắp ráp)
npm test -w engines/remotion

# 5. Kiểm tra build production
npm run build

# 6. Kiểm thử hồi quy: Thử lại các tính năng CŨ liên quan, đảm bảo không bị gãy vỡ (Rule 14)

# 7. BẮT BUỘC: Ghi nhận nhật ký phiên làm việc vào SESSION_LOG.md (Rule 13)

# 8. BẮT BUỘC: Đẩy mã nguồn lên Git remote (Rule 15)
git add .
git commit -m "..."
git push origin main

# 9. BẮT BUỘC: Kích hoạt triển khai lên máy chủ Coolify (Rule 15)
npm run deploy:coolify
```

---

## 4. Thứ tự ưu tiên và nguyên tắc giải quyết xung đột

1. **Nguyên tắc phân vai:** Web chỉ giám sát + xem trước; Backend điều phối + quản lý hàng đợi; HyperFrames dựng cảnh; Remotion lắp ráp. Không bao giờ trộn lẫn.
2. **Nguyên tắc bảo vệ dữ liệu người dùng:** File `meta.json` trên ổ đĩa là nguồn sự thật duy nhất. AI luôn đọc lại trước khi sửa, chỉ sửa in-place các key liên quan, bảo toàn 100% các field lạ.
3. **Nguyên tắc "Do No Harm" (Không làm hỏng tính năng cũ):** Tương thích ngược là luật thép. Tính năng mới không được phép làm đứt gãy luồng hoạt động của tính năng cũ.
4. **Nguyên tắc công tắc thật:** Mọi option trong project brief (Auto cut, AI illustrations...) nếu tắt thì prompt phải nói rõ trạng thái tắt và backend endpoint phải chủ động từ chối request.
5. **Nguyên tắc QC:** Không bao giờ xuất bản Final khi chưa có bản draft thành công và vượt qua kiểm định QC tự động.
6. **Nguyên tắc bảo mật:** Coi dữ liệu từ client/prompt là không tin cậy; dùng argument array khi chạy lệnh; không để rò rỉ secret hoặc file riêng tư ra ngoài.
7. **Nguyên tắc tiếp nối phiên (Session Continuity):** Mọi công việc sửa đổi phải được ghi chép vào `SESSION_LOG.md` để bất kỳ phiên làm việc nào kế tiếp cũng hiểu được lịch sử và tiếp quản dễ dàng.
