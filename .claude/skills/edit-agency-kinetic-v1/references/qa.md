# Danh mục Kiểm tra Chất lượng (QA Checklist) - Agency Kinetic V1

Trước khi bàn giao hoặc xuất bản video chính thức, phải rà soát qua từng hạng mục dưới đây:

---

## 1. Kiểm tra Bố cục & Lề An toàn (Safe Zones)
- [ ] **Mặt người nói:** Không bị bất kỳ chữ, thẻ 3D hay thanh CTA nào che lấp mắt, mũi hoặc miệng.
- [ ] **Lề dưới (> 320 px):** Chữ và thẻ không chạm vào khu vực caption mặc định hoặc nút like/share của TikTok/Reels/Shorts.
- [ ] **Lề hai bên (> 80 px):** Không có từ khóa kinetic nào bị tràn hoặc cắt cụt (clipping) ở mép màn hình điện thoại.

---

## 2. Kiểm tra Typography & Ngôn ngữ
- [ ] **Tương phản:** Chữ Lime Green `#CCFF00` phải nổi bật rõ ràng, không bị chìm vào phông nền hoặc áo người nói. (Nếu áo màu sáng, tăng thêm lớp đổ bóng `drop-shadow: 0 4px 16px rgba(0,0,0,0.8)`).
- [ ] **Dấu tiếng Việt (NFC):** Nếu dùng tiếng Việt, kiểm tra các ký tự có dấu mũ (Â, Ê, Ô) và dấu thanh (Sắc, Hỏi, Ngã, Nặng) không bị đè vào dòng trên hoặc bị cắt cụt.
- [ ] **Chính tả & Số liệu:** Kiểm tra tên riêng, giá cả, và các bước quy trình khớp 100% với lời người nói.

---

## 3. Kiểm tra Chuyển động & Hiệu ứng (Motion Physics)
- [ ] **Độ nảy (Overshoot):** Thẻ 3D nảy nhẹ mềm mại, không có hiện tượng giật cục (stutter) do lệch frame rate.
- [ ] **Đồng bộ Rotoscope Matte:** Lớp viền người nói khi phóng to camera không bị lệch viền đen hay bóng ma (ghosting).
- [ ] **Chấm nhấp nháy REC:** Nhịp nhấp nháy đúng chu kỳ 1 giây, đều đặn.

---

## 4. Kiểm tra Âm thanh (Audio Sync)
- [ ] **Điểm rơi SFX:** Tiếng pop của thẻ 3D và tiếng shutter máy ảnh phải khớp đúng từng frame với chuyển động hình ảnh.
- [ ] **Cân bằng giọng nói:** Tiếng người nói luôn rõ nét, không bị tiếng beat nhạc hoặc hiệu ứng SFX lấn át.
- [ ] **Đo âm lượng tổng (Loudness):** Nằm trong khoảng `-14` đến `-16 LUFS`, True Peak không vượt quá `-1.0 dBFS`.

