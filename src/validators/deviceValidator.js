import LoiUngDung from "../errors/AppError.js";

// Validator chỉ kiểm tra kiểu dữ liệu và định dạng query.
export function kiemTraTruyVanThietBi(truyVan = {}) {
  const maKhachHang = Number(truyVan.customer_id);
  const soSerial = String(truyVan.serial || "").trim();
  const loiTheoTruong = {};

  if (!Number.isSafeInteger(maKhachHang) || maKhachHang < 1) {
    loiTheoTruong.customer_id = "Phải là số nguyên dương";
  }
  if (!soSerial) {
    loiTheoTruong.serial = "Trường bắt buộc, không được để trống";
  }

  if (Object.keys(loiTheoTruong).length > 0) {
    throw new LoiUngDung(
      "VALIDATION_FAILED",
      "Dữ liệu không hợp lệ",
      loiTheoTruong,
    );
  }

  return { maKhachHang, soSerial };
}
