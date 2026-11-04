# RULE: KIỂM THỬ & ĐẢM BẢO CHẤT LƯỢNG (TESTING & QA RULES)

> **Phạm vi áp dụng**: Áp dụng cho quy chuẩn viết unit test, các cổng kiểm tra tự động trước commit, ma trận kiểm thử theo từng loại thay đổi và quy trình QA hình ảnh/âm thanh video.

---

## 1. Ma trận kiểm tra bắt buộc theo loại thay đổi

| Loại thay đổi | Lệnh kiểm tra bắt buộc | Yêu cầu QA bổ sung |
|---|---|---|
| **Giao diện Web UI / Component** | `node apps/web/scripts/check-design-system.mjs`<br>`node apps/web/scripts/check-i18n.mjs`<br>`npm run typecheck -w apps/web` | Soi kỹ giao diện cả 2 theme Light & Dark, kiểm tra responsive trên mobile/desktop, kiểm tra trạng thái loading/empty/error. |
| **API Route / Contract Backend** | `npm run typecheck -w apps/server`<br>`npm run build -w apps/server` | Cập nhật đồng bộ `docs/API.md`, kiểm tra xác thực auth, validate schema và các mã lỗi trả về. |
| **Metadata Project / Timeline** | `npm test -w engines/remotion`<br>`npm run typecheck` | Kiểm tra tương thích với các project cũ, kiểm tra version conflict, kiểm tra undo/redo/save trong editor. |
| **Hàng đợi / Job / AI Agent** | `npm run typecheck -w apps/server` | Kiểm tra vòng đời job (start, progress SSE, done, error), kiểm tra chặn 2 job cùng project, kiểm tra ngắt/tiếp tục session. |
| **HyperFrames / GSAP Scene** | `npx hyperframes lint` | Xem trước scene (`npx hyperframes preview`), kiểm tra kỹ dấu tiếng Việt (không bị vỡ khi gradient/reveal), kiểm tra vùng an toàn (safe area). |
| **Remotion Assembly** | `npm test -w engines/remotion`<br>`npm run typecheck` | Render thử một bản draft thực tế, soi khớp khung hình frame-for-frame, kiểm tra audio sync và ducking nhạc nền. |
| **Tích hợp Provider / Gateway** | `npm run typecheck -w apps/server` | Kiểm thử các nhánh: thành công, dịch vụ offline/timeout, trả về dữ liệu lỗi, và kiểm soát chi phí token. |
| **Thay đổi liên quan đến Bảo mật** | Chạy đầy đủ các lệnh kiểm tra | Kiểm tra các trường hợp tiêu cực: không có token, token hết hạn, sai project, leo thang thư mục `../../`, payload quá kích thước. |

---

## 2. Nguyên tắc Thiết kế Test (Test Design Principles)

1. **Kiểm tra Hành vi và Hợp đồng (Contracts)**:
   - Viết test tập trung vào hợp đồng giao tiếp và hành vi bên ngoài, không kiểm tra chi tiết cài đặt nội bộ (private implementation details).
2. **Kiểm tra cả 2 chiều BẬT và TẮT của công tắc (Feature Toggles)**:
   - Luôn viết test cho cả trường hợp tính năng được BẬT và bị TẮT, đảm bảo backend từ chối (409) đúng chuẩn khi bị tắt.
3. **Kiểm tra Giá trị Biên & Ngoại lệ (Boundary Conditions)**:
   - Thời lượng bằng 0, khung hình cuối cùng, project rỗng, thiếu asset, file upload dung lượng tối đa, 2 job gửi cùng lúc, xung đột phiên bản, hủy tác vụ giữa chừng.
4. **Fixture độc lập, tất định (Deterministic Fixtures)**:
   - Sử dụng dữ liệu mẫu cố định, không phụ thuộc vào API key thật khi chạy unit tests.

---

## 3. QA Giao diện & Đa phương tiện (Visual & Media QA)

1. **Kiểm tra Giao diện Editor trên màn hình chuẩn 1440×900**:
   - Mở đồng thời cả 3 cột: Cột thư viện (Library) + Cột thuộc tính (Inspector) + Khung chat AI (ShellRightPanel).
   - Kiểm tra khung xem trước video dọc 9:16: **Chiều cao phải được giữ nguyên vẹn**, không bị co rúm hay đè vỡ layout.
2. **Kiểm tra Video kết quả thực tế**:
   - **CI trên GitHub không thể thay thế việc soi video bằng mắt/tai người**: CI không có GPU, không có Chrome đầy đủ và không có FFmpeg render video thật.
   - Khi chỉnh sửa pipeline, bắt buộc phải xuất một file video draft thật và kiểm tra:
     - Dấu tiếng Việt có nguyên vẹn không?
     - Font chữ có bị nhảy fallback không?
     - Chữ và chủ thể có lọt vào vùng an toàn (safe area) của TikTok/Reels không?
     - Vết cắt cảnh và chuyển cảnh có mượt không?
     - Giọng đọc có khớp với chữ karaoke không?
     - Nhạc nền có tự động nhỏ đi khi có tiếng nói không?
     - Âm lượng đỉnh có bị rè tiếng không?

---

## 4. Báo cáo Kết quả Kiểm thử minh bạch (Reporting Standards)

- Khi hoàn thành tác vụ, **BẮT BUỘC** báo cáo chính xác:
  - Các lệnh đã chạy và mã thoát / kết quả (Exit Code: 0 / pass).
  - Các bài test hoặc kiểm tra **chưa chạy được** và giải thích rõ lý do khách quan (ví dụ: cần tài khoản AI thật, cần GPU render).
  - **TUYỆT ĐỐI CẤM** tuyên bố mơ hồ "Mọi test đã pass" nếu chỉ mới chạy mỗi lệnh `typecheck` hoặc `build`.

