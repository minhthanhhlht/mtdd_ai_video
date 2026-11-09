## 4. CÔNG THỨC CHUYỂN ĐỘNG (Motion & Spring Physics)

*   **Tốc độ nảy thẻ/đối tượng:**
    *   **Khởi đầu:** `EaseOutExpo` hoặc `EaseOutCirc` để tạo cảm giác nhanh và dứt khoát ban đầu.
    *   **Kết thúc (nảy):** Áp dụng `Spring Physics` với các thông số sau:
        *   `Damping Ratio`: 0.6 - 0.7 (giảm dần độ nảy nhanh, không bị rung quá lâu)
        *   `Stiffness`: 200 - 300 (độ cứng vừa phải, phản hồi nhanh)
        *   `Mass`: 1 - 2 (khối lượng trung bình, chuyển động không quá nặng nề)
        *   `Velocity`: 0 (bắt đầu từ trạng thái nghỉ)
    *   **Animation Property:** `Scale` (1.0 -> 1.05 -> 1.0), `Position Y` (dịch chuyển nhẹ lên/xuống), `Rotation` (xoay nhẹ 1-2 độ).
*   **Độ zoom camera push-in:**
    *   **Kiểu:** `Smooth EaseInOut` hoặc `EaseOutQuint`.
    *   **Phạm vi:** Zoom nhẹ từ 100% lên 105-110% trong khoảng 1-2 giây, tập trung vào chi tiết sản phẩm.
    *   **Điểm kích hoạt:** Tại các điểm nhấn sản phẩm hoặc khi có thẻ/đối tượng mới xuất hiện.
*   **Chuyển động chữ (Kinetic Type):**
    *   `Hero Keyword`: Pop-up nhanh từ 0% scale lên 100% với spring physics (dịch chuyển nhẹ Y -5px -> 0px) trong ~0.3-0.5 giây.
    *   `Lead Text`: Slide up từ dưới lên nhẹ nhàng (Y +10px -> 0px) kết hợp fade in trong ~0.2-0.4 giây, sau Hero Keyword một chút.
*   **Chuyển cảnh (Transitions):**
    *   Chủ yếu là `Hard Cut` hoặc `Cross Dissolve` rất nhanh (0.1-0.2s) để duy trì nhịp độ video.
    *   Đôi khi sử dụng `Smooth Camera Pan` hoặc `Tilt` để chuyển từ cảnh tổng quan sang cận cảnh.