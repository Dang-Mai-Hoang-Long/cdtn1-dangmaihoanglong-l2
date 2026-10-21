import LoiUngDung from '../errors/AppError.js';

const cacTrangThaiPhieu = [
  'MOI',
  'DA_PHAN_CONG',
  'DANG_XU_LY',
  'CHO_LINH_KIEN',
  'HOAN_TAT',
  'DA_DONG'
];

function docSoNguyenDuong(giaTri, macDinh, tenTruong, loiTheoTruong, gioiHanToiDa) {
  if (giaTri === undefined) return macDinh;

  const chuoiGiaTri = String(giaTri);
  const so = Number(chuoiGiaTri);
  const khongHopLe = !/^\d+$/.test(chuoiGiaTri)
    || !Number.isSafeInteger(so)
    || so < 1
    || (gioiHanToiDa !== undefined && so > gioiHanToiDa);

  if (khongHopLe) {
    loiTheoTruong[tenTruong] = gioiHanToiDa
      ? `Phải là số nguyên từ 1 đến ${gioiHanToiDa}`
      : 'Phải là số nguyên dương';
    return macDinh;
  }

  return so;
}

/**
 * Kiểm tra và chuẩn hóa query cho GET /api/tickets.
 * @param {Record<string, unknown>} truyVan Query string từ Express.
 * @returns {{trangThai: string|undefined, trang: number, kichThuoc: number}} Bộ lọc và phân trang đã chuẩn hóa.
 * @throws {LoiUngDung} Khi trạng thái hoặc tham số phân trang không hợp lệ.
 */
export function kiemTraTruyVanDanhSachPhieu(truyVan = {}) {
  const trangThai = truyVan.status;
  if (trangThai !== undefined
    && (typeof trangThai !== 'string' || !cacTrangThaiPhieu.includes(trangThai))) {
    throw new LoiUngDung(
      'INVALID_STATUS',
      'Trạng thái phiếu bảo hành không hợp lệ',
      { status: 'Giá trị trạng thái không được hỗ trợ' }
    );
  }

  const loiTheoTruong = {};
  const trang = docSoNguyenDuong(truyVan.page, 1, 'page', loiTheoTruong);
  const kichThuoc = docSoNguyenDuong(truyVan.size, 20, 'size', loiTheoTruong, 100);

  if (Object.keys(loiTheoTruong).length > 0) {
    throw new LoiUngDung('INVALID_PAGE_SIZE', 'Tham số phân trang không hợp lệ', loiTheoTruong);
  }

  return { trangThai, trang, kichThuoc };
}
