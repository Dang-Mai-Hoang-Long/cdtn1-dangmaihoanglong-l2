import { guiYeuCau } from "./client.js";

export const phieuApi = {
  /** Lấy danh sách phiếu, tùy chọn lọc trạng thái và phân trang theo hợp đồng API. */
  layDanhSach: ({ trangThai, trang, kichThuoc, thuTuMaPhieu, signal } = {}) => {
    const thamSo = new URLSearchParams();
    if (trangThai) thamSo.set("status", trangThai);
    if (trang !== undefined) thamSo.set("page", String(trang));
    if (kichThuoc !== undefined) thamSo.set("size", String(kichThuoc));
    if (thuTuMaPhieu) thamSo.set("sort", thuTuMaPhieu);

    const chuoiTruyVan = thamSo.toString();
    const truyVan = chuoiTruyVan ? `?${chuoiTruyVan}` : "";
    return guiYeuCau(`/api/tickets${truyVan}`, { signal });
  },
  /** Lấy thông tin đầy đủ của một phiếu. */
  layChiTiet: (maPhieu) => guiYeuCau(`/api/tickets/${maPhieu}`),
  /** Lấy danh mục sự cố đang hoạt động để hiển thị trong biểu mẫu. */
  layDanhMucSuCo: () => guiYeuCau("/api/tickets/categories"),
  /** Xác thực dữ liệu và lấy hạn cam kết xem trước; endpoint này không lưu phiếu. */
  xemTruocTaoPhieu: (duLieu) =>
    guiYeuCau("/api/tickets/preview", {
      method: "POST",
      body: JSON.stringify(duLieu),
    }),
  /** Lưu phiếu cùng received_at và due_date đã nhận từ bước xem trước. */
  xacNhanTaoPhieu: (duLieu) =>
    guiYeuCau("/api/tickets", { method: "POST", body: JSON.stringify(duLieu) }),
  /** Cập nhật nội dung tiếp nhận và mức ưu tiên của phiếu. */
  capNhatPhieu: (maPhieu, duLieu) =>
    guiYeuCau(`/api/tickets/${maPhieu}`, {
      method: "PUT",
      body: JSON.stringify(duLieu),
    }),
  /** Đóng phiếu chưa ở trạng thái Đã đóng. */
  dongPhieu: (maPhieu) =>
    guiYeuCau(`/api/tickets/${maPhieu}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "DA_DONG" }),
    }),
  /** Tra cứu khách hàng theo số điện thoại đã nhập. */
  timKhachHang: (soDienThoai) =>
    guiYeuCau(`/api/customers?phone=${encodeURIComponent(soDienThoai)}`),
  /** Tra cứu serial và xác nhận thiết bị thuộc khách hàng đã chọn. */
  timThietBi: (soSerial, maKhachHang, signal) => {
    const thamSo = new URLSearchParams({
      serial: soSerial,
      customer_id: String(maKhachHang),
    });
    return guiYeuCau(`/api/devices?${thamSo}`, { signal });
  },
};
