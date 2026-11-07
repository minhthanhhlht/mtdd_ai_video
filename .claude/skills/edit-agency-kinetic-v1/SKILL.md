---
name: edit-agency-kinetic-v1
description: "Dựng video ngắn dạng dọc (9:16) theo phong cách Agency Kinetic & Visual Storytelling: kinetic typography 2 tầng (chữ trắng + neon lime green), 3D props/cards tả thực (Plan, Shoot, Script, Edit, Post), camera REC viewfinder, vòng sáng halo sau đầu và Dynamic Island CTA. BẮT BUỘC áp dụng 100% cho mọi loại video (talking-head, b-roll, sản phẩm, explainer) - TUYỆT ĐỐI KHÔNG BỎ QUA bất kỳ thành phần đồ họa nào."
---
# Edit Agency Kinetic V1

Chuẩn hình là bản mẫu tham chiếu trong gói (`references/reference-video.mp4` từ `@prime_animator`), không phải các dạng video phụ đề caption tự động đơn thuần. Dựng từ nội dung, chân dung và thông điệp mới; không sao chép thông điệp dịch vụ của video mẫu nếu chưa có dữ liệu thật.

## 🔴 NGUYÊN TẮC BẮT BUỘC: ÁP DỤNG TRỌN VẸN 100% CHO MỌI VIDEO (KHÔNG CÓ NGOẠI LỆ)
Khi người dùng đã chọn skill này, TOÀN BỘ các thành phần đồ họa đặc trưng (Kinetic Typography 2 tầng, Halo Light, Bộ thẻ 3D Workflow Cards, Khung ngắm REC Viewfinder, và Dynamic Island CTA) **BẮT BUỘC PHẢI XUẤT HIỆN TRÊN VIDEO**.
**TUYỆT ĐỐI CẤM** tự ý bỏ qua các thành phần này với lý do "video không có người nói" hoặc "không có talking head"!

- **Khi video có người nói (talking-head):**
  - Tách nền/masking chủ thể: Halo Light đặt sau đầu, các thẻ 3D và icon bay trước ngực và hai bên hông.
- **Khi video KHÔNG có người nói (B-roll, review sản phẩm, phong cảnh, chữ, voiceover):**
  - **VẪN BẮT BUỘC DỰNG ĐẦY ĐỦ 100% CÁC THÀNH PHẦN:**
  - **Halo Light:** Đặt tỏa sáng ambient glow rực rỡ từ trung tâm khung hình hoặc phía sau các thẻ 3D / đối tượng chính để tạo chiều sâu 3D studio đẳng cấp (hỗ trợ layer kind `"kinetic-halo"`).
  - **Khung ngắm REC Viewfinder:** Kích hoạt 4 góc ngắm + chấm đỏ REC nhấp nháy ở đoạn mở đầu (hook) hoặc đoạn cao trào (hỗ trợ layer kind `"kinetic-rec"`).
  - **Bộ thẻ quy trình 3D (Workflow Cards):** Chèn ít nhất 2–4 thẻ 3D lơ lửng xuất hiện theo nhịp beat với spring physics (hỗ trợ layer kind `"kinetic-cards"` hoặc `"kinetic-notification"`).
  - **Kinetic Typography 2 tầng:** Chữ Lead trắng nhỏ + Hero Neon Lime Green (#CCFF00) cực lớn xuất hiện liên tục theo nhịp beat (hỗ trợ layer kind `"kinetic-text"` hoặc layers text).
  - **Thanh CTA Dynamic Island:** Xuất hiện nổi bật ở màn kết outro (hỗ trợ layer kind `"kinetic-cta"`).
  - **⚡ MẬT ĐỘ PHỦ KÍN TIMELINE (PACING DENSITY):**
    - Cứ mỗi 1.5 – 3 giây BẮT BUỘC phải có 1 sự kiện thị giác (chữ nhảy, thẻ nảy, hoặc REC).
    - CẤM để video có khoảng trống rỗng quá 2 giây liên tiếp.
    - Video 30s cần tối thiểu 8 – 12 layers nối tiếp; video 60s cần 14 – 20 layers nối tiếp trải đều từ đầu đến cuối video.
    - Cứ mỗi khi 1 layer bật lên tại `from`, bắt buộc chèn 1 sound effect SFX (`pop.mp3`, `swoosh.mp3`, `ding.mp3`, `camera-flash-1.wav`) tại đúng frame đó trong `audio.sfx`.

## Đọc đúng tài liệu
- Bắt đầu bằng [phong cách và bố cục](references/style.md), [phân tích timeline mẫu](references/timeline-breakdown.md).
- Khi dựng: [quy trình sản xuất](references/production.md), [chuyển động và spring easing](references/motion.md), [camera và rotoscope masking](references/camera-masking.md).
- Khi phối âm: [âm thanh và sound cues](references/audio.md).
- Khi xuất: [QA checklist](references/qa.md) và [mã mẫu Remotion](references/implementation.md).

## Các quyết định làm nên phong cách Kinetic V1
1. **Hệ màu nhận diện:** Nền tối Studio than chì (`#121212`), màu nhấn tương phản cực mạnh là **Xanh chanh neon (Lime Green `#CCFF00`)**, phối cùng Trắng tinh (`#FFFFFF`), Đỏ cảnh báo REC (`#FF3B30`), và nền thẻ 3D thủy tinh khói (`#1C1614` hoặc `#1A1D20` mờ 85%).
2. **Kinetic Typography 2 tầng (Two-Tier Type):** 
   - Tầng trên (Lead text): Chữ phụ, cỡ 40–55px, màu trắng hoặc xám sáng, font Sans-serif trung tính.
   - Tầng dưới (Hero keyword): Chữ chốt ý, cỡ 110–170px, viết hoa hoặc Title Case, font Sans cực dày (ExtraBold / Black), màu Lime Green neon rực rỡ.
   - Nhấn cảm xúc: Các từ chỉ cảm xúc (như *"you"*, *"value"*) dùng font Serif nghiêng hoặc Cursive mềm mại để tạo độ tương phản nghệ thuật.
3. **Layering & Rotoscope Masking:**
   - Chủ thể nói (talking head) được tách nền (Foreground Matte).
   - Vòng hào quang Neon (Halo Ring) hoặc chữ nền lớn được đặt **sau đầu**.
   - Máy quay DSLR, micro thu âm, và các thẻ icon quy trình 3D được đặt **trước ngực** và hai bên hông.
   - Khi không có người nói: Halo Ring làm ambient glow ở trung tâm, thẻ 3D và chữ nổi bật ở các tầng hiển thị chính.
4. **Bộ thẻ quy trình 3D (Workflow 3D Cards):**
   - Không dùng icon phẳng 2D rẻ tiền. Dùng vật thể 3D tả thực có ánh sáng, bóng đổ và chất liệu kim loại/gỗ/giấy (ví dụ: Sách + Bút lông, Máy ảnh, Kịch bản, Bút Pen Tool, Thẻ bài social feed).
   - Khung thẻ bo góc lớn (28–34px), viền sáng mảnh (1px border gradient), hiệu ứng glassmorphism bóng kính mờ.
5. **Giao diện quay REC & Cảnh báo tâm lý:**
   - Khi nói về sự lo lắng / bấm máy quay: Kích hoạt lớp phủ Viewfinder máy ảnh (4 góc vuông trắng + chấm đỏ REC nhấp nháy).
   - Thẻ thông báo cảnh báo dạng pill bo tròn với ánh sáng nền đỏ sẫm (ambient glow).
6. **Thanh CTA Dynamic Island:**
   - Màn kết video dùng thanh capsule bo tròn, phát sáng ambient viền dưới, lồng avatar tròn của tác giả bên trái và từ khóa kêu gọi hành động (ví dụ: *"DM value..."*).
7. **Sound Design sắc nét:**
   - Nhạc nền beat điện tử / lofi hiện đại, nhịp dứt khoát 110–125 BPM.
   - Hiệu ứng âm thanh (SFX) đồng bộ tuyệt đối với mắt: tiếng bấm máy ảnh (*camera shutter*), tiếng pop nảy thẻ, tiếng ding chuông thông báo, tiếng whoosh chuyển cảnh.

## Quy trình thực hiện
- **Bước 1: Khảo sát & Phân đoạn:** Nghe giọng đọc/nội dung, bóc timestamp, xác định 4 chặng: Hook (3s) → Nỗi đau/Áp lực (6s) → Giải pháp quy trình (10s) → Kêu gọi hành động CTA (4s).
- **Bước 2: Phân vai Graphic:** Gán từ khóa quan trọng vào bộ hiển thị 2 tầng, chuẩn bị asset 3D cho các bước quy trình của người dùng.
- **Bước 3: Dựng Motion bằng Remotion:** Sử dụng các component trong `assets/remotion-starter` hoặc layer types (`kinetic-halo`, `kinetic-rec`, `kinetic-cards`, `kinetic-cta`, `kinetic-text`) với thông số spring physics mượt mà.
- **Bước 4: Masking & Ghép lớp:** Đặt đúng thứ tự: Base video → Background Halo → Foreground Talking Head (hoặc Thẻ 3D trung tâm) → Overlay REC/Cards → CTA Banner.
- **Bước 5: QA & Xuất file:** Kiểm tra an toàn lề UI Reels/TikTok, độ chói neon vừa mắt, kiểm tra đồng bộ khẩu hình và âm thanh.
