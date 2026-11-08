import LoiUngDung from "../errors/AppError.js";

export const vaiTroNhanVien = "NHAN_VIEN_TIEP_NHAN";
export const vaiTroQuanLy = "QUAN_LY";
export const tenCookiePhien = "mekong_session";

export function docMaPhienCookie(chuoiCookie = "") {
  for (const phanCookie of chuoiCookie.split(";")) {
    const viTriDauBang = phanCookie.indexOf("=");
    if (viTriDauBang < 0) continue;
    const ten = phanCookie.slice(0, viTriDauBang).trim();
    if (ten === tenCookiePhien) {
      return decodeURIComponent(phanCookie.slice(viTriDauBang + 1).trim());
    }
  }
  return "";
}

export function taoMiddlewareXacThuc(dichVuXacThuc) {
  return async (yeuCau, _phanHoi, tiepTuc) => {
    try {
      const maPhien = docMaPhienCookie(yeuCau.headers.cookie);
      yeuCau.nguoiDung = await dichVuXacThuc.xacThuc(maPhien);
      tiepTuc();
    } catch (loi) {
      tiepTuc(loi);
    }
  };
}

export function taoMiddlewareVaiTro(...cacVaiTroDuocPhep) {
  return (yeuCau, _phanHoi, tiepTuc) => {
    if (!cacVaiTroDuocPhep.includes(yeuCau.nguoiDung?.role)) {
      tiepTuc(
        new LoiUngDung("FORBIDDEN", "Bạn không có quyền thực hiện thao tác này."),
      );
      return;
    }
    tiepTuc();
  };
}
