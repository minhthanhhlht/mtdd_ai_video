# Style Guide - Agency Kinetic V1

## 1. Thông số Khung hình (Canvas & Safe Area)
- **Độ phân giải chuẩn:** 1080 × 1920 px (khổ dọc 9:16).
- **Tốc độ khung hình (Frame Rate):** 30 fps (hoặc 60 fps nếu có nhiều chuyển động nhanh).
- **Vùng an toàn (Safe Margin cho Reels / TikTok / Shorts):**
  - **Lề trái / phải:** Cách mép tối thiểu 70–90 px.
  - **Lề trên:** Cách mép trên tối thiểu 180 px (tránh thanh tìm kiếm và header ứng dụng).
  - **Lề dưới:** Cách mép dưới tối thiểu 320 px (tránh caption mặc định, audio tag, thanh tiến trình của TikTok/Reels).

## 2. Bảng màu (Color Palette)

| Tên màu | Mã HEX | Ứng dụng |
|---|---|---|
| **Studio Dark (Nền)** | `#121212` / `#18181A` | Nền video hoặc không gian studio ấm tối |
| **Lime Green Neon (Nhấn Hook)** | `#CCFF00` (hoặc `#C6FF00`) | Từ khóa "đinh", thanh phát sáng, icon nổi bật |
| **Pure White** | `#FFFFFF` | Từ dẫn phụ, viền thẻ ngắm REC, text body |
| **Warning Red** | `#FF3B30` | Chấm tròn REC nhấp nháy, icon cảnh báo `⚠️` |
| **Card Surface (Thủy tinh khói)** | `rgba(28, 22, 20, 0.85)` | Nền thẻ 3D quy trình (Glassmorphism) |
| **Card Border (Viền mảnh)** | `rgba(255, 255, 255, 0.15)` | Viền 1px bo góc tạo độ sắc nét sang trọng |
| **Ambient Red Glow** | `rgba(255, 59, 48, 0.25)` | Đốm sáng mờ phía sau thẻ khi nói về nỗi sợ |
| **Ambient Green Glow** | `rgba(204, 255, 0, 0.30)` | Đốm sáng mờ phía sau thanh CTA |

## 3. Quy chuẩn Typography (Kinetic 2 Tầng)

1. **Tầng 1: Từ dẫn (Lead Text):**
   - Kích thước: 44–56 px.
   - Font: Inter, Roboto, SF Pro Display hoặc Neue Haas Grotesk (Sans-serif).
   - Độ dày (Weight): 500 (Medium) hoặc 600 (SemiBold).
   - Màu: Trắng tinh (`#FFFFFF`) hoặc xám bạc (`#D1D5DB`).
   - Vị trí: Đặt ngay trên đỉnh từ khóa chính.

2. **Tầng 2: Từ khóa chốt (Hero Keyword):**
   - Kích thước: 130–180 px.
   - Độ dày: 800 (ExtraBold) hoặc 900 (Black).
   - Màu sắc: **Xanh chanh neon (`#CCFF00`)**.
   - Letter-spacing: `-0.03em` (ép sát nhẹ để tạo khối chắc nịch).
   - Hiệu ứng xuất hiện: Scale từ 0.7 lên 1.05 rồi về 1.0 (Spring overshoot pop-in trong 6 frames).

3. **Từ cảm xúc (Accent Cursive / Serif):**
   - Kích thước: 60–75 px.
   - Font: Serif nghiêng hoặc Script thanh lịch (ví dụ: Playfair Display Italic, Dancing Script, Cormorant).
   - Dùng hạn chế: Chỉ nhấn 1–2 từ đặc biệt như *"you"*, *"value..."* để làm mềm nhịp thị giác.

## 4. Thiết kế Thẻ 3D & Viewfinder

- **Thẻ 3D Quy trình (Workflow Cards):**
  - Kích thước: Rộng 380–420 px, Cao 460–500 px.
  - Bo góc: 32 px.
  - Phủ bóng: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6)`.
  - Icon bên trong: 3D Render tả thực có hướng nguồn sáng từ góc trên bên trái.
  - Nhãn text dưới icon: Sans-serif in hoa 36–42 px, weight 700, màu trắng.

- **Khung ngắm REC (Viewfinder):**
  - 4 góc: Thước góc vuông màu trắng, nét 3 px, chiều dài cạnh 40 px.
  - Chấm REC: Vòng tròn đỏ 16 px nhấp nháy chu kỳ 1s (0.5s sáng / 0.5s tắt).
  - Chữ `REC`: Font Mono/Sans trắng 28 px cạnh chấm đỏ.

- **Thanh CTA Dynamic Island:**
  - Hình dạng: Capsule (bo góc tròn tối đa `border-radius: 9999px`).
  - Kích thước: Chiều cao 90–110 px, Chiều rộng 500–620 px.
  - Avatar: Vòng tròn 80 px bên trái lồng ảnh chân dung.
  - Chữ kêu gọi: Chữ viết tay/serif mềm mại tạo cảm giác thân mật, đáng tin cậy.

