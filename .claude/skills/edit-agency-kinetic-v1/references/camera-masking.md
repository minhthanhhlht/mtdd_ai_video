# Kỹ thuật Camera & Rotoscope Masking

Để đạt được đẳng cấp thị giác như video mẫu `@prime_animator`, kỹ thuật tách lớp và quản lý chiều sâu không gian (Z-depth) là yếu tố quyết định.

---

## 1. Tách nền Chân dung (Subject Rotoscope / Matte)

### Các phương pháp tạo Foreground Matte:
1. **AI Rotoscope / Green Screen ảo:**
   - Dùng Runway, DaVinci Resolve Magic Mask, After Effects RotoBrush 3.0, hoặc các mô hình mã nguồn mở như RVM (Robust Video Matting).
   - Xuất ra chuỗi video đen trắng (Black & White Matte video: Trắng = Người, Đen = Nền) có đúng độ phân giải và framerate của video gốc.
2. **Đồng bộ Transform (Quan trọng nhất):**
   - Mọi thao tác phóng to (scale), dịch chuyển (pan) trên video gốc phải được **áp dụng đồng thời 100%** lên cả video foreground matte. Nếu lệch chỉ 1 pixel, viền tóc và vai sẽ xuất hiện hiện tượng viền đen/trắng (fringing artifacts).

---

## 2. Bố trí Chiều sâu 3D (Z-Index Hierarchy)

```
[ MẮT NGƯỜI XEM ]
       │
       ▼
 1. Lớp Phủ Toàn Màn Hình (Viewfinder REC, Khung góc vuông)
 2. Chữ Kinetic & Thẻ CTA (Ngang ngực, không che cằm)
 3. Thẻ 3D Quy Trình & Props Tiền Cảnh (Máy ảnh DSLR, Micro)
 4. [CHÂN DUNG NGƯỜI NÓI] (Foreground Subject)
 5. Vòng Sáng Hào Quang (Halo Ring sau đầu)
 6. Chữ Nền Chìm / Khói / Đèn Ambient Studio
 7. [NỀN GỐC] (Background Room)
```

---

## 3. Tạo Hiệu ứng Màn hình lật Máy ảnh (Screen-in-Screen)

Trong cảnh nói về áp lực quay:
1. Đặt chiếc máy ảnh DSLR nghiêng góc 3/4 ở góc dưới bên phải.
2. Cắt một vùng mặt người nói (Crop Face), xoay và khớp vào khung màn hình lật LCD của máy ảnh.
3. Thêm một lớp phủ màn hình LCD (lưới kẻ ô chia 3x3, thông số pin, ISO, tốc độ màn trập) để tăng độ chân thực tối đa.

