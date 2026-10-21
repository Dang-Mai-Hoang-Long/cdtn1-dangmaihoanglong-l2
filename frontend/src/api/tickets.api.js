import { guiYeuCau } from './client.js';

export const phieuApi = {
  /** Lấy danh sách phiếu, tùy chọn lọc trạng thái và phân trang theo hợp đồng API. */
  layDanhSach: ({ trangThai, trang, kichThuoc, signal } = {}) => {
    const thamSo = new URLSearchParams();
    if (trangThai) thamSo.set('status', trangThai);
    if (trang !== undefined) thamSo.set('page', String(trang));
    if (kichThuoc !== undefined) thamSo.set('size', String(kichThuoc));

    const chuoiTruyVan = thamSo.toString();
    const truyVan = chuoiTruyVan ? `?${chuoiTruyVan}` : '';
    return guiYeuCau(`/api/tickets${truyVan}`, { signal });
  }
};
