## 1. HỆ MÀU & THỊ GIÁC (Color Palette)

*   **Màu nền:** #F3F1ED (Trắng kem ấm)
*   **Màu chữ chính (Hero Keyword):** #EB3E40 (Đỏ rực, có viền trắng mờ)
*   **Màu chữ phụ (Lead Text):** #333333 (Đen xám đậm)
*   **Màu tương phản neon/hiệu ứng:** #FAD7A0 (Vàng kem nhạt, có hiệu ứng phát sáng nhẹ - ví dụ: bướm, hạt lung linh)
*   **Màu viền thẻ/bao lì xì:** #DFD3BF (Vàng kim nhẹ, óng ánh)
*   **Màu đổ bóng:** #000000 (Đen, độ mờ 20-30%, góc đổ bóng tự nhiên tùy ánh sáng)

## 2. PHÂN TẦNG TYPOGRAPHY (2-Tier Kinetic Type)

*   **Lead Text (Chữ phụ):**
    *   **Font Family:** `Inter Thin` (hoặc một Sans-serif rất mỏng, nhẹ)
    *   **Font Weight:** `Thin` (100)
    *   **Kích cỡ:** Tỉ lệ ~0.4 - 0.5 so với Hero Keyword (ví dụ: 24pt)
    *   **Màu sắc:** #333333
    *   **Hiệu ứng:** Fade in / Slide up nhẹ nhàng.
*   **Hero Keyword (Từ chốt ý):**
    *   **Font Family:** `Playfair Display Italic` (hoặc một Serif nghiêng, dày, có chân, tạo cảm giác cổ điển, nghệ thuật)
    *   **Font Weight:** `Bold` hoặc `Black` (700-900)
    *   **Kích cỡ:** Tỉ lệ ~1 (ví dụ: 50pt)
    *   **Màu sắc:** #EB3E40, kèm `Stroke` màu #FFFFFF (trắng) độ dày 1-2px, `Drop Shadow` màu #000000 với độ mờ 30%, offset 2-3px.
    *   **Hiệu ứng:** Pop-up với spring physics, có thể kết hợp thêm hiệu ứng 'bouncing' nhẹ.
*   **Vị trí:** Chữ đặt giữa phía trên màn hình, Lead Text nằm ngay dưới Hero Keyword, căn giữa.

## 3. BỐ CỤC & XẾP LỚP (Layering & Safe Zones)

*   **Lề an toàn (Safe Zones):**
    *   **Trên cùng:** 10% chiều cao màn hình (cho các icon và thông tin của nền tảng như TikTok).
    *   **Dưới cùng:** 15% chiều cao màn hình (cho chữ, hashtag, tên người dùng).
    *   **Hai bên:** 5% chiều rộng mỗi bên (để tránh cắt xén trên các thiết bị khác nhau).
    *   **Kích thước khung hình:** 576x1024px (tỉ lệ 9:16)
*   **Lớp chủ thể (Người/Vật chính):**
    *   Đặt ở trung tâm khung hình, chiếm phần lớn không gian phía dưới Typography.
    *   Ví dụ: Bàn tay cầm sản phẩm, sản phẩm được sắp xếp gọn gàng trên bàn.
*   **Lớp hậu cảnh (Background):**
    *   Màu nền #F3F1ED, có thể có các chi tiết nhỏ, tinh tế như bàn phím trắng, máy tính bảng, vật trang trí màu sáng nhẹ.
    *   **Vòng sáng halo/Ambient light:** Ánh sáng trắng ấm nhẹ nhàng phát ra từ phía sau hoặc xung quanh chủ thể, tạo hiệu ứng chiều sâu và làm nổi bật vật thể chính. Có thể là một `Radial Gradient` nhẹ với màu #FFFFFF hoặc #FAD7A0, độ mờ thấp (10-20%).
*   **Lớp tiền cảnh (Foreground):**
    *   **Thẻ 3D/Đạo cụ:** Bao lì xì, tiền, hoặc các vật phẩm liên quan được trình bày với hiệu ứng 3D nhẹ, có độ sâu và đổ bóng.
    *   **Icon/Đồ họa phụ trợ:** Các icon nhỏ, tinh tế (ví dụ: bướm phát sáng, hạt lung linh) xuất hiện và biến mất nhẹ nhàng, không gây phân tâm.
    *   **Đổ bóng:** Các vật thể trong tiền cảnh và trung cảnh đều có đổ bóng mềm mại, phù hợp với nguồn sáng chính để tạo chiều sâu và tính chân thực.

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

## 5. TIMELINE BREAKDOWN TỪNG GIÂY

Video tham chiếu có thời lượng khoảng 12 giây, chia thành các chặng chính như sau:

*   **Giây 0.0 - 1.5s: Hook & Tiêu đề (Hook & Title Pop-up)**
    *   **Nội dung:** Cận cảnh tờ tiền 500k VNĐ được cho vào bao lì xì. Hiệu ứng bướm phát sáng xuất hiện.
    *   **Chuyển động:** Camera zoom in nhẹ, tay đẩy tiền vào phong bì. Chữ "Bao lì xì" (Lead Text) xuất hiện với hiệu ứng pop-up spring.
    *   **Mục đích:** Thu hút sự chú ý ngay lập tức, giới thiệu chủ đề.

*   **Giây 1.5 - 3.5s: Giới thiệu chung sản phẩm (Product Overview)**
    *   **Nội dung:** Toàn bộ các bao lì xì dàn trải trên mặt bàn. Cận cảnh các họa tiết trên bao lì xì.
    *   **Chuyển động:** Camera zoom out nhẹ nhàng, pan ngang để thấy toàn bộ sản phẩm. Chữ "Gấm hoa" (Hero Keyword) xuất hiện pop-up với spring physics, "Bao lì xì" vẫn hiển thị dưới dạng Lead Text.
    *   **Mục đích:** Đặt sản phẩm vào bối cảnh, giới thiệu mẫu mã tổng thể.

*   **Giây 3.5 - 6.0s: Cận cảnh chi tiết (Close-up Details)**
    *   **Nội dung:** Các bao lì xì được sắp xếp lại thành hàng, bàn tay chọn một chiếc.
    *   **Chuyển động:** Camera pan dọc và zoom nhẹ, chuyển từ cận cảnh bao lì xì này sang bao lì xì khác. Tay tương tác, di chuyển thẻ.
    *   **Mục đích:** Nhấn mạnh chi tiết thiết kế, chất liệu của sản phẩm.

*   **Giây 6.0 - 9.0s: Trải nghiệm tương tác (Interactive Experience)**
    *   **Nội dung:** Bàn tay nhấc 2-3 bao lì xì lên, xoay nhẹ để khoe các mặt khác nhau của bao.
    *   **Chuyển động:** Camera zoom in sâu hơn vào tay và bao lì xì. Các bao lì xì chuyển động nảy nhẹ, xoay 3D tinh tế.
    *   **Mục đích:** Cho thấy sản phẩm trong quá trình sử dụng, tăng tính chân thực và hấp dẫn.

*   **Giây 9.0 - 12.0s: Kêu gọi hành động & Kết thúc (CTA & Outro)**
    *   **Nội dung:** Các bao lì xì được xếp chồng lên nhau, bàn tay giữ chúng gọn gàng. Họa tiết trên bao lì xì được hiển thị rõ nét.
    *   **Chuyển động:** Camera zoom out nhẹ, pan ngang qua các bao lì xì đang được giữ trong tay. Chữ "Gấm hoa" và "Bao lì xì" vẫn hiển thị.
    *   **Mục đích:** Tạo ấn tượng cuối cùng về sản phẩm, khuyến khích người xem tìm hiểu thêm hoặc mua hàng.

## 6. BẢN ĐỒ ÂM THANH (Sound Map)

*   **Nhạc nền:**
    *   **Thể loại:** Nhạc nền nhẹ nhàng, chill, có thể là Lo-fi Hip-hop hoặc nhạc Acoustic không lời, có giai điệu tươi vui, thư giãn.
    *   **BPM:** Khoảng 80-100 BPM, nhịp độ vừa phải, không quá nhanh.
    *   **Đặc điểm:** Bắt đầu với âm lượng vừa phải, duy trì đều, có thể giảm nhẹ khi có dialogue (nếu có) và tăng nhẹ ở các điểm nhấn cuối video.

*   **Hiệu ứng âm thanh (SFX) - Điểm rơi chính:**
    *   **Tiếng camera click/whoosh:** Tại các điểm chuyển cảnh nhanh hoặc khi một đối tượng/chữ mới xuất hiện đột ngột (ví dụ: pop-up của chữ, chuyển cảnh sang cận cảnh).
    *   **Pop nảy thẻ/đối tượng:** Khi các bao lì xì được đặt xuống hoặc nhấc lên với hiệu ứng spring, tạo cảm giác 'sắc nét' và 'vật lý'.
    *   **Ding chuông thông báo (nhẹ):** Có thể sử dụng tại cuối video hoặc khi một thông tin quan trọng được hiển thị, như một dấu hiệu kết thúc hoặc điểm nhấn.
    *   **Whoosh/swish nhẹ:** Khi tay di chuyển nhanh qua khung hình, hoặc khi các vật thể được sắp xếp lại.
    *   **Sparkle/Glitter sound:** Khi các hiệu ứng hạt lung linh hoặc bướm phát sáng xuất hiện, tạo cảm giác huyền ảo, sang trọng.

### Ví dụ chi tiết SFX placement:
*   **0.5s:** `Whoosh` (Pop chữ "Bao lì xì")
*   **1.6s:** `Camera Click` (Chuyển cảnh tổng quan)
*   **2.0s:** `Whoosh` (Pop chữ "Gấm hoa")
*   **3.6s:** `Swish/Rustle` (Tay di chuyển bao lì xì)
*   **6.1s:** `Pop/Spring` (Khi nhấc bao lì xì lên)
*   **8.5s:** `Sparkle` (Hiệu ứng bướm/hạt sáng)
*   **10.0s:** `Ding (soft)` (Điểm kết thúc nhẹ nhàng)