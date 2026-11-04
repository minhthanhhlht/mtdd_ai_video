# WEB UI DESIGN & DEVELOPMENT RULES

> **QUY TẮC PHÁT TRIỂN WEB UI**: Toàn bộ quy chuẩn về thang chữ 3 bậc, nhịp khoảng cách, 100% token CSS, cấm màu thô, bắt buộc dùng Primitives và đa ngôn ngữ i18n cho `apps/web` được quy định chi tiết tại:
> 👉 [`rules/01-web-ui-ux/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/01-web-ui-ux/RULE.md)
> 👉 [`rules/02-video-editor/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/02-video-editor/RULE.md) (cho Video Editor)

### Tóm tắt các điều cấm kỵ:
1. **CẤM** cỡ chữ ngoài thang 3 bậc: `text-sm` (14px nội dung), `text-meta` (13px phụ chú), `text-xs` (12px badge/th). Cấm `text-base`, `text-lg`, `text-[10/11/13/15px]`.
2. **CẤM** màu thô (mã hex `#...` trong JSX/TSX hoặc class palette Tailwind `bg-gray-100`, `text-white`). 100% dùng CSS tokens: `--primary`, `--bg`, `--surface`, `--border`, `--text`...
3. **CẤM** tự viết lại các primitive bằng Tailwind thô. Bắt buộc dùng `<Button>`, `<IconButton>`, `<Card>`, `<Panel>`, `<Field>`, `<Badge>`, `<Banner>`, `<Skeleton>`, `<Toolbar>`, `<EmptyState>`.
4. **CẤM** mã hóa/render video trong browser. Web UI chỉ xem trước qua Remotion Player.
5. **BẮT BUỘC** kiểm tra:
   ```bash
   node scripts/check-design-system.mjs
   node scripts/check-i18n.mjs
   ```

