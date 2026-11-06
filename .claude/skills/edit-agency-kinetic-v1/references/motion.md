# Hướng dẫn Chuyển động (Motion & Spring Physics) - Agency Kinetic V1

Phong cách này tạo cảm giác chuyên nghiệp nhờ độ nảy vật lý mượt mà (smooth spring overshoot), không bị giật khựng như chuyển động tuyến tính (linear) thông thường.

---

## 1. Công thức Spring Physics (Độ nảy lò xo)

Khi sử dụng Remotion (`spring({ ... })`):

```tsx
const cardSpring = spring({
  frame: currentFrame - startFrame,
  fps: 30,
  config: {
    damping: 12,    // Độ hãm: vừa phải để nảy nhẹ 1 lần rồi đứng yên
    mass: 0.6,      // Khối lượng nhẹ: giúp phản ứng nhanh tức thì
    stiffness: 140, // Độ cứng lò xo: tạo cảm giác dứt khoát, gọn gàng
    overshootClamping: false,
  },
});
```

- **Pha Vào (In):** Kéo dài 6–8 frames (~0.2 – 0.25 giây). Thẻ phóng to từ scale `0.6` vọt lên `1.08` rồi ổn định về `1.0`.
- **Pha Giữ (Hold):** Tối thiểu 15–30 frames để mắt người xem kịp đọc trọn vẹn từ khóa và nhận diện icon 3D.
- **Pha Ra (Out):** Thu nhỏ nhanh kèm mờ dần (opacity từ 1 xuống 0 trong 4 frames) hoặc trượt nhẹ ra ngoài mép.

---

## 2. Quy luật Động tác Kinetic Typography

- **Đổi chữ (Word Switch):** Chữ từ trước biến mất tức thì (hard cut) hoặc trượt nhanh lên trên 20px kết hợp mờ dần trong 2 frames. Từ mới xuất hiện ngay tại vị trí đó với hiệu ứng scale pop nhẹ.
- **Nhấn nhịp (Beat Sync):** Thời điểm chữ phóng to cực đại phải trùng khớp hoàn toàn với phụ âm đầu tiên của từ phát ra từ miệng người nói.

---

## 3. Chuyển động Camera (Camera Push & Pan)

- **Push-in Zoom:** Khi bắt đầu một câu nói quan trọng hoặc chốt luận điểm, camera zoom nhẹ từ 100% lên 106% trong vòng 1.5 giây bằng đường cong `easeOutQuad`.
- **Whip Pan (Chuyển cảnh quẹt nhanh):** Dùng khi chuyển hẳn từ đoạn Nỗi đau sang đoạn Giải pháp quy trình (chuyển động dịch chuyển ngang kèm motion blur nhẹ trong 4 frames).

---

## 4. Vòng sáng Hào quang (Halo Light Animation)

- Vòng tròn neon không đứng im vô hồn, mà có chuyển động thở nhẹ (breathing scale: từ 98% lên 102% trong chu kỳ 2 giây) kết hợp ánh sáng tỏa (glow intensity dao động giữa `0.3` và `0.5`).

