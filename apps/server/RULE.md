# SERVER BACKEND & RENDER QUEUE RULES

> **QUY TẮC PHÁT TRIỂN BACKEND**: Toàn bộ quy chuẩn về kiến trúc REST API, Server-Sent Events, Render Queue, SQLite và bảo mật localhost được quy định chi tiết tại:
> 👉 [`rules/03-server-backend/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/03-server-backend/RULE.md)
> 👉 [`rules/04-video-pipeline-qc/RULE.md`](file:///d:/AI/mtdd_ai_video/rules/04-video-pipeline-qc/RULE.md)
> 👉 [`docs/API.md`](file:///d:/AI/mtdd_ai_video/docs/API.md) (Hợp đồng API chuẩn)

### Tóm tắt các điều cấm kỵ:
1. **CẤM** chạy 2 job của cùng một project đồng thời trong Render Queue.
2. **CẤM** cho phép job `*-final` chạy khi chưa có bản draft thành công (`409 DRAFT_REQUIRED`).
3. **CẤM** cho phép `assemble-final` chạy khi chưa vượt qua cổng kiểm định QC tự động (`409 QC_REQUIRED`, `409 QC_FAILED`).
4. **CẤM** sửa `process.env` của server chính. Mọi tiến trình con phải dùng `childEnv()`.
5. **CẤM** ghi file tạm / model AI ra ổ C:. Tất cả phải gom vào thư mục `.runtime/`.
6. **BẮT BUỘC** chặn tại server các endpoint tương ứng khi công tắc trong brief bị TẮT (`409 AUTO_CUT_DISABLED`, `409 ILLUSTRATIONS_DISABLED`).

