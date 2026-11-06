# Thiết kế Âm thanh (Sound Design) - Agency Kinetic V1

Âm thanh chiếm 50% cảm xúc của một video Short-form Agency chất lượng cao. Video mẫu sở hữu phong cách phối âm hiện đại, sắc bén, dứt khoát.

---

## 1. Nhạc nền (Background Music - BGM)
- **Thể loại:** Modern Lo-fi Hip Hop, Phonk Chillout, hoặc Future Bass nhịp vừa (Mid-tempo Electronic).
- **Nhịp điệu:** Khoảng 110–125 BPM với tiếng snare và hi-hat rõ nét, tạo bước đệm giữ chân người xem liên tục.
- **Mức âm lượng:**
  - Đoạn giọng nói chính: Nhạc nền ở mức `-18 dB` đến `-22 dB` so với giọng đọc.
  - Đoạn chuyển cảnh / ngắt câu: Tăng nhẹ (ducking release) khoảng `+3 dB` để tôn nhịp beat.

---

## 2. Bản đồ Hiệu ứng Âm thanh (Sound FX Matrix)

| Hành động trên màn hình | Loại SFX cần dùng | Cường độ & Đặc điểm |
|---|---|---|
| Chữ kinetic nảy lên | **Whoosh / Fast Swish** | Tần số cao, thời lượng ngắn (0.1s), thanh thoát |
| Chuyển từ khóa quan trọng | **Pop / Sub-impact nhẹ** | Âm trầm ấm, tạo sức nặng cho luận điểm |
| Khung ngắm REC & Máy ảnh | **Camera Shutter Click** | Tiếng gương lật cơ học đanh gọn của DSLR |
| Thẻ thông báo cảnh báo | **Digital Notification / UI Ding** | Tiếng chuông hệ thống mềm mại, không chói gắt |
| Chuỗi 5 thẻ 3D quy trình | **Crisp Wood/Glass Pop** | 5 tiếng gõ nhẹ với cao độ (pitch) tăng dần nhẹ |
| Thanh CTA xuất hiện | **Success Chime / Cash Ring** | Tiếng chuông hoàn tất việc, tạo cảm giác giải phóng |

---

## 3. Quy chuẩn Thu âm & Xử lý Giọng nói (Voice Processing)
- **Âm lượng giọng (LUFS):** Chuẩn tích hợp `-14 LUFS` đến `-16 LUFS` (chuẩn Reels / TikTok).
- **EQ & Nén (Compression):** Tăng nhẹ dải ấm 120–200 Hz để giọng người nói có uy lực của một chuyên gia, nâng dải 4–8 kHz để phát âm phụ âm tiếng Anh / tiếng Việt thật trong trẻo.

