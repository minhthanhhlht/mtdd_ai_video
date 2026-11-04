# RULE: ENGINE LẮP RÁP REMOTION (REMOTION ASSEMBLY ENGINE)

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ mã nguồn trong `engines/remotion/src/` và logic lắp ráp video tại `apps/server/src/jobs/assemble.ts`.

---

## 1. Vai trò của Remotion: Bộ lắp ráp dữ liệu động (Data-Driven Assembler)

- Remotion đóng vai trò là **nhà máy lắp ráp cuối cùng (Assembler)**: Lắp ghép các scene MP4 từ HyperFrames, video quay thật (footage), lồng phụ đề karaoke, hòa âm giọng đọc + sound effects + nhạc nền ducking, thêm hiệu ứng chuyển cảnh và đóng dấu watermark.
- **NGUYÊN TẮC BẤT DI BẤT DỊCH: DỮ LIỆU ĐIỀU KHIỂN HOÀN TOÀN (DATA-DRIVEN)**:
  - Thành phần chính `Assemble.tsx` đọc cấu hình từ file `props.resolved.json` (do server tạo ra từ `meta.json`).
  - **TUYỆT ĐỐI CẤM**: Không bao giờ hardcode danh sách scene, thời lượng, hay đường dẫn file trong mã nguồn React của Remotion.

---

## 2. Quản lý Sequence và Tính toán Khung hình (Frame Math)

1. **Sắp xếp Sequence (`<Sequence>`)**:
   - Mỗi scene tương ứng với một `<Sequence>` có `from` và `durationInFrames` được tính toán chuẩn xác.
   - Khi có chuyển cảnh (Transition), tính toán độ lệch `transitionOverlap` giữa scene trước và scene sau để chuyển động mượt mà, không để lại khung hình đen ở giữa.
2. **Khớp nối với Editor**:
   - Mọi công thức tính frame trong `engines/remotion/src/duration.ts` phải đồng nhất 100% với `apps/web/src/components/editor/timing.ts`.
   - Chạy bộ kiểm thử khi thay đổi logic: `npm test -w engines/remotion`.

---

## 3. Hòa âm đa tầng (Multi-Track Audio Mixing & Ducking)

1. **Giọng đọc dẫn chuyện (Narration / Voice)**:
   - Là trục thời gian xương sống của video. Giọng đọc nằm ở `meta.audio.voice`.
2. **Nhạc nền và Kỹ thuật Tự động hạ âm lượng (Audio Ducking - `MusicTrack.tsx`)**:
   - Nhạc nền tự động giảm âm lượng (ducking) xuống mức thấp (ví dụ 10–15%) trong suốt các đoạn có giọng đọc dẫn chuyện, và tự động nâng âm lượng lên khi có khoảng lặng.
3. **Hiệu ứng âm thanh (Sound Effects - `SfxTrack.tsx`)**:
   - Được gắn chính xác tại khung hình `atFrame`.
   - Âm lượng SFX phải có headroom để tránh gây méo tiếng / vỡ âm (TruePeak > -0.5 dBTP).

---

## 4. Xử lý Phụ đề, Karaoke và Font chữ tiếng Việt

1. **Các Track phụ đề**:
   - `CaptionTrack.tsx`: Phụ đề động kiểu karaoke, highlight từng từ (word-level) bám theo timestamp của giọng đọc.
   - `SubtitleTrack.tsx`: Phụ đề dịch hoặc phụ đề tiêu chuẩn từng câu.
2. **Font chữ và Dấu tiếng Việt (`vietnameseFont.ts`, `brandFonts.ts`)**:
   - Luôn nạp font cục bộ qua `@remotion/fonts` từ thư mục Style Design hoặc font hệ thống.
   - Đảm bảo font hỗ trợ đầy đủ bảng mã tiếng Việt Unicode dựng sẵn; không để xảy ra hiện tượng "font fallback" làm một số chữ có dấu bị nhảy sang font khác.

---

## 5. Lớp phủ đồ họa và Dấu bản quyền (Layers & Watermark)

1. **Lớp phủ (`LayerTrack.tsx`, `layerGeometry.ts`)**:
   - Hỗ trợ ảnh chèn, sticker, b-roll, video lồng video (picture-in-picture).
   - Áp dụng các biến đổi tọa độ, tỉ lệ scale, góc xoay và animation keyframes theo chuẩn đã tính toán trong `layerGeometry.ts`.
2. **Dấu bản quyền (Watermark)**:
   - Nằm ở lớp trên cùng (`manifest.watermark`). Tự động căn chỉnh vị trí (mặc định góc trên bên trái) với kích thước và padding an toàn.

---

## 6. Kiểm thử tự động bắt buộc (Unit Tests)

Khi có bất kỳ chỉnh sửa nào trong `engines/remotion/src/`:
```bash
npm test -w engines/remotion
```
Đảm bảo tất cả test cases (`duration.test.ts`, `color.test.ts`, `layerGeometry.test.ts`) đều pass sạch sẽ.

