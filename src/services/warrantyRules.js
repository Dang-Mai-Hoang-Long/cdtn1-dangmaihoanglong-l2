/**
 * QT-05: Xác định thiết bị còn trong thời hạn bảo hành tại một thời điểm.
 * @param {{purchase_date: string|null, warranty_months: number}} thietBi Thiết bị đã đọc từ kho dữ liệu.
 * @param {Date} ngayHienTai Mốc dùng để so sánh; mặc định là thời điểm hiện tại.
 * @returns {boolean} False nếu đã hết hạn hoặc thiếu ngày mua; hai trường hợp hiện chưa phân biệt.
 */
export function conHanBaoHanh(thietBi, ngayHienTai = new Date()) {
  if (!thietBi.purchase_date) return false;

  const ngayMua = new Date(thietBi.purchase_date);
  const ngayHetHan = new Date(ngayMua);
  const ngayTrongThang = ngayHetHan.getUTCDate();

  // Cộng tháng an toàn với các ngày cuối tháng như 31/01.
  ngayHetHan.setUTCDate(1);
  ngayHetHan.setUTCMonth(
    ngayHetHan.getUTCMonth() + Number(thietBi.warranty_months),
  );
  const soNgayTrongThang = new Date(
    Date.UTC(ngayHetHan.getUTCFullYear(), ngayHetHan.getUTCMonth() + 1, 0),
  ).getUTCDate();

  ngayHetHan.setUTCDate(Math.min(ngayTrongThang, soNgayTrongThang));
  ngayHetHan.setUTCHours(23, 59, 59, 999);

  return ngayHetHan >= ngayHienTai;
}

/**
 * Quyết định có tiếp nhận phiếu theo trạng thái bảo hành và cấu hình cho phép hết hạn.
 * @param {{purchase_date: string|null, warranty_months: number}} thietBi Thiết bị cần kiểm tra.
 * @param {boolean} choPhepHetHan Cấu hình cho phép tiếp nhận thiết bị đã hết hạn.
 * @returns {boolean} Thiết bị có được tiếp nhận theo chính sách hiện tại hay không.
 */
export function duocTiepNhanBaoHanh(thietBi, choPhepHetHan) {
  if (!thietBi.purchase_date) return false;
  return conHanBaoHanh(thietBi) || choPhepHetHan;
}
