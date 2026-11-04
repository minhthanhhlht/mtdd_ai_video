# RULE: TRÌNH BIÊN TẬP VIDEO (VIDEO EDITOR SYSTEM)

> **Phạm vi áp dụng**: Áp dụng cho route `/projects/[id]/editor` và toàn bộ component trong `apps/web/src/components/editor/`, cũng như các endpoint backend liên quan đến timeline (`/api/projects/:id/timeline`).

---

## 1. Bản chất kiến trúc: Trình duyệt chỉ XEM TRƯỚC (Preview-Only)

1. **Không render trên Client**:
   - Trình duyệt chạy **Remotion Player** để phát trực tiếp composition `Assemble` nội bộ nhằm xem trước tức thời.
   - Trình duyệt **TUYỆT ĐỐI KHÔNG** bao giờ mã hóa, render MP4 hoặc xử lý video bằng ffmpeg/WASM tại máy client. Mọi thao tác xuất file, render draft/final đều phải gửi lệnh về Backend Render Queue.
2. **`meta.json` là nguồn sự thật duy nhất**:
   - Mọi chỉnh sửa trên timeline (cắt scene, đổi thứ tự, sửa karaoke text, chèn SFX, chỉnh nhạc nền, gắn animation keyframes) đều ánh xạ trực tiếp và lưu vào `meta.json` của project.
   - Giao tiếp qua endpoint có kiểm soát phiên bản: `PUT /api/projects/:id/timeline`.

---

## 2. Các hàm đột biến thuần khiết trong `ops.ts` (Pure Operations)

Mọi thao tác thay đổi timeline **BẮT BUỘC** phải được hiện thực dưới dạng hàm thuần khiết (pure function) trong `apps/web/src/components/editor/ops.ts`:

1. **Đầu vào và Đầu ra**:
   - Nhận vào: `(currentTimeline, payload)` → Trả về: `newTimeline`.
   - Nếu thao tác không làm thay đổi gì (no-op), **phải trả về đúng tham chiếu cũ** (`return currentTimeline`) để tránh re-render thừa.
2. **BẢO TỒN 100% CÁC TRƯỜNG LẠ (PRESERVE UNKNOWN FIELDS)**:
   - Khi clone hoặc cập nhật scene, cue, layer: **CẤM** destructure rồi chỉ lấy các field mình biết. Phải dùng `...item` để giữ nguyên các thuộc tính lạ mà AI agent hoặc các bản nâng cấp sau này ghi vào:
   ```ts
   // ĐÚNG:
   return { ...scene, durationInFrames: newDuration };
   // SAI (Làm mất field lạ):
   return { id: scene.id, src: scene.src, durationInFrames: newDuration };
   ```
3. **Cấm đột biến trực tiếp**: Không bao giờ mutate trực tiếp object timeline trong component. Mọi thay đổi phải đi qua `useEditor().edit(...)`.

---

## 3. Khớp khung hình chính xác tuyệt đối (`timing.ts`)

- Mọi phép toán tính toán vị trí frame, độ dài scene, phần chồng lấn chuyển cảnh (`transitionOverlap`), điểm xuất hiện của SFX trong `timing.ts` phải **khớp từng khung hình (frame-for-frame)** với logic trong `engines/remotion/src/Assemble.tsx`.
- **Định dạng hiển thị thời gian**:
  - Trên các khối timeline, thanh Inspector, tiêu đề: Luôn dùng số giây thập phân (`2.67s`, `1:02.5`).
  - Chỉ trên thanh điều khiển phát (Transport bar) mới hiển thị mã thời gian NLE `mm:ss.ff` (kèm tooltip giải thích `ff = frames`).

---

## 4. Bảng màu Track Timeline (Design Tokens)

Không dùng mã màu hex hay class Tailwind palette thô cho timeline. Sử dụng 100% token chuyên dụng đã khai báo trong `globals.css`:
- Scene: `--track-scene` & `--track-scene-bg`
- Layer/Overlay: `--track-layer` & `--track-layer-bg`
- Highlight/Callout: `--track-highlight` & `--track-highlight-bg`
- Karaoke/Captions: `--track-caption` & `--track-caption-bg`
- Phụ đề (Subtitles): `--track-subtitle` & `--track-subtitle-bg`
- Sound Effects: `--track-sfx` & `--track-sfx-bg`
- Giọng đọc (Voice): `--track-voice` & `--track-voice-bg`
- Nhạc nền (Music): `--track-music` & `--track-music-bg`
- Vạch bắt dính (Snap Guide): `--timeline-snap` (Playhead: `--primary`)

---

## 5. Khóa Track (Track Locks - `locks.ts`)

- Mỗi đường track đều có biểu tượng ổ khóa. Trạng thái khóa lưu trong `localStorage` theo từng project.
- **Quy tắc khi Track bị khóa**:
  - Vẫn cho phép **chọn (select)** element trên track đó để xem thuộc tính.
  - Inspector chuyển sang chế độ **Read-only** kèm banner thông báo track bị khóa.
  - Khung Canvas Overlay trên màn hình xem trước chỉ hiển thị viền chọn, **ẩn toàn bộ chốt kéo (handles)**.
  - Hàm `edit()` thực hiện dry-run: nếu phát hiện dữ liệu của track bị khóa thay đổi (`lockedChange`), **hủy toàn bộ thao tác**.

---

## 6. Phím tắt và Trải nghiệm Bàn phím (Keyboard-First)

- `Space`: Phát / Dừng (Play / Pause).
- Phím mũi tên `←` / `→`: Dịch chuyển từng khung hình.
- `Alt + ←` / `Alt + →`: Đổi chỗ scene sang trước / sau (thay thế thao tác kéo thả).
- `S`: Tách khối (Split) tại vị trí playhead.
- `Delete` / `Backspace`: Xóa khối đang chọn.
- `Ctrl/Cmd + Z` / `Ctrl/Cmd + Shift + Z`: Hoàn tác (Undo) / Làm lại (Redo).
- `?`: Mở bảng tra cứu phím tắt.
- **Điều kiện chặn phím tắt**:
  - Không kích hoạt phím tắt khi người dùng đang gõ trong bất kỳ ô `input`, `textarea`.
  - Tạm khóa phím tắt khi người dùng đang thực hiện thao tác kéo thả (drag) khối trên timeline.

---

## 7. An toàn dữ liệu, Xung đột và Chế độ Khóa AI

1. **Tự động lưu kèm kiểm soát xung đột (Conflict Resolution)**:
   - Tự động lưu sau debounce kèm mã phiên bản `version` từ server.
   - Nếu server báo `409 VERSION_CONFLICT`, hiển thị banner cho người dùng chọn: "Tải bản mới nhất" (Load latest) hoặc "Giữ bản của tôi" (Keep mine - lưu với nhãn `editor-overwrite` để bản cũ vẫn nằm trong lịch sử).
2. **Khóa chỉnh sửa khi AI đang chạy**:
   - Khi có tiến trình AI đang thao tác trên project, giao diện editor chuyển sang chế độ **Read-only** kèm banner cảnh báo. Remotion Player tự động tải lại mỗi khi AI cập nhật xong dữ liệu.
3. **Cảnh báo khi rời trang**:
   - Khi unmount hoặc sự kiện `pagehide`, tự động flush dữ liệu chưa lưu bằng keepalive PUT.
   - Nếu có lỗi lưu hoặc xung đột, hiển thị Modal xác nhận cảnh báo mất dữ liệu trước khi rời trang.
4. **Phòng vệ trước dữ liệu lỗi (Defensive Rendering)**:
   - Toàn bộ component Timeline và Inspector phải được bọc trong `EditorErrorBoundary`.
   - Luôn dùng hàm đọc an toàn (`isWellFormed`, `captionWordsOf`). Dữ liệu hỏng hiển thị banner cảnh báo trong Inspector, tuyệt đối không làm crash sập màn hình editor.

