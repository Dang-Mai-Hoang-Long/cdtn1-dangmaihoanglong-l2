import "dotenv/config";
import boKetNoi from "../src/db.js";
import KhoNguoiDung from "../src/repositories/userRepository.js";
import { bamMatKhau } from "../src/services/authService.js";

async function taoTaiKhoanTuBienMoiTruong() {
  const tenDangNhap = String(process.env.APP_USER_USERNAME || "").trim();
  const matKhau = String(process.env.APP_USER_PASSWORD || "");
  const vaiTro = String(process.env.APP_USER_ROLE || "");
  const maTrungTamNhap = process.env.APP_USER_CENTER_ID;
  const danhSachTrungTamNhap = String(process.env.APP_USER_CENTER_IDS || "").trim();

  if (!tenDangNhap || tenDangNhap.length > 80) {
    throw new Error("APP_USER_USERNAME phải có từ 1 đến 80 ký tự.");
  }
  if (matKhau.length < 12 || matKhau.length > 200) {
    throw new Error("APP_USER_PASSWORD phải có từ 12 đến 200 ký tự.");
  }
  if (!["NHAN_VIEN_TIEP_NHAN", "QUAN_LY"].includes(vaiTro)) {
    throw new Error("APP_USER_ROLE phải là NHAN_VIEN_TIEP_NHAN hoặc QUAN_LY.");
  }

  let maTrungTam = null;
  let cacMaTrungTam = [];
  if (vaiTro === "NHAN_VIEN_TIEP_NHAN") {
    maTrungTam = Number(maTrungTamNhap);
    if (!Number.isSafeInteger(maTrungTam) || maTrungTam < 0) {
      throw new Error("Tài khoản nhân viên cần APP_USER_CENTER_ID hợp lệ.");
    }
  } else {
    cacMaTrungTam = danhSachTrungTamNhap
      .split(",")
      .map((ma) => ma.trim())
      .filter(Boolean)
      .map(Number);
    if (
      cacMaTrungTam.length === 0 ||
      cacMaTrungTam.some((ma) => !Number.isSafeInteger(ma) || ma < 0)
    ) {
      throw new Error("Tài khoản quản lý cần APP_USER_CENTER_IDS, là danh sách ID trung tâm phân cách bằng dấu phẩy.");
    }
    cacMaTrungTam = [...new Set(cacMaTrungTam)];
  }

  const khoNguoiDung = new KhoNguoiDung(boKetNoi);
  const nguoiDung = await khoNguoiDung.taoNguoiDung({
    tenDangNhap,
    matKhauDaBam: await bamMatKhau(matKhau),
    vaiTro,
    maTrungTam,
    cacMaTrungTam,
  });
  const chiTietTrungTam = nguoiDung.center_ids.join(", ");
  console.log(`Đã tạo tài khoản ${nguoiDung.username} với vai trò ${nguoiDung.role}; trung tâm: ${chiTietTrungTam}.`);
}

taoTaiKhoanTuBienMoiTruong()
  .catch((loi) => {
    console.error("Không thể tạo tài khoản:", loi.message);
    process.exitCode = 1;
  })
  .finally(() => boKetNoi.end());
