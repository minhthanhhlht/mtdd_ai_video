# REMOTION ASSEMBLY ENGINE RULES

> **QUY TẮC PHÁT TRIỂN REMOTION ENGINE**: Toàn bộ quy chuẩn về lắp ráp video, frame math, audio ducking, typography tiếng Việt và đóng dấu watermark được quy định chi tiết tại:
> 👉 [`rules/05-remotion-assembly/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/05-remotion-assembly/RULE.md)

### Tóm tắt các điều cấm kỵ:
1. **CẤM** hardcode danh sách scene, thời lượng, hay đường dẫn tài nguyên trong mã nguồn Remotion. Remotion phải hoạt động 100% data-driven từ `props.resolved.json` / `meta.json`.
2. **CẤM** làm sai lệch logic frame math giữa `engines/remotion/src/duration.ts` và `apps/web/src/components/editor/timing.ts`.
3. **CẤM** để xảy ra khung hình đen giữa các scene khi chuyển cảnh (transition).
4. **BẮT BUỘC** chạy kiểm thử khi sửa code:
   ```bash
   npm test
   ```

