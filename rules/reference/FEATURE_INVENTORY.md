# BẢN ĐỒ TÍNH NĂNG & ROUTE (FEATURE & ROUTE INVENTORY)

> **Tài liệu tham chiếu**: Danh mục đầy đủ toàn bộ 19 routes Web UI, các nhóm route Backend, modules dùng chung và 20 AI skills hiện có trong hệ thống AIEVv2.

---

## 1. Giao diện Web (19 Routes chính)

| Đường dẫn (Route) | Mục đích & Chức năng phụ trách |
|---|---|
| `/` | **Dashboard tổng quan**: Số liệu thống kê, hardware meter, project gần đây, job đang chạy. |
| `/projects` | **Danh sách Video Projects**: Lọc, tìm kiếm, tạo mới project, nhân bản, đổi tên, xóa. |
| `/projects/[id]` | **Chi tiết Video Project**: Cấu hình 3 cột (Workspace), quản lý asset, kịch bản, chạy draft/final. |
| `/projects/[id]/editor` | **Trình biên tập Video (Editor)**: Timeline đa tầng, Remotion Player xem trước, Inspector, Library. |
| `/images` / `/images/[id]` | **Dự án tạo ảnh AI**: Quản lý ảnh tạo bởi Gemini / ChatGPT Web, tẩy watermark. |
| `/auto-cut` / `/auto-cut/[id]` | **Tự động cắt video (Auto Cut)**: Dò khoảng lặng, cắt filler, tối ưu nhịp nói. |
| `/text-to-video` / `/text-to-video/[id]` | **Văn bản thành Video**: Chuyển bài viết URL / nội dung văn bản thành kịch bản & video. |
| `/translate-video` / `/translate-video/[id]` | **Dịch & Lồng tiếng Video**: Bóc băng STT, dịch phụ đề, TTS lồng tiếng đa ngôn ngữ. |
| `/styles` / `/styles/[id]` | **Nhận diện thương hiệu (Style Design)**: Bảng màu thương hiệu, font chữ, logo góc trên trái. |
| `/video-styles` / `/video-styles/[id]` | **Phong cách dựng (Video Styles)**: 50 phong cách chất liệu & chuyển động thị giác. |
| `/voices` | **Thư viện Giọng đọc & Nhân bản**: 30 giọng cloud, 14 giọng offline VieNeu, nhân bản giọng từ audio mẫu. |
| `/queue` | **Hàng đợi Render**: Giám sát tiến độ job thời gian thực, log lỗi, hủy/chạy lại job. |
| `/assets` | **Thư viện Tài nguyên**: Quản lý video footage, ảnh, file âm thanh dùng chung. |
| `/sfx` | **Thư viện Sound Effects**: Nghe thử trực tiếp, tìm kiếm theo tag, tải lên file SFX mới. |
| `/prompts` | **Thư viện Prompt mẫu**: Lưu trữ và quản lý các prompt tối ưu cho từng thể loại video. |
| `/skills` / `/skills/[name]` | **Quản lý AI Skills**: Xem nội dung, sửa hướng dẫn, nhân bản và tạo skill mới. |
| `/connections` | **Kết nối Dịch vụ ngoại vi**: Quản lý API keys, kết nối ChatGPT, Gemini, Cloudflare Tunnel. |
| `/config` | **Cấu hình & Doctor hệ thống**: Kiểm tra môi trường Node, FFmpeg, Python venv, fix tự động 1-click. |
| `/m/[id]` | **Trang Upload điện thoại di động**: Giao diện độc lập tối ưu cho cảm ứng, quét mã QR tải video từ điện thoại. |

---

## 2. Nhóm Route Backend (`apps/server/src/routes/`)

Hệ thống backend Express mount tập trung tại `apps/server/src/index.ts`:
- **Hệ thống & Giám sát**: `/api/health`, `/api/overview`, `/api/metrics`, `/api/doctor`, `/api/usage`.
- **Dự án Video**: `/api/projects`, `/api/projects/:id/timeline`, `/api/projects/:id/editor/*`, `/api/projects/:id/qc`, `/api/projects/:id/publish`, `/api/projects/:id/thumbnail`, `/api/projects/:id/source/*`.
- **Công cụ Sản xuất**: `/api/auto-trim`, `/api/auto-cut`, `/api/text-to-video`, `/api/translate-video`, `/api/clips`, `/api/review`.
- **Âm thanh & Giọng đọc**: `/api/tts`, `/api/voices`, `/api/narration`, `/api/sfx`, `/api/music`.
- **Hàng đợi & Tác tử**: `/api/jobs`, `/api/chat`, `/api/skills`, `/api/prompts`.
- **Thương hiệu & Đồ họa**: `/api/styles`, `/api/video-styles`, `/api/brand-logos`, `/api/images`, `/api/illustrations`, `/api/generate-image`.
- **Kết nối & Hạ tầng**: `/api/connections`, `/api/gateways`, `/api/tunnel`, `/api/update`, `/api/upload-session`.

---

## 3. Thư viện Kỹ năng AI (20 AI Skills trong `.claude/skills/`)

1. `ai-illustrations`: Tạo ảnh minh họa AI phù hợp ngữ cảnh kịch bản.
2. `auto-cut`: Cắt gọt khoảng lặng thừa và tối ưu nhịp nói tự động.
3. `background-music`: Chọn và phối nhạc nền phù hợp tâm trạng, thiết lập ducking.
4. `color-grading`: Chỉnh màu, áp preset màu sắc điện ảnh cho footage.
5. `gsap`: Kỹ thuật lập trình animation GSAP chuyên sâu cho HyperFrames.
6. `hyperframes`: Quy chuẩn dựng scene motion graphics với HyperFrames.
7. `hyperframes-cli`: Hướng dẫn sử dụng công cụ dòng lệnh HyperFrames.
8. `hyperframes-registry`: Quản lý các template scene trong kho mẫu.
9. `key-layout`: Bố cục khung hình an toàn (safe-area) cho TikTok / Reels / Shorts.
10. `make-a-video`: Quy trình tổng hợp sản xuất một video hoàn chỉnh từ brief.
11. `noti-tiktok-full-text`: Phong cách video TikTok chữ toàn màn hình bám nhịp nói.
12. `noti-tiktok-vn`: Chuẩn video TikTok phong cách tin tức/kiến thức đặc thù tiếng Việt.
13. `noti-youtube-edit`: Dựng video dài chuẩn YouTube (chế độ talking head & tư liệu).
14. `offline-voice`: Hướng dẫn kích hoạt và nhân bản giọng đọc offline bằng VieNeu-TTS.
15. `remotion-assemble`: Kỹ thuật lắp ráp composition Remotion đa tầng.
16. `short-form-video`: Tư duy nhịp điệu và hook giữ chân người xem cho video ngắn.
17. `skill-authoring`: Quy chuẩn tạo mới hoặc tối ưu hóa một kỹ năng AI.
18. `video-pipeline`: Luồng sản xuất đầu-cuối từ yêu cầu đến file MP4 hoàn chỉnh.
19. `website-to-hyperframes`: Chuyển đổi thành phần trang web thành scene animation.
20. `webui-design`: Hệ thống thiết kế giao diện Shopify Admin style, thang chữ 3 bậc và design tokens.

