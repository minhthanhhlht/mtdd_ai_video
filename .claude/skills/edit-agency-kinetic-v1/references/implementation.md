# Mã mẫu & Hướng dẫn Triển khai Remotion

## 1. Cài đặt & Chạy Starter
Thư mục `assets/remotion-starter` là một dự án Remotion độc lập (React 19 + TypeScript).

```sh
cd assets/remotion-starter
npm install
npm run studio     # Mở giao diện Remotion Studio trực quan trên trình duyệt
npm run typecheck  # Kiểm tra lỗi TypeScript
npm run render     # Xuất video MP4 hoàn chỉnh
```

## 2. Cấu trúc các Component chính

- **`KineticText.tsx`**: Hiển thị typography 2 tầng (chữ trắng + neon lime green) với hiệu ứng nảy spring.
- **`HaloLight.tsx`**: Vòng tròn hào quang neon phát sáng đặt sau đầu người nói.
- **`RecViewfinder.tsx`**: Lớp phủ khung ngắm máy ảnh với 4 góc thước đo và chấm đỏ REC nhấp nháy.
- **`NotificationCard.tsx`**: Thẻ cảnh báo dạng thủy tinh khói với ánh sáng nền đỏ.
- **`WorkflowCards.tsx`**: Bộ thẻ 3D quy trình (Plan, Shoot, Script, Edit, Post).
- **`DynamicIslandCTA.tsx`**: Thanh capsule bo tròn mềm phát sáng với avatar và chữ kêu gọi hành động.

## 3. Thay thế Nội dung cho Dự án Mới
1. Đặt video quay thô (talking head) vào thư mục `public/`.
2. Mở file `src/index.tsx` để điều chỉnh kịch bản theo bảng Edit Map.
3. Thay thế các từ khóa trong `KineticText` và tên các bước trong `WorkflowCards`.
4. Gọi lệnh `npm run render` để kết xuất video MP4 1080×1920 / 30 fps.

