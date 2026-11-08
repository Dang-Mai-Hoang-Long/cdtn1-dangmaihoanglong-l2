import { Router as BoDinhTuyen } from "express";
import {
  kiemTraDuLieuCapNhatPhieu,
  kiemTraDuLieuDongPhieu,
  kiemTraDuLieuTaoPhieu,
  kiemTraMaPhieu,
  kiemTraTruyVanDanhSachPhieu,
} from "../validators/ticketValidator.js";
import {
  taoMiddlewareVaiTro,
  vaiTroNhanVien,
} from "../middleware/authMiddleware.js";

export default function taoTuyenPhieu(dichVuPhieu) {
  const boDinhTuyen = BoDinhTuyen();
  const chiNhanVien = taoMiddlewareVaiTro(vaiTroNhanVien);

  boDinhTuyen.get("/", async (yeuCau, phanHoi) => {
    const tuyChonDanhSach = kiemTraTruyVanDanhSachPhieu(yeuCau.query);
    const ketQua = await dichVuPhieu.layDanhSachPhieu(
      tuyChonDanhSach,
      yeuCau.nguoiDung,
    );
    phanHoi.json(ketQua);
  });

  boDinhTuyen.get("/categories", async (_yeuCau, phanHoi) => {
    phanHoi.json(await dichVuPhieu.layDanhMucSuCo());
  });

  boDinhTuyen.get("/:maPhieu", async (yeuCau, phanHoi) => {
    const maPhieu = kiemTraMaPhieu(yeuCau.params.maPhieu);
    phanHoi.json(await dichVuPhieu.layChiTietPhieu(maPhieu, yeuCau.nguoiDung));
  });

  boDinhTuyen.post("/preview", chiNhanVien, async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDuLieuTaoPhieu({
      ...yeuCau.body,
      center_id: yeuCau.nguoiDung.center_id,
    });
    phanHoi.json(await dichVuPhieu.xemTruocTaoPhieu(duLieu));
  });

  boDinhTuyen.post("/", chiNhanVien, async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDuLieuTaoPhieu({
      ...yeuCau.body,
      center_id: yeuCau.nguoiDung.center_id,
    }, {
      batBuocHanDaXemTruoc: true,
    });
    duLieu.changed_by = yeuCau.nguoiDung.user_id;
    const phieu = await dichVuPhieu.xacNhanTaoPhieu(duLieu);
    phanHoi.status(201).json(phieu);
  });

  boDinhTuyen.put("/:maPhieu", chiNhanVien, async (yeuCau, phanHoi) => {
    const maPhieu = kiemTraMaPhieu(yeuCau.params.maPhieu);
    const duLieu = kiemTraDuLieuCapNhatPhieu(yeuCau.body);
    phanHoi.json(await dichVuPhieu.capNhatPhieu(maPhieu, duLieu, yeuCau.nguoiDung));
  });

  boDinhTuyen.patch("/:maPhieu/status", chiNhanVien, async (yeuCau, phanHoi) => {
    const maPhieu = kiemTraMaPhieu(yeuCau.params.maPhieu);
    kiemTraDuLieuDongPhieu(yeuCau.body);
    phanHoi.json(await dichVuPhieu.dongPhieu(maPhieu, yeuCau.nguoiDung));
  });

  return boDinhTuyen;
}
