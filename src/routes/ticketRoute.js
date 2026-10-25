import { Router as BoDinhTuyen } from "express";
import {
  kiemTraDuLieuTaoPhieu,
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

  return boDinhTuyen;
}
