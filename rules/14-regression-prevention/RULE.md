# RULE: PHÒNG CHỐNG HỎNG TÍNH NĂNG ĐANG CHẠY & BẢO TOÀN TƯƠNG THÍCH (REGRESSION PREVENTION & DO NO HARM)

> **MỤC ĐÍCH TỐI THƯỢNG**: "Không bao giờ để tính năng mới làm hỏng tính năng cũ đang chạy tốt (Do No Harm / Zero Regressions)."
> Bất kỳ khi nào thêm mới tính năng, sửa lỗi (bug fix) hoặc tối ưu code, **BẮT BUỘC** phải tuân thủ quy trình kiểm soát rủi ro và kiểm thử hồi quy được quy định tại đây.

---

## 1. Nguyên tắc Khảo sát Tác động Lan truyền (Blast Radius Analysis)

Trước khi chỉnh sửa bất kỳ hàm, component, schema, route API hay file cấu hình nào:

1. **Tìm kiếm toàn bộ nơi gọi (Trace all callers)**:
   - Dùng lệnh tìm kiếm tham chiếu trong toàn bộ dự án (`git grep "<tên_hàm>"`, tìm kiếm component/route).
   - Xác định danh sách tất cả các module, trang web, hoặc job đang phụ thuộc vào đoạn code chuẩn bị sửa.
2. **Đánh giá rủi ro gãy vỡ (Breakage Risk)**:
   - Nếu sửa đổi tham số đầu vào/đầu ra của một hàm: Liệu các nơi gọi khác có bị crash không?
   - Nếu thay đổi kiểu dữ liệu (type/interface): Các file khác có bị báo lỗi typecheck không?

---

## 2. Quy tắc Tương thích ngược Tuyệt đối (Strict Backward Compatibility)

1. **Với Schema Dữ liệu & `meta.json`**:
   - **CẤM XÓA** hoặc **ĐỔI TÊN** các trường (fields) hiện có mà các project cũ trên đĩa hoặc các phiên bản trước đang sử dụng.
   - Khi thêm trường mới: **BẮT BUỘC PHẢI CÓ GIÁ TRỊ MẶC ĐỊNH (DEFAULT/FALLBACK)** để khi đọc các file `meta.json` cũ không bị crash vì `undefined`.
   - **Bảo toàn 100% các trường không nhận biết (`unknown fields`)**: Khi đọc và ghi dữ liệu, không được lọc bỏ các field mà code hiện tại không dùng tới.
2. **Với API Endpoints (`docs/API.md`)**:
   - Không được đơn phương thay đổi định dạng response JSON nếu client hoặc các script con đang phụ thuộc vào định dạng cũ.
   - Thêm field mới vào response thì được, nhưng không được xóa các field cũ đang chạy.
   - Giữ nguyên các mã lỗi HTTP và error code chuẩn (`error.code`).
3. **Với UI Components (Primitives)**:
   - Khi mở rộng một Component dùng chung (như `<Button>`, `<Field>`, `<Card>`, `<Toolbar>`): Chỉ thêm các props tùy chọn (optional props).
   - Tuyệt đối không thay đổi hành vi mặc định (default behavior) của component đang được sử dụng ở hàng chục trang khác.

---

## 3. Cấm Tự ý "Đập đi xây lại" (No Over-Refactoring / Minimal Scope)

1. **Chỉ sửa đúng phạm vi yêu cầu**:
   - Tập trung giải quyết chính xác yêu cầu của người dùng. Tuyệt đối không "tiện tay" sửa hoặc refactor các component/hàm xung quanh không liên quan.
   - Không tự ý đổi framework, đổi thư viện, hoặc đổi kiến trúc chỉ vì sở thích cá nhân.
2. **Tôn trọng code đang chạy ổn định**:
   - Code đang chạy tốt là kết quả của nhiều lần fix bug thực chiến (đặc biệt là font tiếng Việt, audio ducking, và frame math). Nếu chưa hiểu rõ lý do lịch sử vì sao đoạn code đó được viết như vậy, **CẤM ĐƯỢC XÓA HOẶC VIẾT LẠI**.

---

## 4. Quy trình Kiểm thử Hồi quy Kép (Dual Regression Testing)

Sau khi hoàn thành code, **BẮT BUỘC** thực hiện kiểm tra 2 bước:

### Bước 1: Kiểm thử Tính năng MỚI
- Xác nhận tính năng mới đã chạy đúng 100% theo yêu cầu của người dùng.
- Thử nghiệm cả 2 trường hợp: Dữ liệu chuẩn (happy path) và dữ liệu lỗi (negative/boundary cases).

### Bước 2: Kiểm thử Hồi quy Tính năng CŨ (BẮT BUỘC)
- Mở và thử nghiệm lại các tính năng/trang cũ có liên quan trực tiếp hoặc gián tiếp đến đoạn code vừa sửa:
  - Nếu sửa `ops.ts` trong Editor: Thử lại thao tác kéo timeline cũ, cắt scene cũ, sửa text karaoke cũ xem có còn mượt không.
  - Nếu sửa API Backend: Thử gọi lại endpoint cũ xem các trang Web khác có nhận dữ liệu bình thường không.
  - Nếu sửa CSS/Tokens: Kiểm tra xem các trang khác có bị vỡ màu, lệch layout hoặc mất nút bấm không.

### Bước 3: Chạy toàn bộ cổng kiểm tra tự động
```bash
# 1. Kiểm tra Typecheck (chặn đứng mọi lỗi lệch type trên toàn bộ monorepo)
npm run typecheck

# 2. Kiểm tra Hệ thống thiết kế (đảm bảo không làm lọt màu thô hoặc cỡ chữ sai chuẩn)
node apps/web/scripts/check-design-system.mjs

# 3. Kiểm tra Ngôn ngữ hiển thị (đảm bảo không làm mất key dịch i18n)
node apps/web/scripts/check-i18n.mjs

# 4. Kiểm tra Unit tests của Remotion
npm test -w engines/remotion

# 5. Kiểm tra Build production hoàn chỉnh
npm run build
```

---

## 5. Kế hoạch Hoàn tác (Rollback Plan)

- Nếu sau khi sửa mà phát hiện tính năng cũ bị lỗi:
  - Phải ưu tiên khôi phục lại trạng thái hoạt động tốt của tính năng cũ trước.
  - Phân tích lại nguyên nhân gốc rễ (Root Cause) để tìm giải pháp bổ sung tính năng mới mà không làm xung đột tính năng cũ.

