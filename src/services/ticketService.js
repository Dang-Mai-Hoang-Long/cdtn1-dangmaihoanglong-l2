import LoiUngDung from "../errors/AppError.js";
import { conHanBaoHanh } from "./warrantyRules.js";

function tinhHanCamKet(thoiDiemNhan, mucUuTien) {
  const gioXuLy = { CAO: 24, TRUNG_BINH: 72, THAP: 120 }[mucUuTien];
  const hanCamKet = new Date(thoiDiemNhan);
  let gioConLai = gioXuLy;

  // QT-04: tính giờ từ thứ Hai đến thứ Bảy, bỏ qua toàn bộ Chủ nhật.
  while (gioConLai > 0) {
    if (hanCamKet.getDay() !== 0) {
      hanCamKet.setHours(hanCamKet.getHours() + 1);
      gioConLai -= 1;
    } else hanCamKet.setDate(hanCamKet.getDate() + 1);
  }
  return hanCamKet;
}

export default class DichVuPhieu {
  constructor(khoPhieu) {
    this.khoPhieu = khoPhieu;
  }

  layDanhSachPhieu(tuyChonDanhSach) {
    return this.khoPhieu.layDanhSach(tuyChonDanhSach);
  }

  layDanhMucSuCo() {
    return this.khoPhieu.layDanhMucSuCo();
  }

  async chuanBiDuLieuTaoPhieu(duLieu) {
    const khachHang = await this.khoPhieu.timKhachHangTheoMa(
      duLieu.customer_id,
    );
    if (!khachHang)
      throw new LoiUngDung("CUSTOMER_NOT_FOUND", "Không tìm thấy khách hàng.");
    const thietBi = await this.khoPhieu.timThietBiTheoMa(duLieu.device_id);
    if (!thietBi)
      throw new LoiUngDung("DEVICE_NOT_FOUND", "Không tìm thấy thiết bị.");
    if (Number(thietBi.customer_id) !== duLieu.customer_id) {
      throw new LoiUngDung(
        "DEVICE_CUSTOMER_MISMATCH",
        "Thiết bị không thuộc khách hàng này.",
        {
          device_id: "Thiết bị không thuộc khách hàng đang chọn",
        },
      );
    }
    const danhMuc = await this.khoPhieu.layDanhMucTheoMa(duLieu.category_id);
    if (!danhMuc)
      throw new LoiUngDung("VALIDATION_FAILED", "Dữ liệu không hợp lệ", {
        category_id: "Nhóm sự cố không hợp lệ",
      });
    const conHan = conHanBaoHanh(thietBi);
    if (!conHan) {
      throw new LoiUngDung(
        "WARRANTY_NOT_APPROVED",
        "Thiết bị hết hạn hoặc chưa xác minh bảo hành cần được quản lý xác nhận.",
      );
    }
    const mucUuTien = duLieu.priority || danhMuc.default_priority;
    // Khi tạo thật, nhận lại hai mốc đã xem trước để không sinh hạn lần nữa.
    const thoiDiemNhan = duLieu.received_at
      ? new Date(duLieu.received_at)
      : new Date();
    let hanCamKet = duLieu.due_date ? new Date(duLieu.due_date) : null;
    if (!hanCamKet) hanCamKet = tinhHanCamKet(thoiDiemNhan, mucUuTien);
    return {
      ...duLieu,
      priority: mucUuTien,
      is_warranty: Boolean(conHan),
      received_at: thoiDiemNhan,
      due_date: hanCamKet,
    };
  }

  /**
   * Chuẩn bị dữ liệu xem trước phiếu mà chưa ghi vào cơ sở dữ liệu.
   * @param {Record<string, unknown>} duLieu Dữ liệu phiếu đã qua validator.
   * @returns {Promise<{priority: string, is_warranty: boolean, received_at: Date, due_date: Date}>} Các giá trị nghiệp vụ hiển thị để người dùng xác nhận.
   * @throws {LoiUngDung} Khi khách hàng, thiết bị, danh mục hoặc điều kiện tiếp nhận không hợp lệ.
   */
  async xemTruocTaoPhieu(duLieu) {
    const duLieuDaChuanBi = await this.chuanBiDuLieuTaoPhieu(duLieu);
    if (await this.khoPhieu.coPhieuChuaDong(duLieuDaChuanBi.device_id)) {
      throw new LoiUngDung(
        "TICKET_CONFLICT",
        "Thiết bị đang có phiếu chưa đóng.",
      );
    }
    return {
      priority: duLieuDaChuanBi.priority,
      is_warranty: duLieuDaChuanBi.is_warranty,
      received_at: duLieuDaChuanBi.received_at,
      due_date: duLieuDaChuanBi.due_date,
    };
  }

  /**
   * Lưu phiếu cùng thời điểm và hạn cam kết đã được hiển thị ở bước xem trước.
   * @param {Record<string, unknown>} duLieu Dữ liệu phiếu gồm received_at và due_date từ kết quả xem trước.
   * @returns {Promise<object>} Phiếu đã được lưu.
   * @throws {LoiUngDung} Khi dữ liệu nghiệp vụ không hợp lệ hoặc thiết bị đã có phiếu chưa đóng.
   */
  async xacNhanTaoPhieu(duLieu) {
    const duLieuDaChuanBi = await this.chuanBiDuLieuTaoPhieu(duLieu);
    try {
      return await this.khoPhieu.taoPhieu(duLieuDaChuanBi);
    } catch (loi) {
      // Tầng lưu trữ báo mã kỹ thuật; tầng nghiệp vụ chọn lỗi cho API.
      if (loi.code === "DEVICE_HAS_OPEN_TICKET") {
        throw new LoiUngDung(
          "TICKET_CONFLICT",
          "Thiết bị đang có phiếu chưa đóng.",
        );
      }
      throw loi;
    }
  }

  async layChiTietPhieu(maPhieu) {
    const phieu = await this.khoPhieu.layChiTiet(maPhieu);
    if (!phieu) throw new LoiUngDung("NOT_FOUND", "Không tìm thấy phiếu bảo hành.");
    return phieu;
  }

  async capNhatPhieu(maPhieu, duLieu) {
    const phieuHienTai = await this.layChiTietPhieu(maPhieu);
    if (["DA_DONG", "DA_HUY"].includes(phieuHienTai.status)) {
      throw new LoiUngDung("TICKET_NOT_EDITABLE", "Phiếu đã đóng hoặc đã hủy, không thể chỉnh sửa.");
    }

    const danhMuc = await this.khoPhieu.layDanhMucTheoMa(duLieu.category_id);
    if (!danhMuc) {
      throw new LoiUngDung("VALIDATION_FAILED", "Dữ liệu không hợp lệ", {
        category_id: "Nhóm sự cố không hợp lệ",
      });
    }

    const phieuDaCapNhat = await this.khoPhieu.capNhatThongTin(maPhieu, {
      ...duLieu,
      due_date: tinhHanCamKet(phieuHienTai.received_at, duLieu.priority),
    });
    if (!phieuDaCapNhat) {
      throw new LoiUngDung("TICKET_NOT_EDITABLE", "Phiếu đã đóng hoặc đã hủy, không thể chỉnh sửa.");
    }
    return phieuDaCapNhat;
  }

  async dongPhieu(maPhieu) {
    const ketQua = await this.khoPhieu.dongPhieu(maPhieu);
    if (!ketQua) throw new LoiUngDung("NOT_FOUND", "Không tìm thấy phiếu bảo hành.");
    if (ketQua.daDong) {
      throw new LoiUngDung(
        "INVALID_STATUS_TRANSITION",
        "Phiếu đã được đóng trước đó.",
      );
    }
    return ketQua;
  }
}
