# Nhật ký thay đổi thiết kế

## Sau phản hồi Bài tập 1 (buổi 8, ngày 15/10/2026)

### TD-01 Chỉnh sửa lại 2 NFR và cập nhật lập luận lý do lựa chọn kiến trúc

- Phản hồi của GV : NFR2 và NFR3 không có ngưỡng số đo được (ví dụ cần "100% phản hồi cho vai trò khác Quản lý che số điện thoại", "thêm nhóm sự cố trong dưới 5 phút, 0 dòng mã sửa"). Vì vậy câu lập luận 3 cũng thiếu ngưỡng.
- Quyết định : SỬA
- Lý do : BT1 yêu cầu các NFR phải có ngưỡng số đo được. Lấy ngưỡng số làm căn cứ cho quá trình kiểm thử.
- Ảnh hưởng : Bổ sung thêm ngưỡng số cho NFR2, thay đổi NFR3 sang yêu cầu phi chức năng mới có ngưỡng số có thể đo được, cập nhật lại câu lập luận thứ hai và thứ ba ở phần thiết kế kiến trúc.
- File thay đổi: srs.md.

### TD-02 Nhất quán thuật ngữ và lược bỏ các trường không tồn tại trong ERD ở wireframe.

- Phản hồi của GV : Thuật ngữ chưa nhất quán: SRS gọi "mô tả lỗi", wireframe ghi "Mô tả sự cố". Màn hình xác nhận có "Tình trạng bảo hành", "Xử lý bảo hành" nhưng ERD không có cột tương ứng.
- Quyết định : SỬA
- Lý do : Cần nhất quán thuật ngữ và thể hiện các trường thông tin cần thiết thuộc ERD để dễ dàng theo dõi và truy vết.
- Ảnh hưởng : Sửa lại tên trường Mô tả sự cố thành Mô tả lỗi trong wireframe Tạo phiếu và Xác nhận tạo phiếu. Lược bỏ các trường "Tình trạng bảo hành", "Xử lý bảo hành" không có cột tương ứng trong ERD.
- File thay đổi: wireframe.

### TD-03 Chỉnh sửa ERD

- Phản hồi của GV : ERD có FK technician_id nhưng không có bảng technician.
- Quyết định : SỬA
- Lý do : Trường thông tin chưa đóng vai trò chính trong quá trình tạo và phân loại phiếu bảo hành trong luồng nghiệp vụ Tiếp nhận và phân loại phiếu bảo hành.
- Ảnh hưởng : Lược bỏ trường technician_id trong bảng ticket của ERD trong phiên bản này. Xóa thiết lập trường technician_id của bảng ticket trong SQL DDL skeleton của trường changed_by.
- File thay đổi: schema.sql.

### TD-04 Chỉnh sửa Bảng thuật ngữ trong mục SRS

- Phản hồi của GV : Bảng thuật ngữ chép cả đơn hàng, chiến dịch, khảo sát hài lòng, không thuộc L2.
- Quyết định : SỬA
- Lý do : Thuật ngữ chưa đóng góp giải thích cho các nội dung có trong tài liệu thuộc .
- Ảnh hưởng : Lược bỏ các thuật ngữ đơn hàng, chiến dịch, khảo sát hài lòng ra khỏi bảng thuật ngữ.
- File thay đổi: srs.md.

### TD-05 Chỉnh sửa trường dữ liệu của bảng ticket_status_log

- Sinh viên tự đánh giá : Trường changed_by đang mang khóa ngoại tuy nhiên chưa không có bảng liên kết
- Quyết định : GIỮ
- Lý do : Trường changed_by phục vụ cho QT-06 để truy vết hành động của người dùng khi trạng thái phiếu thay đổi.
- Ảnh hưởng : Tạm thời lược bỏ khóa ngoại của trường changed_by trong phiên bản này. Xóa thiết lập khóa ngoại trong SQL DDL skeleton của trường changed_by.
- File thay đổi: schema.sql.
