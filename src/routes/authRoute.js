import { Router as BoDinhTuyen } from "express";
import LoiUngDung from "../errors/AppError.js";
import { docMaPhienCookie, tenCookiePhien } from "../middleware/authMiddleware.js";

const soLanSaiToiDa = 5;
const cuaSoGioiHanMs = 15 * 60 * 1000;
const cacLanDangNhapSai = new Map();

function coCookieBaoMat() {
  return process.env.AUTH_COOKIE_SECURE === "true" ||
    (process.env.AUTH_COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production");
}

function taoCookie(maPhien, thoiHanPhien) {
  const soGiay = Math.max(0, Math.floor((thoiHanPhien.getTime() - Date.now()) / 1000));
  const baoMatCookie = coCookieBaoMat() ? "; Secure" : "";
  return `${tenCookiePhien}=${encodeURIComponent(maPhien)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${soGiay}${baoMatCookie}`;
}

function taoCookieHetHan() {
  const baoMatCookie = coCookieBaoMat() ? "; Secure" : "";
  return `${tenCookiePhien}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${baoMatCookie}`;
}

function kiemTraGioiHanDangNhap(yeuCau, phanHoi, tiepTuc) {
  const diaChi = yeuCau.ip || "unknown";
  const mocHienTai = Date.now();
  const lanSai = cacLanDangNhapSai.get(diaChi);
  if (!lanSai || lanSai.hetHan <= mocHienTai) {
    cacLanDangNhapSai.set(diaChi, {
      soLan: 0,
      hetHan: mocHienTai + cuaSoGioiHanMs,
    });
  }
  const lanSaiHienTai = cacLanDangNhapSai.get(diaChi);
  if (lanSaiHienTai.soLan >= soLanSaiToiDa) {
    phanHoi.set("Retry-After", String(Math.ceil((lanSaiHienTai.hetHan - mocHienTai) / 1000)));
    tiepTuc(new LoiUngDung(
      "TOO_MANY_LOGIN_ATTEMPTS",
      "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
    ));
    return;
  }
  tiepTuc();
}

function ghiNhanDangNhapSai(diaChi) {
  const lanSai = cacLanDangNhapSai.get(diaChi);
  if (lanSai) lanSai.soLan += 1;
}

function xoaGioiHanDangNhap(diaChi) {
  cacLanDangNhapSai.delete(diaChi);
  if (cacLanDangNhapSai.size > 5000) {
    const mocHienTai = Date.now();
    for (const [diaChiLuu, lanSai] of cacLanDangNhapSai) {
      if (lanSai.hetHan <= mocHienTai) cacLanDangNhapSai.delete(diaChiLuu);
    }
  }
}

export default function taoTuyenXacThuc(dichVuXacThuc, middlewareXacThuc) {
  const boDinhTuyen = BoDinhTuyen();

  boDinhTuyen.post("/login", kiemTraGioiHanDangNhap, async (yeuCau, phanHoi, tiepTuc) => {
    const diaChi = yeuCau.ip || "unknown";
    try {
      const ketQua = await dichVuXacThuc.dangNhap({
        tenDangNhap: yeuCau.body?.username,
        matKhau: yeuCau.body?.password,
      });
      xoaGioiHanDangNhap(diaChi);
      phanHoi.set("Cache-Control", "no-store");
      phanHoi.set("Set-Cookie", taoCookie(ketQua.maPhien, ketQua.hetHan));
      phanHoi.json({ user: ketQua.nguoiDung });
    } catch (loi) {
      if (loi.maLoi === "INVALID_CREDENTIALS") ghiNhanDangNhapSai(diaChi);
      tiepTuc(loi);
    }
  });

  boDinhTuyen.get("/me", middlewareXacThuc, (yeuCau, phanHoi) => {
    phanHoi.set("Cache-Control", "no-store");
    phanHoi.json({ user: yeuCau.nguoiDung });
  });

  boDinhTuyen.post("/logout", async (yeuCau, phanHoi, tiepTuc) => {
    try {
      await dichVuXacThuc.dangXuat(docMaPhienCookie(yeuCau.headers.cookie));
      phanHoi.set("Set-Cookie", taoCookieHetHan());
      phanHoi.status(204).end();
    } catch (loi) {
      tiepTuc(loi);
    }
  });

  return boDinhTuyen;
}
