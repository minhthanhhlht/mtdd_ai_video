# RULE: QUY TRÌNH SẢN XUẤT VIDEO & KIỂM ĐỊNH QC (VIDEO PIPELINE & QC)

> **Phạm vi áp dụng**: Áp dụng cho quy trình sản xuất video, các tác tử AI thực hiện dựng phim, logic kiểm định chất lượng trong `apps/server/src/qc.ts`, và skill `video-pipeline`.

---

## 1. Vòng đời sản xuất Video 7 bước chuẩn mực (Production Lifecycle)

Quy trình sản xuất video là dây chuyền khép kín, tuyệt đối không được đốt cháy giai đoạn:

```
[1. Tiếp nhận & Khởi tạo]
          ↓
[2. Viết Scene HyperFrames] → [Lint code sạch sẽ]
          ↓
[3. Render Draft từng Scene]
          ↓
[4. BẮT BUỘC: Soi Frame (Frame Verification qua ffmpeg)]
          ↓
[5. Lắp ráp Draft Remotion] → outputs/<id>-draft.mp4
          ↓
[6. BẮT BUỘC: Cổng QC tự động (Automated QC Gate)]
          ↓ (Đạt chuẩn pass)
[7. Xuất bản Final] → outputs/<id>-v1.mp4 & Cập nhật meta.json
```

---

## 2. Soi Frame bắt buộc trước khi lắp ráp (Frame Verification)

Ngay sau khi render draft từng scene, **BẮT BUỘC** trích xuất ảnh tĩnh tại khoảnh khắc đắt giá (hero moment) bằng ffmpeg để kiểm tra:

```bash
ffmpeg -ss <giây-cao-trào> -i renders/<scene>.draft.mp4 -frames:v 1 verify/<scene>.png
```

### Các lỗi cần soi và khắc phục ngay:
- **Dấu tiếng Việt**: Các chữ gradient có bị mất dấu hỏi, ngã, nặng, sắc, huyền không?
- **Tràn viền**: Chữ hoặc hình có bị tràn ra ngoài biên màn hình không?
- **Khung hình rác**: Có xuất hiện khung hình đen hoặc trắng bất thường ở đầu/cuối hiệu ứng không?
- **Cắt xén khuôn mặt**: Chủ thể người có bị crop lẹm mắt/mũi không?

---

## 3. Cổng kiểm định chất lượng tự động 8 tiêu chuẩn (Automated QC Gate)

Trước khi xuất bản Final, hệ thống tự động chạy đo kiểm trên file `outputs/<id>-draft.mp4` qua endpoint `POST /api/projects/:id/qc`.

| Tiêu chuẩn kiểm tra | Ý nghĩa kỹ thuật | Biện pháp xử lý khi Thất bại (Fail) |
|---|---|---|
| `resolution` | Độ phân giải và FPS phải khớp chính xác với `meta.json` | Render lại đúng thông số cấu hình |
| `loudness` | Độ lớn âm thanh tổng thể phải tiệm cận **-14 LUFS** | Điều chỉnh âm lượng tổng mix, không kéo ép peak |
| `truepeak` | Mức đỉnh không được vỡ tiếng (**< -0.5 dBTP**) | Giảm gain nguồn âm thanh / giọng đọc trước khi chèn SFX |
| `blackframes` | **CẤM** có khung hình đen ở GIỮA video (chỉ cho phép ở đầu/cuối nếu có fade) | Khắc phục khoảng hở giữa các scene trong timeline |
| `freeze` | Không được đứng hình bất động liên tục **>= 2 giây** | Bổ sung chuyển động cho scene hoặc kiểm tra lại footage |
| `tail-silence` | Đoạn im lặng cuối video không được vượt quá **1.2 giây** | Cắt bớt phần đuôi thừa |
| `av-duration` | Độ lệch giữa hình và tiếng không được vượt quá **0.5 giây** | Điều chỉnh lại tổng `durationInFrames` |
| `safe-area` | Vùng an toàn hiển thị (TikTok, Reels, Shorts) | Tránh các khu vực bị che bởi nút Like, caption, avatar |

- Nếu kết quả `status: "fail"`: Server **chặn hoàn toàn** job `assemble-final`. Bắt buộc phải sửa tận gốc lỗi, render lại bản draft và đo QC lại cho tới khi đạt `pass`.

---

## 4. Chế độ hoàn thành (Finish Mode: "draft" vs "final")

Thuộc tính `brief.finishMode` quy định điểm dừng của phiên làm việc:

1. **Khi `finishMode === "draft"` (Mặc định)**:
   - Mục tiêu: Dừng lại sau khi hoàn thành Bản Draft và vượt qua cổng kiểm định QC.
   - **CẤM TUYỆT ĐỐI**: Không bao giờ được tự động render final, không chạy `--quality standard`, không đổi `status: "done"` trong `meta.json`, không xuất thumbnail hay publish. Bản draft sẽ để người dùng tự xem lại và bấm "Xuất final" trên Web UI.
2. **Khi `finishMode === "final"`**:
   - Mục tiêu: Tự động chạy thông suốt từ đầu đến khi có file `outputs/<id>-v<N>.mp4` hoàn chỉnh, cập nhật trạng thái `meta.json` sang `done`.

---

## 5. Quy tắc bảo vệ Logo & Bản quyền Thương hiệu

1. **Logo thương hiệu của video (Brand Watermark)**:
   - Nếu Style Design có logo, hệ thống **tự động đóng dấu góc trên bên trái** cho toàn bộ video ở bước lắp ráp Remotion (`jobs/assemble.ts` → `manifest.watermark`).
   - Tác tử AI và HyperFrames **TUYỆT ĐỐI KHÔNG ĐƯỢC** tự vẽ thêm logo ở góc (tránh bị lỗi 2 logo chồng lên nhau).
2. **Logo của các thương hiệu khác (Meta, OpenAI, TikTok...)**:
   - Chỉ được lấy từ kho `assets/brand-logos/`, chép vào thư mục `assets/` của project rồi mới tham chiếu.
   - Nếu chưa có: Gọi API `POST /api/brand-logos {"name":"..."}` để hệ thống tự tải bản SVG chuẩn từ Simple Icons hoặc Wikidata.
   - **CẤM TUYỆT ĐỐI**: Không bao giờ dùng AI để tự sinh (generate) hoặc tự vẽ logo thương hiệu. Nếu không tìm thấy (404), viết tên thương hiệu bằng text thông thường.

---

## 6. Phân biệt rõ hai tầng Style: Style Design vs Phong cách dựng (Video Style)

1. **Style Design (`brief.styleId`, thư mục `assets/styles/`)**:
   - Nhận diện thương hiệu: **MÀU SẮC, FONT CHỮ, LOGO**.
   - Cưỡng chế thực thi 100% trong mọi trường hợp.
2. **Phong cách dựng (Video Style - `brief.videoStyleId`, `assets/video-styles/`)**:
   - Ngôn ngữ thị giác nghệ thuật: **CHẤT LIỆU và CHUYỂN ĐỘNG** (giấy gấp, mực tàu, hoạt hình, retro...).
   - Khi công tắc **BẬT**: Phong cách dựng quyết định chất liệu/chuyển động và **chiến thắng skill** ở phần hình ảnh.
   - Khi công tắc **TẮT** (`brief.videoStyleEnabled = false`): **BỎ QUA HOÀN TOÀN** `videoStyleId`. Code phải kiểm tra qua `activeVideoStyleId(brief)`.

---

## 7. Nguyên tắc bảo toàn `meta.json` khi chỉnh sửa

Vì người dùng có thể thao tác song song trên trình duyệt:
1. **Luôn đọc lại `meta.json` ngay trước khi sửa**.
2. **Chỉ sửa in-place các trường liên quan**, không ghi đè toàn bộ file từ bộ nhớ tạm.
3. **Giữ nguyên 100% các trường không nhận biết** (unknown fields).

