import { Router as BoDinhTuyen } from "express";

export default function taoTuyenKhachHang(dichVuKhachHang) {
  const boDinhTuyen = BoDinhTuyen();
  boDinhTuyen.get("/", async (yeuCau, phanHoi) => {
    phanHoi.json(await dichVuKhachHang.timTheoSoDienThoai(yeuCau.query.phone));
  });
  return boDinhTuyen;
}
