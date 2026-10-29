import LoiUngDung from "../errors/AppError.js";

const cacTrangThaiPhieu = [
  "MOI",
  "DA_PHAN_CONG",
  "DANG_XU_LY",
  "CHO_LINH_KIEN",
  "HOAN_TAT",
  "DA_DONG",
];

function docSoNguyenDuong(
  giaTri,
  macDinh,
  tenTruong,
  loiTheoTruong,
  gioiHanToiDa,
) {
  if (giaTri === undefined) return macDinh;

  const chuoiGiaTri = String(giaTri);
  const so = Number(chuoiGiaTri);
  const khongHopLe =
    !/^\d+$/.test(chuoiGiaTri) ||
    !Number.isSafeInteger(so) ||
    so < 1 ||
    (gioiHanToiDa !== undefined && so > gioiHanToiDa);

  if (khongHopLe) {
    loiTheoTruong[tenTruong] = gioiHanToiDa
      ? `Phải là số nguyên từ 1 đến ${gioiHanToiDa}`
      : "Phải là số nguyên dương";
    return macDinh;
  }

  return so;
}

/**
 * Kiểm tra và chuẩn hóa query cho GET /api/tickets.
 * @param {Record<string, unknown>} truyVan Query string từ Express.
 * @returns {{trangThai: string|undefined, trang: number, kichThuoc: number, thuTuMaPhieu: string|undefined}} Bộ lọc, phân trang và sắp xếp đã chuẩn hóa.
 * @throws {LoiUngDung} Khi trạng thái, tham số phân trang hoặc thứ tự sắp xếp không hợp lệ.
 */
export function kiemTraTruyVanDanhSachPhieu(truyVan = {}) {
  const trangThai = truyVan.status;
  if (
    trangThai !== undefined &&
    (typeof trangThai !== "string" || !cacTrangThaiPhieu.includes(trangThai))
  ) {
    throw new LoiUngDung(
      "INVALID_STATUS",
      "Trạng thái phiếu bảo hành không hợp lệ",
      { status: "Giá trị trạng thái không được hỗ trợ" },
    );
  }

  const loiTheoTruong = {};
  const thuTuMaPhieu = truyVan.sort;
  const cacThuTuMaPhieu = ["ticket_code_asc", "ticket_code_desc"];
  if (
    thuTuMaPhieu !== undefined &&
    (typeof thuTuMaPhieu !== "string" || !cacThuTuMaPhieu.includes(thuTuMaPhieu))
  ) {
    throw new LoiUngDung(
      "INVALID_SORT_ORDER",
      "Thứ tự sắp xếp mã phiếu không hợp lệ",
      { sort: "Giá trị sắp xếp không được hỗ trợ" },
    );
  }

  const trang = docSoNguyenDuong(truyVan.page, 1, "page", loiTheoTruong);
  const kichThuoc = docSoNguyenDuong(
    truyVan.size,
    20,
    "size",
    loiTheoTruong,
    100,
  );

  if (Object.keys(loiTheoTruong).length > 0) {
    throw new LoiUngDung(
      "INVALID_PAGE_SIZE",
      "Tham số phân trang không hợp lệ",
      loiTheoTruong,
    );
  }

  return { trangThai, trang, kichThuoc, thuTuMaPhieu };
}

/**
 * Kiểm tra dữ liệu tạo phiếu; bước lưu yêu cầu kèm thời điểm và hạn đã xem trước.
 * @param {Record<string, unknown>} duLieu Dữ liệu JSON từ client.
 * @param {{batBuocHanDaXemTruoc?: boolean}} tuyChon Có bắt buộc nhận lại hai mốc thời gian xem trước hay không.
 * @returns {Record<string, unknown>} Dữ liệu đã kiểm tra và đổi kiểu cần thiết.
 * @throws {LoiUngDung} Khi dữ liệu không hợp lệ hoặc thiếu hạn xem trước ở bước lưu.
 */
export function kiemTraDuLieuTaoPhieu(
  duLieu = {},
  { batBuocHanDaXemTruoc = false } = {},
) {
  const loiTheoTruong = {};
  const cacTruongSo = ["customer_id", "device_id", "center_id", "category_id"];
  const ketQua = {};
  for (const tenTruong of cacTruongSo) {
    const giaTri = Number(duLieu[tenTruong]);
    const giaTriNhoNhat = tenTruong === "center_id" ? 0 : 1;
    if (!Number.isSafeInteger(giaTri) || giaTri < giaTriNhoNhat)
      loiTheoTruong[tenTruong] = tenTruong === "center_id"
        ? "Phải là số nguyên không âm"
        : "Phải là số nguyên dương";
    else ketQua[tenTruong] = giaTri;
  }
  if (typeof duLieu.issue_desc !== "string" || !duLieu.issue_desc.trim()) {
    loiTheoTruong.issue_desc = "Mô tả lỗi không được để trống";
  } else ketQua.issue_desc = duLieu.issue_desc.trim();
  if (
    duLieu.priority !== undefined &&
    !["CAO", "TRUNG_BINH", "THAP"].includes(duLieu.priority)
  ) {
    loiTheoTruong.priority = "Mức ưu tiên không hợp lệ";
  } else if (duLieu.priority !== undefined) ketQua.priority = duLieu.priority;

  if (duLieu.received_at !== undefined) {
    const thoiDiemNhan = new Date(duLieu.received_at);
    if (
      typeof duLieu.received_at !== "string" ||
      !Number.isFinite(thoiDiemNhan.getTime())
    ) {
      loiTheoTruong.received_at = "Thời điểm tiếp nhận không hợp lệ";
    } else {
      ketQua.received_at = thoiDiemNhan;
    }
  } else if (batBuocHanDaXemTruoc) {
    loiTheoTruong.received_at = "Thiếu thời điểm tiếp nhận đã xem trước";
  }

  if (duLieu.due_date !== undefined) {
    const hanCamKet = new Date(duLieu.due_date);
    if (
      typeof duLieu.due_date !== "string" ||
      !Number.isFinite(hanCamKet.getTime())
    ) {
      loiTheoTruong.due_date = "Hạn cam kết không hợp lệ";
    } else {
      ketQua.due_date = hanCamKet;
    }
  } else if (batBuocHanDaXemTruoc) {
    loiTheoTruong.due_date = "Thiếu hạn cam kết đã xem trước";
  }

  if (
    ketQua.received_at &&
    ketQua.due_date &&
    ketQua.due_date <= ketQua.received_at
  ) {
    loiTheoTruong.due_date = "Hạn cam kết phải sau thời điểm tiếp nhận";
  }

  if (Object.keys(loiTheoTruong).length) {
    throw new LoiUngDung(
      "VALIDATION_FAILED",
      "Dữ liệu không hợp lệ",
      loiTheoTruong,
    );
  }
  return ketQua;
}

/**
 * Kiểm tra mã phiếu nhận từ URL.
 * @param {unknown} giaTri Mã phiếu trong tham số đường dẫn.
 * @returns {number} Mã phiếu đã chuyển thành số nguyên dương.
 */
export function kiemTraMaPhieu(giaTri) {
  const maPhieu = Number(giaTri);
  if (!Number.isSafeInteger(maPhieu) || maPhieu < 1) {
    throw new LoiUngDung("VALIDATION_FAILED", "Mã phiếu không hợp lệ", {
      ticket_id: "Phải là số nguyên dương",
    });
  }
  return maPhieu;
}

/**
 * Kiểm tra các trường được phép chỉnh sửa sau khi tạo phiếu.
 * @param {Record<string, unknown>} duLieu Dữ liệu JSON từ client.
 * @returns {{issue_desc: string, category_id: number, priority: string}} Dữ liệu đã chuẩn hóa.
 */
export function kiemTraDuLieuCapNhatPhieu(duLieu = {}) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw new LoiUngDung("VALIDATION_FAILED", "Dữ liệu không hợp lệ", {
      body: "Phải là một đối tượng JSON",
    });
  }
  const loiTheoTruong = {};
  const issueDesc = typeof duLieu.issue_desc === "string" ? duLieu.issue_desc.trim() : "";
  const categoryId = Number(duLieu.category_id);
  const cacMucUuTien = ["CAO", "TRUNG_BINH", "THAP"];

  if (!issueDesc) loiTheoTruong.issue_desc = "Mô tả lỗi không được để trống";
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    loiTheoTruong.category_id = "Phải là mã nhóm sự cố hợp lệ";
  }
  if (!cacMucUuTien.includes(duLieu.priority)) {
    loiTheoTruong.priority = "Mức ưu tiên không hợp lệ";
  }

  if (Object.keys(loiTheoTruong).length) {
    throw new LoiUngDung("VALIDATION_FAILED", "Dữ liệu không hợp lệ", loiTheoTruong);
  }

  return { issue_desc: issueDesc, category_id: categoryId, priority: duLieu.priority };
}

/** Chỉ cho phép yêu cầu đóng phiếu theo trạng thái đích DA_DONG. */
export function kiemTraDuLieuDongPhieu(duLieu = {}) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw new LoiUngDung("VALIDATION_FAILED", "Dữ liệu không hợp lệ", {
      body: "Phải là một đối tượng JSON",
    });
  }
  if (duLieu.status !== "DA_DONG") {
    throw new LoiUngDung("VALIDATION_FAILED", "Trạng thái đóng phiếu không hợp lệ", {
      status: "Chỉ hỗ trợ chuyển phiếu sang trạng thái DA_DONG",
    });
  }
  return { status: "DA_DONG" };
}
