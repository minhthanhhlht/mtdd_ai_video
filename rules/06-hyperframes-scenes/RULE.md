# RULE: ENGINE DỰNG CẢNH HYPERFRAMES (HYPERFRAMES SCENE ENGINE)

> **Phạm vi áp dụng**: Áp dụng cho các scene đồ họa chuyển động tại `video-projects/<project-id>/compositions/`, các lệnh HyperFrames CLI, và các skill liên quan đến HyperFrames.

---

## 1. Vai trò của HyperFrames: Motion Graphics chuyên sâu

HyperFrames đảm nhiệm phần đồ họa chuyển động vi mô (micro motion graphics):
- Kinetic typography (chữ chuyển động theo nhịp).
- Hiệu ứng phụ đề karaoke đổi màu theo giọng nói.
- Đếm số nhảy (count-up counters), biểu đồ dữ liệu động.
- Khung ghi chú (callouts), hiệu ứng đổ bóng shader, đồ họa vector SVG.

---

## 2. Tiêu chuẩn mã nguồn: HTML + GSAP thuần khiết

1. **TUYỆT ĐỐI CẤM SỬ DỤNG REACT TRONG SCENE**:
   - Toàn bộ scene của HyperFrames được viết bằng **HTML + CSS + JavaScript thuần + GSAP** (`compositions/<scene-id>.html`).
   - Tuyệt đối không import React, React DOM, JSX hay các thư viện framework client nặng vào composition.
2. **Quy ước `window.__timelines`**:
   - Mọi animation GSAP phải được gắn vào `window.__timelines` để HyperFrames CLI có thể tua và render chính xác theo từng frame.
3. **Kích thước và FPS**:
   - Khung hình của scene phải khớp tuyệt đối với `meta.json` của project (ví dụ: dọc `1080x1920`, ngang `1920x1080`, FPS: 30 hoặc 60).

---

## 3. Quy chuẩn an toàn Dấu tiếng Việt (Vietnamese Typography Safety)

Tiếng Việt có hệ thống dấu thanh và mũ phức tạp (hỏi, ngã, nặng, sắc, huyền, ơ, ư, đ). Đây là nguồn lỗi hiển thị phổ biến nhất nếu không chú ý:

1. **Lỗi chữ Gradient mất dấu**:
   - Khi áp dụng hiệu ứng chữ màu gradient (`background-clip: text`), container chữ nếu để `line-height` quá sát hoặc `overflow: hidden` sẽ làm văng mất dấu hỏi/ngã/mũ phía trên.
   - **Biện pháp bắt buộc**: Luôn chừa khoảng đệm an toàn phía trên (`padding-top` tối thiểu 0.2em), `line-height` từ 1.3 trở lên, và render chữ dưới dạng DOM element thật.
2. **Hiệu ứng chữ xuất hiện (Text Reveal Animations)**:
   - Khi làm hiệu ứng chữ mọc từng chữ hoặc trượt từ dưới lên, **phải soi kỹ frame đầu tiên và frame cuối cùng** để đảm bảo dấu không bị giật hoặc biến mất giữa chừng.
3. **Kiểm tra Font chữ**:
   - Chỉ sử dụng các font có đầy đủ glyph Unicode dựng sẵn tiếng Việt được định nghĩa trong Style Design.

---

## 4. Quy trình kiểm tra & Render (Lint & Render)

Trước khi gửi scene vào render draft:

```bash
# 1. Chạy linter kiểm tra cú pháp và quy chuẩn HyperFrames
npx hyperframes lint

# 2. Render bản xem trước Draft (nhanh, tiết kiệm tài nguyên)
npx hyperframes render --quality draft --output renders/<scene>.draft.mp4

# 3. Chỉ khi hoàn tất duyệt và QC toàn bài mới render bản Final
npx hyperframes render --quality standard --output renders/<scene>.final.mp4
```

- Không bao giờ render bản standard/final khi scene chưa được chạy qua bước draft và soi frame bằng ffmpeg.

