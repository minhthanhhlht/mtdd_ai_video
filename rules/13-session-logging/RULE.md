# RULE: NHẬT KÝ PHIÊN LÀM VIỆC & BẢO TOÀN NGỮ CẢNH (SESSION LOGGING & CONTEXT CONTINUITY)

> **MỤC ĐÍCH**: Đảm bảo mọi thay đổi trong codebase, thiết kế, kiến trúc và cấu hình đều được ghi nhận chi tiết theo từng phiên làm việc (Session). 
> Nhờ đó, bất kỳ phiên làm việc nào tiếp theo của AI hoặc lập trình viên đều có thể đọc lại nhật ký, nắm bắt ngay trạng thái hiện tại và tiếp tục công việc một cách liền mạch, không bị đứt đoạn hoặc làm mất ngữ cảnh.

---

## 1. Nguồn sự thật nhật ký: `SESSION_LOG.md`

- **Tệp tin quy định**: [`SESSION_LOG.md`](file:///d:/AI/mtdd_ai_video/SESSION_LOG.md) nằm tại thư mục gốc của repository.
- **Tính bắt buộc**: Khi kết thúc bất kỳ yêu cầu/phiên làm việc nào có chỉnh sửa code, cấu hình hoặc tài liệu, **BẮT BUỘC PHẢI APPEND (GHI NỐI THÊM)** một mục nhật ký chi tiết vào file này.
- **Cấm ghi đè**: Luôn ghi nối thêm (Append) theo thứ tự thời gian mới nhất ở trên đầu (hoặc dưới cùng có phân mục rõ ràng), không được xóa bỏ lịch sử các phiên trước.

---

## 2. Cấu trúc chuẩn bắt buộc của mỗi Phiên ghi nhận

Mỗi phiên làm việc được ghi nhận phải tuân thủ đúng khung mẫu markdown sau:

```markdown
### [SESSION-YYYY-MM-DD-HH:mm] <Tiêu đề tóm tắt ngắn gọn mục tiêu phiên>

- **Thời gian**: YYYY-MM-DD HH:mm (Múi giờ +07:00)
- **Yêu cầu của người dùng (User Request)**: Trích dẫn hoặc tóm tắt chính xác mong muốn của người dùng.
- **Danh sách tệp tin đã thay đổi (Files Changed)**:
  - `Đường_dẫn_file`: Mô tả tóm tắt hành động (Tạo mới / Sửa đổi / Xóa).
- **Chi tiết các thay đổi kỹ thuật (Implementation Details)**:
  - Nêu rõ các quyết định kiến trúc, logic đã thêm/sửa, lý do lựa chọn giải pháp.
  - Các token, primitive, hoặc endpoint API đã can thiệp.
- **Kết quả kiểm định & Kiểm thử (Verification & Test Results)**:
  - Lệnh đã chạy: `node apps/web/scripts/check-design-system.mjs`, `npm run typecheck`, etc.
  - Kết quả: Mã thoát (Exit code), số lượng lỗi (0 lỗi).
- **Trạng thái hiện tại & Hướng dẫn cho phiên kế tiếp (Next Steps / Handover)**:
  - Công việc đã hoàn tất 100% là gì?
  - Các điểm còn dang dở hoặc lưu ý kỹ thuật cho phiên sau (nếu có)?
  - Phiên sau cần bắt đầu từ đâu?
```

---

## 3. Quy trình thực hiện trước khi bàn giao turn

1. Thực hiện xong công việc theo yêu cầu của người dùng.
2. Chạy toàn bộ các lệnh kiểm tra (check design system, i18n, typecheck, build).
3. Mở và ghi nối thông tin phiên vào [`SESSION_LOG.md`](file:///d:/AI/mtdd_ai_video/SESSION_LOG.md).
4. Phản hồi cho người dùng, nêu rõ những gì đã làm và chỉ dẫn tới nhật ký phiên làm việc vừa cập nhật.

