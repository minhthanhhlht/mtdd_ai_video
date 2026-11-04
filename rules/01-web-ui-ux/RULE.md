# RULE: HỆ THỐNG THIẾT KẾ GIAO DIỆN WEB UI/UX

> **Phạm vi áp dụng**: Áp dụng cho toàn bộ mã nguồn trong `apps/web/src/`.
> Mọi thay đổi UI **BẮT BUỘC** phải vượt qua script kiểm tra tự động:
> `node apps/web/scripts/check-design-system.mjs` (0 lỗi).

---

## 1. Triết lý thiết kế (Design Philosophy)

- **Phong cách chuẩn mực**: Tối giản và chuẩn mực theo kiểu **Shopify Admin** — mật độ thông tin cao nhưng thoáng đãng, mỗi thành phần trên màn hình đều phải có lý do tồn tại rõ ràng.
- **Ngoại lệ duy nhất**: Mọi trang trong ứng dụng đều là **dashboard giám sát & quản trị**, ngoại trừ **Trình chỉnh sửa video** tại `/projects/[id]/editor` (công cụ biên tập dày đặc tính năng).
- **Cấm hoàn toàn các chi tiết màu mè**:
  - Không hiệu ứng đổ bóng mờ (glassmorphism/backdrop-blur lạm dụng).
  - Không gradient cầu vồng, sặc sỡ.
  - Không hiệu ứng chuyển động trang trí rườm rà. Chuyển động duy nhất được phép: `transition: 150ms ease`, thanh tiến trình và skeleton pulse.

---

## 2. Thang chữ 3 bậc — Luật quan trọng nhất (The 3-Step Type Scale)

Đây là quy tắc số 1 quyết định giao diện sạch sẽ hay rối rắm:

| Class Tailwind | Kích thước | Vai trò sử dụng |
|---|---|---|
| `text-sm` | **14px** | **Nội dung mặc định**. Mô tả, nhãn ô nhập (form label), giá trị bảng, tên mục, câu thông báo. Khi phân vân, luôn dùng `text-sm`. |
| `text-meta` | **13px** | **Dữ liệu phụ (Metadata)**. Mốc thời gian, ID, số đếm, gợi ý dưới ô nhập (hint), đường dẫn thư mục. |
| `text-xs` | **12px** | **Chi tiết khung (Chrome only)**. Chỉ dùng trong `<Badge>`, thẻ `<th>` của bảng dữ liệu, và nhãn uppercase `.t-eyebrow`. **Tuyệt đối không dùng cho một câu văn hoàn chỉnh**. |

### Tiêu đề (Headings):
- Tiêu đề trang: `text-xl font-semibold` (20px).
- Tiêu đề Card / Panel: `text-sm font-semibold` (14px).
- Ngoại lệ con số thống kê lớn trong `<StatTile>`: `text-[28px] font-bold`.
- **CẤM**: Không có quá 2 cấp tiêu đề trên cùng một trang.

### CÁC CLASS CỠ CHỮ BỊ CẤM HOÀN TOÀN (BANNED):
- `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-base`, `text-lg`, `text-2xl`, `text-3xl`, và mọi cỡ tùy ý khác.
- Cần 13px? Sử dụng `text-meta` (đã định nghĩa chuẩn trong `globals.css`).

---

## 3. Nhịp khoảng cách (Spacing Rhythm)

Toàn bộ padding và gap chỉ được phép lấy từ thang chuẩn:
- **Hợp lệ**: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px); `p-2` (8px), `p-3` (12px), `p-4` (16px).
- **CẤM HOÀN TOÀN**: `gap-0.5`, `gap-1.5`, `gap-2.5`, `gap-5`, `gap-7`, `gap-9`, `p-0.5`, `p-1.5`, `p-2.5`.
- **Khoảng đệm khung trang**:
  - Gutter viền nội dung: 20px (trong `Shell.tsx`).
  - Khoảng cách giữa các Card: 16px (`gap-4`).
  - Padding trong ruột Card: 16px (`p-4`).
  - `<PageHeader>` **CẤM có margin bottom** (không được thêm `mb-4`). Nhịp `gap-4` của layout cha đã tự tạo khoảng cách hoàn hảo.

---

## 4. Hệ thống Design Tokens — Cấm tuyệt đối màu thô (Zero Raw Colors)

Toàn bộ màu sắc phải đi qua biến CSS custom properties định nghĩa trong `:root` và `[data-theme="dark"]`.

### Bảng Token màu chuẩn:
| Token | Light Theme | Dark Theme | Mục đích sử dụng |
|---|---|---|---|
| `--primary` | `#2563eb` | `#3b82f6` | Màu chủ đạo thương hiệu, nút chính |
| `--primary-hover` | `#1d4ed8` | `#60a5fa` | Hover nút chính (Dark sáng hơn, Light tối hơn) |
| `--primary-soft` | `#eff6ff` | `#172554` | Nền nhạt màu chính (Badge, highlight nhẹ) |
| `--secondary` | `#ff7849` | `#ff7849` | Màu phụ, điểm nhấn thứ cấp |
| `--bg` | `#ffffff` | `#131417` | Nền trang toàn cục |
| `--bg-subtle` | `#f6f6f7` | `#1a1b1f` | Nền sidebar, nền Panel lồng nhau |
| `--surface` | `#ffffff` | `#1e1f24` | Bề mặt Card |
| `--border` | `#e7e7ea` | `#2c2d33` | Đường kẻ viền, divider |
| `--text` | `#101113` | `#f2f3f5` | Chữ chính |
| `--text-muted` | `#5f6470` | `#9a9ea9` | Chữ phụ, label mờ, mô tả |
| `--success` | `#16a34a` | `#2ebd6b` | Thành công |
| `--success-bg` | `#e7f6ec` | `#17301f` | Nền thông báo thành công |
| `--danger` | `#e8590c` | `#f0742e` | Cảnh báo / lỗi |
| `--danger-bg` | `#fbeee5` | `#33231a` | Nền thông báo cảnh báo / lỗi |

### CÁC HÀNH VI BỊ CẤM HOÀN TOÀN VỀ MÀU SẮC:
- CẤM mã màu hex trong file JSX/TSX: `#ffffff`, `#000000`, `bg-[#fff]`.
- CẤM bảng màu mặc định của Tailwind: `text-white`, `bg-black`, `bg-gray-100`, `border-slate-200`, `text-red-500`...
- CẤM gắn độ mờ (alpha modifier) vào token: `bg-[var(--primary-soft)]/40` (làm sinh màu ngoài bảng).
- Chỉ thay đổi giá trị token trong Dark theme, **KHÔNG BAO GIỜ** tạo token mới chỉ dùng riêng cho Dark theme.

---

## 5. Bắt buộc sử dụng Primitives chuẩn (Never Hand-Roll)

Tuyệt đối không viết lại các khối Tailwind thô đã có sẵn component dựng sẵn:

| Nhu cầu giao diện | Component chuẩn bắt buộc dùng | Cấm tự viết lại bằng |
|---|---|---|
| Nút bấm | `<Button variant="primary\|secondary\|destructive" small?>` | `<button className="btn btn-primary">` |
| Nút icon | `<IconButton icon label size="sm\|md" tone="default\|danger">` | Tự bọc `<button className="p-1.5 ...">` |
| Thẻ nội dung chính | `<Card title hint actions>` | `<div className="card p-0">` |
| Hộp lồng bên trong Card | `<Panel title actions>` | Div viết tay `rounded-[var(--radius)] border ...` |
| Form ô nhập dữ liệu | `<Field label hint error>`, `<SwitchField>`, `<CheckboxField>` | Label + input thô |
| Lựa chọn ít mục ngắn | `<Segmented options value onChange>` | Danh sách button tự ghép |
| Lựa chọn mục kèm mô tả | `<OptionCardGroup>` + `<OptionCard>` | Div tự bắt sự kiện click |
| Nhãn trạng thái / phân loại | `<Badge tone label dot={true/false}>` | Div bo tròn viết tay (dot: status, ko dot: category) |
| Thông báo lỗi/thành công | `<Banner tone="danger\|success\|info\|muted" detail={...}>` | Khối div thông báo màu thô |
| Trạng thái đang tải | `<Skeleton>`, `<TableSkeleton>`, `<CardGridSkeleton>` | Chữ "Đang tải..." căn giữa |
| Số liệu tổng quan Dashboard| `<StatTile label value sub icon href>` | Div tự style con số |
| Nút sao chép | `<CopyButton text>` | Nút copy tự viết state copied |
| Thanh công cụ danh sách | `<Toolbar search bulkActions onClearSelection>` | Thanh tìm kiếm tự ghép |
| Danh sách trống | `<EmptyState icon title description action>` | Thẻ `<p>Không có dữ liệu</p>` trơ trọi |
| Thanh tiến trình | `<ProgressBar value max>` / `.progress-indeterminate` | Div w-[x%] tự chế |

### Giới hạn độ sâu lồng nhau (Nesting Depth):
- **Tối đa 2 tầng viền**: `<Card>` → `<Panel>`.
- **CẤM**: Tuyệt đối không lồng 3 lớp viền (`Card` → bordered div → bordered `<li>`). Mắt người dùng sẽ mất phương hướng phân cấp.

---

## 6. Icon, Font chữ và Hình ảnh Thương hiệu

- **Icon**: 100% SVG inline từ gói **Lucide** (`lucide-react`), độ dày stroke 1.5–2px, màu luôn là `currentColor` để kế thừa từ chữ cha. Cấm icon font, cấm ảnh icon PNG, cấm dùng emoji làm icon chức năng.
- **Font**: **Inter** thông qua gói `@fontsource/inter` (được import tại `layout.tsx`, đóng gói lúc build, self-hosted 100%). Cấm load Google Fonts từ CDN lúc chạy.
- **Brand Assets**: Tải về tĩnh tại `apps/web/public/brand/`:
  - `logo-duong-ban.png` (dùng cho Light theme)
  - `logo-am-ban.png` (dùng cho Dark theme)
  - `favicon.png` (`<link rel="icon">`)
  - Chuyển logo đồng bộ theo thuộc tính `data-theme` trên thẻ `<html>`.

---

## 7. Bố cục khung trang & Trang chi tiết

- **Thanh trên cùng (Topbar)**: Cao đúng 56px.
- **Thanh bên (Rail)**: 220px ↔ 56px. Độ rộng điều khiển bằng CSS Custom Properties thông qua `data-nav` trên thẻ `<html>`, **không dùng React state**.
- **Khung AI bên phải (ShellRightPanel)**: 440px ↔ 40px điều khiển qua `data-panel` trên thẻ `<html>`.
- **Trang chi tiết (Detail page)**:
  - Bắt buộc dùng component `<Workspace>` 3 cột theo nhịp: **Source (Nguồn) → Setup (Thiết lập) → Output (Kết quả)**.
  - Cột Output luôn nằm đầu tiên trong cột 3.
  - Phân chia kích thước cột bằng **Container Query** (trong `Workspace.tsx`), **CẤM dùng media query `xl:grid-cols-5` thô** vì nó không phản ánh đúng khi rail/panel thu gọn.
- **Nút hành động nguy hiểm / lưu**: Luôn đặt ở `<PageHeader actions>`. Cấm đặt lơ lửng cuối trang hoặc trong ruột Card.

---

## 8. Đa ngôn ngữ (i18n Rule)

- Mọi chuỗi ký tự hiển thị cho người dùng **BẮT BUỘC** phải gọi qua `t("key")`.
- Định nghĩa đầy đủ key ở cả 2 file: `apps/web/src/locales/vi.ts` và `apps/web/src/locales/en.ts`.
- Chạy lệnh kiểm tra tính toàn vẹn: `node apps/web/scripts/check-i18n.mjs`.

