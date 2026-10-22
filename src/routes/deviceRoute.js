import { Router as BoDinhTuyen } from "express";
import { kiemTraTruyVanThietBi } from "../validators/deviceValidator.js";

export default function taoTuyenThietBi(dichVuThietBi) {
  const boDinhTuyen = BoDinhTuyen();
  boDinhTuyen.get("/", async (yeuCau, phanHoi) => {
    const { maKhachHang, soSerial } = kiemTraTruyVanThietBi(yeuCau.query);
    const thietBi = await dichVuThietBi.timTheoSerial(soSerial, maKhachHang);
    phanHoi.json(thietBi);
  });
  return boDinhTuyen;
}
