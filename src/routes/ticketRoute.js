import { Router as BoDinhTuyen } from "express";
import {
  kiemTraDuLieuCapNhatPhieu,
  kiemTraDuLieuDongPhieu,
  kiemTraDuLieuTaoPhieu,
  kiemTraMaPhieu,
  kiemTraTruyVanDanhSachPhieu,
} from "../validators/ticketValidator.js";

export default function taoTuyenPhieu(dichVuPhieu) {
  const boDinhTuyen = BoDinhTuyen();

  boDinhTuyen.get("/", async (yeuCau, phanHoi) => {
    const tuyChonDanhSach = kiemTraTruyVanDanhSachPhieu(yeuCau.query);
    const ketQua = await dichVuPhieu.layDanhSachPhieu(tuyChonDanhSach);
    phanHoi.json(ketQua);
  });

  boDinhTuyen.get("/categories", async (_yeuCau, phanHoi) => {
    phanHoi.json(await dichVuPhieu.layDanhMucSuCo());
  });

  boDinhTuyen.get("/:maPhieu", async (yeuCau, phanHoi) => {
    const maPhieu = kiemTraMaPhieu(yeuCau.params.maPhieu);
    phanHoi.json(await dichVuPhieu.layChiTietPhieu(maPhieu));
  });

  boDinhTuyen.post("/preview", async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDuLieuTaoPhieu(yeuCau.body);
    phanHoi.json(await dichVuPhieu.xemTruocTaoPhieu(duLieu));
  });

  boDinhTuyen.post("/", async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDuLieuTaoPhieu(yeuCau.body, {
      batBuocHanDaXemTruoc: true,
    });
    const phieu = await dichVuPhieu.xacNhanTaoPhieu(duLieu);
    phanHoi.status(201).json(phieu);
  });

  boDinhTuyen.put("/:maPhieu", async (yeuCau, phanHoi) => {
    const maPhieu = kiemTraMaPhieu(yeuCau.params.maPhieu);
    const duLieu = kiemTraDuLieuCapNhatPhieu(yeuCau.body);
    phanHoi.json(await dichVuPhieu.capNhatPhieu(maPhieu, duLieu));
  });

  boDinhTuyen.patch("/:maPhieu/status", async (yeuCau, phanHoi) => {
    const maPhieu = kiemTraMaPhieu(yeuCau.params.maPhieu);
    kiemTraDuLieuDongPhieu(yeuCau.body);
    phanHoi.json(await dichVuPhieu.dongPhieu(maPhieu));
  });

  return boDinhTuyen;
}
