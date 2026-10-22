const duongDanGocApi = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/+$/,
  "",
);

export class LoiApi extends Error {
  constructor(maHttp, maLoi, thongDiep, loiTheoTruong = {}) {
    super(thongDiep);
    this.name = "LoiApi";
    this.maHttp = maHttp;
    this.maLoi = maLoi;
    this.loiTheoTruong = loiTheoTruong;
  }
}

/**
 * Gửi yêu cầu JSON tới backend và chuẩn hóa lỗi trả về.
 * @param {string} duongDan Đường dẫn API, thường bắt đầu bằng /api/.
 * @param {RequestInit} tuyChon Tùy chọn của fetch, có thể truyền signal để hủy yêu cầu.
 * @returns {Promise<unknown>} Nội dung JSON của phản hồi; trả null với HTTP 204.
 * @throws {LoiApi} Khi server trả lỗi hoặc không thể kết nối.
 */
export async function guiYeuCau(duongDan, tuyChon = {}) {
  const tieuDe = new Headers(tuyChon.headers);
  tieuDe.set("Accept", "application/json");
  if (tuyChon.body && !tieuDe.has("Content-Type")) {
    tieuDe.set("Content-Type", "application/json");
  }

  let phanHoi;
  try {
    phanHoi = await fetch(`${duongDanGocApi}${duongDan}`, {
      ...tuyChon,
      headers: tieuDe,
    });
  } catch (loi) {
    if (loi.name === "AbortError") throw loi;
    throw new LoiApi(
      0,
      "LOI_KET_NOI",
      "Không thể kết nối tới máy chủ. Vui lòng thử lại.",
    );
  }

  if (phanHoi.status === 204) return null;

  let duLieu = null;
  try {
    duLieu = await phanHoi.json();
  } catch {
    if (phanHoi.ok) return null;
  }

  if (!phanHoi.ok) {
    const loiMayChu =
      duLieu?.error && typeof duLieu.error === "object" ? duLieu.error : duLieu;
    const maLoi =
      loiMayChu?.code ||
      (typeof duLieu?.error === "string"
        ? duLieu.error
        : `HTTP_${phanHoi.status}`);
    const thongDiep =
      loiMayChu?.message || "Yêu cầu không thể xử lý. Vui lòng thử lại.";
    const loiTheoTruong = loiMayChu?.fields || loiMayChu?.chi_tiet || {};

    throw new LoiApi(phanHoi.status, maLoi, thongDiep, loiTheoTruong);
  }

  return duLieu;
}
