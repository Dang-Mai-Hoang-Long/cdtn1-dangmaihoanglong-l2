import { Router as BoDinhTuyen } from "express";
import { kiemTraTruyVanDanhSachPhieu } from '../validators/ticketValidator.js';

export default function taoTuyenPhieu(dichVuPhieu) {
  const boDinhTuyen = BoDinhTuyen();

  boDinhTuyen.get("/", async (yeuCau, phanHoi) => {
    const tuyChonDanhSach = kiemTraTruyVanDanhSachPhieu(yeuCau.query);
    const ketQua = await dichVuPhieu.layDanhSachPhieu(tuyChonDanhSach);
    phanHoi.json(ketQua);
  });

  return boDinhTuyen;
}
