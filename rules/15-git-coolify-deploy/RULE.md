# RULE: TỰ ĐỘNG ĐẨY GIT & TRIỂN KHAI PRODUCTION LÊN COOLIFY (GIT PUSH & COOLIFY CONTINUOUS DEPLOYMENT)

> **MỤC ĐÍCH**: Đảm bảo toàn bộ các thay đổi code, tính năng mới hoặc bản sửa lỗi sau khi vượt qua quy trình kiểm định chất lượng (QA) đều được tự động đồng bộ lên kho lưu trữ từ xa (GitHub `origin main`) và kích hoạt triển khai trực tiếp lên môi trường production trên Coolify (`https://manage.mtdd.io.vn`) mà không để tồn đọng code cục bộ hay gây lệch pha giữa môi trường máy dev và máy chủ production.

---

## 1. Tính bắt buộc toàn cục (Mandatory Rule)

- **Mọi phiên hoàn thành tính năng hoặc sửa lỗi**: Sau khi kiểm định đạt chuẩn (Typecheck, Design System, i18n, Build, Regression test) và ghi nhận `SESSION_LOG.md`, lập trình viên hoặc AI Agent **BẮT BUỘC** phải thực hiện 2 hành động tự động trước khi bàn giao cho người dùng:
  1. **Đẩy mã nguồn lên Git remote**:
     ```bash
     git add .
     git commit -m "<type>(<scope>): <mô tả ngắn gọn>"
     git push origin main
     ```
  2. **Kích hoạt triển khai lên Coolify**:
     ```bash
     npm run deploy:coolify
     ```

---

## 2. Thông số môi trường và Cấu hình Coolify

- **Máy chủ Coolify**: `https://manage.mtdd.io.vn`
- **Mã ứng dụng (Application UUID)**: `nxxz3h6rdy0uahktp9biorb9` (Dự án: **MTDD AI Video**)
- **Mã chứng thực API**: Lưu an toàn trong biến môi trường `COOLIFY_API_TOKEN` tại file `.env`.
- **Script kích hoạt chuẩn**: [`scripts/deploy-coolify.mjs`](file:///d:/AI/mtdd_ai_video/scripts/deploy-coolify.mjs) (kích hoạt qua lệnh `npm run deploy:coolify`).
- **Domain Production công khai**: `https://video.mtdd.io.vn`.

---

## 3. Quy trình thực thi chuẩn trước khi bàn giao (Release Gate Checklist)

Bất kỳ khi nào kết thúc một yêu cầu tính năng hoặc fix bug, Agent phải chạy đủ 5 bước sau:

1. **Kiểm định chất lượng kỹ thuật**:
   ```bash
   npm run typecheck
   node apps/web/scripts/check-design-system.mjs
   node apps/web/scripts/check-i18n.mjs
   npm run build
   ```
2. **Kiểm thử hồi quy**: Xác nhận các tính năng cũ không bị ảnh hưởng (RULE 14).
3. **Ghi nhật ký phiên**: Cập nhật mục mới vào [`SESSION_LOG.md`](file:///d:/AI/mtdd_ai_video/SESSION_LOG.md) (RULE 13).
4. **Đẩy code lên Git**:
   ```bash
   git add .
   git commit -m "feat/fix: mô tả thay đổi"
   git push origin main
   ```
5. **Triển khai Coolify**:
   ```bash
   npm run deploy:coolify
   ```
   Sau khi kích hoạt, kiểm tra phản hồi từ Coolify API xác nhận tiến trình build đã được xếp hàng (`queued` hoặc `in_progress`).
