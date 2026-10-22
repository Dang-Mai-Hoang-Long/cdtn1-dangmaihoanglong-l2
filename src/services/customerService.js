import LoiUngDung from "../errors/AppError.js";

export default class DichVuKhachHang {
  constructor(khoKhachHang) {
    this.khoKhachHang = khoKhachHang;
  }

  /**
   * Chuẩn hóa số điện thoại theo QT-02 rồi tra cứu hồ sơ có sẵn.
   * @param {string} soDienThoai Số điện thoại người dùng nhập.
   * @returns {Promise<object>} Khách hàng đã tồn tại.
   * @throws {LoiUngDung} Với số điện thoại sai định dạng hoặc không tìm thấy khách hàng.
   */
  async timTheoSoDienThoai(soDienThoai) {
    const soDaChuanHoa = String(soDienThoai || "")
      .replace(/[\s.()-]/g, "")
      .replace(/^\+?84/, "0");
    if (!/^0\d{9}$/.test(soDaChuanHoa)) {
      throw new LoiUngDung("INVALID_PHONE", "Số điện thoại không hợp lệ", {
        phone: "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0",
      });
    }
    const khachHang = await this.khoKhachHang.timTheoSoDienThoai(soDaChuanHoa);
    if (!khachHang)
      throw new LoiUngDung("CUSTOMER_NOT_FOUND", "Không tìm thấy khách hàng.");
    return khachHang;
  }
}
