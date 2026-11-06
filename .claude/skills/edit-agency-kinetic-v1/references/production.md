# Quy trình Sản xuất Video Agency Kinetic V1

Tài liệu này hướng dẫn cách áp dụng phong cách Kinetic V1 cho một video hoàn toàn mới của người dùng.

---

## Bước 1: Tiếp nhận & Kiểm tra Footage đầu vào
1. **Kiểm tra thông số kỹ thuật:**
   - Đảm bảo video đạt tối thiểu 1080×1920 (9:16), 30 fps CFR (Constant Frame Rate).
   - Nếu nguồn quay 4K, scale về canvas 1080×1920 với độ sắc nét tối ưu.
2. **Bóc tách lời thoại (Transcription & Timing):**
   - Đánh dấu chính xác timecode từng câu và từng từ khóa đinh.
   - Chia kịch bản thành 4 chặng tâm lý: **Hook** (Gây chú ý) → **Pain Point** (Nỗi đau/áp lực) → **Solution** (Quy trình các bước) → **Call to Action** (Hành động).

---

## Bước 2: Lập bảng Edit Map (Kịch bản Dựng)

Trước khi can thiệp vào mã Remotion hay phần mềm dựng, lập bảng ánh xạ:

| Giây | Lời nói mới | Phân loại | Visual Treatment V1 | Asset cần chuẩn bị | SFX |
|---|---|---|---|---|---|
| 00–03 | Câu mở đầu gây sốc | Hook | Typography 2 tầng (Trắng + Lime Green) | Font Inter Black + Regular | Whoosh nhẹ |
| 03–07 | Áp lực / Sai lầm thường gặp | Pain Point | Vòng Halo sau đầu + Thước ngắm REC | Overlay Viewfinder PNG/SVG | Camera Shutter |
| 07–11 | Hậu quả / Sự lo lắng | Friction | 2 Thẻ thông báo cảnh báo đỏ | Box Glassmorphism + Icon cảnh báo | Bip / Sub bass |
| 11–18 | Quy trình thực hiện (3–5 bước) | Solution | Hệ thống thẻ 3D nảy (Spring Pop-in) | Bộ 3–5 icon 3D tả thực theo ngành nghề | Pop click |
| 18–22 | Kêu gọi nhắn tin / bình luận | CTA | Thanh Dynamic Island Capsule + Avatar | Ảnh avatar tròn + Chữ từ khóa | Chuông ding |

---

## Bước 3: Kỹ thuật Rotoscope & Xếp lớp (Layering Pipeline)

Thứ tự xếp lớp từ dưới lên trên trên dòng thời gian:

```
[Layer 5 - Top]        : Typography chính, Thẻ CTA Capsule, Lớp ngắm REC Viewfinder
[Layer 4]              : Bộ thẻ 3D quy trình, Thẻ thông báo cảnh báo
[Layer 3 - Foreground] : Video Foreground (Chân dung người nói đã tách nền / Matte)
[Layer 2 - Midground]  : Vòng hào quang Halo Neon, Chữ nền khổng lồ chạy sau lưng
[Layer 1 - Background] : Video góc rộng gốc (Base Video) có phủ lớp tối nhẹ (Vignette)
```

> **Nguyên tắc an toàn:**
> - Nếu không có matte tách nền sạch: Đặt toàn bộ chữ và thẻ ở vùng trống hai bên hoặc ngang tầm ngực, **tuyệt đối không để đồ họa đè che mất mắt và miệng của người nói**.
> - Không dùng hiệu ứng làm mờ (motion blur) quá đà làm nhòe chữ kinetic.

---

## Bước 4: Tùy biến Nội dung Quy trình (Customizing Workflow Cards)

Không dùng cứng nhắc 5 bước trong video mẫu nếu dự án của người dùng có quy trình khác. Hãy đổi icon và chữ cho phù hợp:
- **Ngành Bất động sản:** Khảo sát (Survey) → Thẩm định (Appraise) → Đàm phán (Negotiate) → Bàn giao (Closing).
- **Ngành Thiết kế Web / App:** Nghiên cứu (Research) → Thiết kế UI/UX → Lập trình (Code) → Triển khai (Deploy).
- **Ngành Đào tạo / Coaching:** Đánh giá năng lực → Lập lộ trình → Kèm 1-1 → Đạt mục tiêu.

---

## Bước 5: Kiểm tra QA & Xuất file
- Kiểm tra tính tương phản: Chữ màu Lime Green `#CCFF00` đọc rõ ràng trên nền tối studio.
- Chạy qua danh mục kiểm tra an toàn trong [qa.md](qa.md).
- Xuất file chuẩn định dạng H.264 / AAC 48kHz, tỷ lệ bit 15–20 Mbps.

