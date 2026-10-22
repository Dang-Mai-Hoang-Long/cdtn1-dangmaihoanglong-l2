import LoiUngDung from "../errors/AppError.js";
import { conHanBaoHanh, duocTiepNhanBaoHanh } from "./warrantyRules.js";

export default class DichVuThietBi {
  constructor(khoThietBi, khoKhachHang) {
    this.khoThietBi = khoThietBi;
    this.khoKhachHang = khoKhachHang;
  }

  /**
   * Tra cứu thiết bị và kiểm tra quan hệ với khách hàng cùng điều kiện bảo hành.
   * @param {string} soSerial Serial/IMEI cần tìm.
   * @param {number} maKhachHang Mã khách hàng đang được chọn trên biểu mẫu.
   * @returns {Promise<object>} Thông tin thiết bị và kết quả bảo hành để hiển thị.
   * @throws {LoiUngDung} Khi khách hàng/thiết bị không tồn tại, không khớp hoặc không được tiếp nhận.
   */
  async timTheoSerial(soSerial, maKhachHang) {
    if (!(await this.khoKhachHang.tonTai(maKhachHang))) {
      throw new LoiUngDung("CUSTOMER_NOT_FOUND", "Không tìm thấy khách hàng.");
    }
    const thietBi = await this.khoThietBi.timTheoSoSerial(soSerial);
    if (!thietBi)
      throw new LoiUngDung("DEVICE_NOT_FOUND", "Không tìm thấy thiết bị.");
    if (Number(thietBi.customer_id) !== maKhachHang) {
      throw new LoiUngDung(
        "DEVICE_CUSTOMER_MISMATCH",
        "Thiết bị không thuộc khách hàng này.",
        {
          serial: "Thiết bị không thuộc khách hàng đang chọn",
        },
      );
    }
    const duocBaoHanh = conHanBaoHanh(thietBi);
    const choPhepHetHan =
      process.env.ALLOW_EXPIRED_WARRANTY_TICKETS !== "false";
    if (!duocTiepNhanBaoHanh(thietBi, choPhepHetHan)) {
      throw new LoiUngDung(
        "WARRANTY_NOT_APPROVED",
        "Thiết bị hết hạn hoặc chưa xác minh bảo hành; cần quản lý phê duyệt.",
      );
    }
    return {
      device_id: thietBi.device_id,
      customer_id: thietBi.customer_id,
      serial_no: thietBi.serial_no,
      purchase_date: thietBi.purchase_date,
      warranty_approved: Boolean(duocBaoHanh),
    };
  }
}
