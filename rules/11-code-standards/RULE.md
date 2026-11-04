# RULE: TIÊU CHUẨN CODE & QUY ƯỚC KỸ THUẬT (CODE STANDARDS)

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ mã nguồn TypeScript, JavaScript, CSS và cấu hình trong toàn bộ monorepo `AIEVv2`.

---

## 1. Ngôn ngữ & Hệ thống Module

1. **TypeScript nghiêm ngặt**:
   - Sử dụng TypeScript strict mode cho `apps/web`, `apps/server`, và `engines/remotion`.
   - Tôn trọng các path alias đã khai báo trong `tsconfig.json`.
   - Tránh dùng kiểu `any`; nếu kiểu từ SDK bên ngoài chưa ổn định, viết adapter phòng vệ có cấu trúc riêng (defensive structural adapter).
2. **ESM trong Backend (`apps/server`)**:
   - Khai báo `"type": "module"` trong `package.json`.
   - Sử dụng chuẩn NodeNext import/export (bao gồm đuôi `.js` trong import relative khi cần thiết).
3. **HyperFrames Scene Compositions**:
   - Giữ chuẩn HTML + CSS + JavaScript thuần + GSAP. Không tự ý đưa React/JSX vào file scene của HyperFrames.

---

## 2. Quy ước Đặt tên (Naming Conventions)

- **React Components**: `PascalCase` (ví dụ: `ProjectAssetsCard.tsx`, `Assemble.tsx`).
- **React Custom Hooks**: Bắt đầu bằng `useX` (ví dụ: `useEditor.tsx`, `useEvents.tsx`).
- **Hàm tiện ích thuần túy & Route files**: `camelCase` (ví dụ: `timing.ts`, `autoCut.ts`).
- **Project IDs & Tên thư mục video**: `kebab-case` (ví dụ: `tiktok-paper-gpt5`, `promo-noti-t8`).
- **Biến & Thuộc tính**: `camelCase`. Hằng số toàn cục: `UPPER_SNAKE_CASE`.
- **Hạn chế viết tắt tùy tiện**: Chỉ sử dụng các từ viết tắt đã được chuẩn hóa trong domain (SSE, SFX, TTS, STT, QC, NLE).

---

## 3. Hàm thuần khiết & Quản lý Trạng thái (Purity & State)

1. **Ưu tiên Hàm thuần khiết (Pure Functions)**:
   - Các phép biến đổi dữ liệu (đặc biệt là timeline ops, tính toán màu sắc, frame math, và chuẩn hóa metadata) phải là hàm thuần khiết: đầu vào xác định → đầu ra xác định, không gây tác dụng phụ (side-effects).
2. **Không đột biến trạng thái dùng chung**:
   - Không được mutate trực tiếp object timeline hoặc project state ngoài store/service được chỉ định.
3. **Vòng đời bất đồng bộ rõ ràng**:
   - Mọi tác vụ async phải có cơ chế hủy (`AbortSignal` / `cancel`), thời gian timeout, dọn dẹp tài nguyên (cleanup), và bắt lỗi lan truyền đúng cách.
   - Tuyệt đối không nuốt chửng lỗi (swallowing errors). Phải chuẩn hóa và hiển thị lỗi có ngữ cảnh.

---

## 4. Xác thực Dữ liệu Runtime (Runtime Validation)

- TypeScript types chỉ kiểm tra lúc compile, **KHÔNG BẢO VỆ ĐƯỢC RUNTIME**.
- Mọi dữ liệu đi vào từ HTTP request, file đọc trên đĩa, hoặc phản hồi từ AI model **BẮT BUỘC** phải được kiểm tra kiểu thật tại runtime (dùng Zod schema hoặc các hàm kiểm tra an toàn `isWellFormed`).
- Luôn bảo tồn các trường lạ không nhận biết (`unknown fields`) để duy trì tính tương thích tiến tới (forward compatibility).

---

## 5. Quản lý Dependencies & Gói cài đặt

1. **Ưu tiên API nền tảng và thư viện sẵn có**:
   - Không cài thêm thư viện phụ thuộc mới (dependencies) nếu các API nền tảng hoặc thư viện đang có đã đáp ứng đủ nhu cầu.
   - Nếu bắt buộc thêm thư viện mới: phải giải trình rõ giá trị mang lại, chi phí dung lượng bundle, tác động hiệu năng và rủi ro bảo mật.
2. **Ghim phiên bản chính xác (Exact Pinning)**:
   - Các gói có liên kết chặt chẽ (như Remotion và các plugin đi kèm `@remotion/*`) phải được ghim cùng phiên bản chính xác; không cập nhật lệch pha làm phát sinh lỗi tương thích khó dò.
3. **Cập nhật `package-lock.json`**:
   - Mọi thay đổi gói cài đặt phải được commit kèm `package-lock.json` tương ứng.

---

## 6. Chú thích & Ngôn ngữ Tài liệu

- **Comment trong code**: Giải thích **LÝ DO** tại sao làm như vậy (ngữ cảnh, ràng buộc, bẫy lỗi đã gặp), không diễn giải lại đoạn code đang làm gì.
- **Commit message**: Viết bằng **Tiếng Anh**, ngắn gọn, rõ ràng theo chuẩn Conventional Commits.
- **File Skills (`.claude/skills/`)**: Viết bằng **Tiếng Anh** (theo quy ước quốc tế cho LLM).
- **Giao diện & Nội dung người dùng**: Giữ nguyên **Tiếng Việt** (kèm hỗ trợ tiếng Anh qua i18n).

