# RULE: CỔNG KẾT NỐI AI & DỊCH VỤ NGOẠI VI (GATEWAYS & INTEGRATIONS)

> **Phạm vi áp dụng**: Áp dụng cho các dịch vụ kết nối trong `gateways/`, các provider tạo ảnh (`apps/server/src/imageProviders/`), dịch vụ giọng đọc TTS (`tts.ts`, `ttsLocal.ts`), và kết nối Claude Agent SDK.

---

## 1. Kiến trúc Cổng dịch vụ ngoại vi (Gateways)

Các gateway hoạt động như các vi dịch vụ (microservices) độc lập nằm trong thư mục `gateways/` và kết nối với server qua HTTP loopback:

1. **Gateway ChatGPT (`gateways/chatgpt/`)**:
   - Sử dụng thư viện vendored `chatgpt2api` (phiên bản 3.2.3).
   - Mô hình tạo ảnh:
     - `gpt-image-2` (Mặc định): Ghim cứng vào model gpt-5-3 slug ổn định.
     - `gpt-image-2.5`: Để ChatGPT Web tự chọn model mới nhất trên tài khoản.
   - Dữ liệu tài khoản lưu tại `.runtime/chatgpt-gateway/`.
2. **Gateway Gemini Web (`gateways/gemini-web/`)**:
   - Hỗ trợ xoay vòng cookie Google để tạo nội dung/ảnh qua giao diện web.
   - Cache cookie lưu tại `.runtime/gemini-web/`.
3. **Gateway Tẩy Watermark (`gateways/gemini-watermark-remover/`)**:
   - Chuyên trách xóa watermark mờ của ảnh tạo bởi AI trước khi đưa vào video.

---

## 2. Chiến lược 2 Engine Giọng đọc (Dual-Engine TTS)

Hệ thống hỗ trợ 2 engine chạy song song, người dùng tự do lựa chọn theo nhu cầu từng phiên:

| Tiêu chí | Gemini TTS (Cloud) | VieNeu-TTS (Local Offline) |
|---|---|---|
| **Vị trí chạy** | Cloud (Google API) | Chạy thẳng trên máy cục bộ |
| **Chi phí** | Tốn phí theo token (`GEMINI_API_KEY`) | **Hoàn toàn miễn phí** (Apache 2.0) |
| **Mạng Internet** | Bắt buộc phải có mạng | **Không cần mạng (Offline 100%)** |
| **Số lượng giọng** | 30 giọng đa ngôn ngữ dựng sẵn | 14 giọng tiếng Việt chuẩn vùng miền (Bắc, Trung, Nam) |
| **Nhân bản giọng (Voice Cloning)** | Không hỗ trợ | **Engine duy nhất hỗ trợ nhân bản giọng thật** |
| **Yêu cầu cài đặt** | Có API key trong `.env` | Cần `pip install vieneu torch torchaudio` trong venv |

### Quy tắc bất biến:
- File mẫu giọng nói của người dùng đã nhân bản lưu tại `assets/voices/` (đã đưa vào `.gitignore` vì lý do bảo mật quyền riêng tư).
- Khi project yêu cầu giọng nhân bản, backend bắt buộc phải định tuyến sang VieNeu-TTS.

---

## 3. An toàn mạng & Chặn SSRF (`safeFetch.ts`)

Mọi cuộc gọi tải tài nguyên từ bên ngoài (tải bài viết `POST /source/article`, tải logo brand, tải ảnh) **BẮT BUỘC** phải đi qua `safeFetch` (`apps/server/src/safeFetch.ts`):
- Thiết lập thời gian chờ (Timeout) tối đa.
- Giới hạn dung lượng phản hồi (Response size limit) để chống nghẽn bộ nhớ.
- Chặn gọi vào các dải IP nội bộ nguy hiểm (SSRF Protection).

---

## 4. Xác thực và Điều phối Claude Agent SDK

1. **Cơ chế xác thực**:
   - Ưu tiên tự động sử dụng **subscription OAuth** của Claude Code đã đăng nhập sẵn trên máy (`~/.claude/.credentials.json`).
   - Nếu không có, dự phòng bằng `ANTHROPIC_API_KEY` khai báo trong `.env`.
2. **Thực thi headless**:
   - Server kích hoạt Claude Code ở chế độ headless thông qua gói `@anthropic-ai/claude-agent-sdk`, tự động mount các skill có sẵn trong `.claude/skills/`.

