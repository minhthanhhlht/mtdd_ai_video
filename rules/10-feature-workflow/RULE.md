# RULE: QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG (FEATURE DEVELOPMENT WORKFLOW)

> **Phạm vi áp dụng**: Quy trình chuẩn 6 giai đoạn bắt buộc cho mọi yêu cầu tạo mới, mở rộng tính năng hoặc tái cấu trúc trong codebase `AIEVv2`.

---

## Giai đoạn 0 — Tiếp nhận & Xác định phạm vi (Intake)

- Làm rõ kết quả hiển thị cho người dùng và các mục tiêu **không thuộc phạm vi (non-goals)**.
- Phân loại rõ tính năng thuộc phạm vi nào: Dashboard-only, Dữ liệu project, API Backend, Quy trình AI Agent, Pipeline video, hay Tích hợp ngoại vi.
- Xác định tiêu chí chấp thuận (acceptance criteria), quyền truy cập, các trạng thái thất bại (failure states), và chi phí/tác động bảo mật.

---

## Giai đoạn 1 — Khảo sát hiện trạng (Discover)

- Đọc `CLAUDE.md`, `GEMINI.md`, các file `RULE.md` liên quan trong `rules/`, và các skill liên quan trong `.claude/skills/`.
- Tìm kiếm các component, service, route API, schema, job, event, và timeline ops đang tồn tại để tái sử dụng.
- Dò đường đi dữ liệu hoàn chỉnh: **UI → API client → Route → Service/Job → Persistent state/Engine → SSE Event → UI**.
- Xác định rõ ai là chủ sở hữu dữ liệu chuẩn (canonical data owner) và các ràng buộc tương thích ngược (backward compatibility).

---

## Giai đoạn 2 — Thiết kế trước khi Code (Design Before Code)

Viết kế hoạch triển khai ngắn gọn bao gồm:
1. Danh sách file / module dự kiến thay đổi và lý do.
2. Các component primitive / service hiện có sẽ được tái sử dụng.
3. Các trường dữ liệu mới trong types / contract / schema.
4. Kế hoạch cập nhật tài liệu API (`docs/API.md`), đa ngôn ngữ i18n (`vi`/`en`), guide panel (`lib/guide`), và skills.
5. Xử lý các trạng thái: Đang tải (loading), Rỗng (empty), Lỗi (error), Bị vô hiệu hóa (disabled), và Hủy bỏ (cancel).
6. Kế hoạch kiểm thử tự động và kiểm thử thủ công (QA plan).

> **CẢNH BÁO**: Tuyệt đối không tự ý thực hiện migration phá vỡ cấu trúc cũ hoặc thay đổi kiến trúc nếu chưa có sự đồng ý của người dùng.

---

## Giai đoạn 3 — Thực thi theo lát cắt dọc (Implement in Vertical Slices)

Thực hiện từng bước, đảm bảo mỗi lát cắt đều build được:
1. Bổ sung hoặc cập nhật Type / Schema / Contract trước.
2. Viết logic Backend, kiểm tra xác thực, validate đầu vào trước khi mở action trên UI.
3. Viết Service / Job xử lý và phát event tiến độ (progress SSE) / lỗi.
4. Xây dựng giao diện UI bằng các component Primitives chuẩn và gọi chuỗi dịch đa ngôn ngữ `t()`.
5. Viết unit test đi kèm với logic mới.
6. Cập nhật tài liệu và skill liên quan ngay khi hoàn thiện tri thức thực chiến.
7. Tránh refactor lan man sang các file không liên quan.

---

## Giai đoạn 4 — Kiểm định toàn diện (Validate)

Thực thi tuần tự các bước kiểm tra:
1. Chạy các unit test liên quan (`npm test`).
2. Chạy cổng kiểm tra Design System và i18n:
   ```bash
   node apps/web/scripts/check-design-system.mjs
   node apps/web/scripts/check-i18n.mjs
   ```
3. Chạy kiểm tra TypeScript typecheck:
   ```bash
   npm run typecheck
   ```
4. Chạy build production:
   ```bash
   npm run build
   ```
5. Thử nghiệm các trường hợp lỗi tiêu cực (negative / error cases).
6. **Đối với thay đổi trên Video Pipeline**: Bắt buộc tạo một bản render draft thật và xem trực tiếp hình ảnh/âm thanh bằng mắt/tai.
7. Soi lại `git diff`: đảm bảo không có thay đổi rác, không có secret, không có file build thừa lọt vào git.

---

## Giai đoạn 5 — Bàn giao & Báo cáo (Deliver)

Báo cáo kết quả rõ ràng và minh bạch cho người dùng:
- Tính năng mới hoàn thành và tác động tới người dùng.
- Danh sách các file / module đã thay đổi.
- Hướng dẫn tương thích dữ liệu cũ hoặc bước migration (nếu có).
- Kết quả các lệnh kiểm tra tự động đã chạy (kèm log).
- Quy trình kiểm thử thủ công đã thực hiện.
- Các kiểm tra chưa chạy được và lý do cụ thể.
- Các rủi ro tiềm ẩn hoặc backlog cần cải thiện tiếp theo.

---

## Cổng phát hành phiên bản (Release Gate)

Chỉ tạo bản tag Release (`v*`) khi code đã xanh toàn bộ test, build sạch, và đã dựng thử video draft thực tế thành công. Tuân thủ hướng dẫn nối footer từ `.github/release-notes-footer.md`.

