import { once } from "node:events";
import { taoUngDung } from "../src/app.js";

const middlewareNguoiDungTest = (yeuCau, _phanHoi, tiepTuc) => {
  yeuCau.nguoiDung = {
    user_id: 1,
    username: "nhanvien-test",
    role: "NHAN_VIEN_TIEP_NHAN",
    center_id: 0,
  };
  tiepTuc();
};

/** Gửi request HTTP tới ứng dụng Express trên cổng tạm thời. */
export async function guiYeuCauApi(
  coSoDuLieu,
  duongDan,
  tuyChon = {},
  tuyChonUngDung = {},
) {
  const { dungXacThucThat = false, ...cauHinhUngDung } = tuyChonUngDung;
  const middlewareXacThuc = dungXacThucThat
    ? undefined
    : cauHinhUngDung.middlewareXacThuc || middlewareNguoiDungTest;
  const mayChu = taoUngDung({
    coSoDuLieu,
    ...cauHinhUngDung,
    middlewareXacThuc,
  }).listen(0, "127.0.0.1");
  await once(mayChu, "listening");

  try {
    const { port } = mayChu.address();
    const phanHoi = await fetch(`http://127.0.0.1:${port}${duongDan}`, tuyChon);
    return {
      maHttp: phanHoi.status,
      noiDung: await phanHoi.json(),
      cookiePhien: phanHoi.headers.get("set-cookie"),
    };
  } finally {
    await new Promise((hoanTat) => mayChu.close(() => hoanTat()));
  }
}
