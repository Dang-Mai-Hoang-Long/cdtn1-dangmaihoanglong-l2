import { randomBytes, scrypt as maHoaScrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import LoiUngDung from "../errors/AppError.js";

const scrypt = promisify(maHoaScrypt);
const thoiHanPhienMacDinh = 8 * 60 * 60 * 1000;
const bamMatKhauGia = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;

export async function bamMatKhau(matKhau) {
  const muoi = randomBytes(16).toString("hex");
  const khoa = await scrypt(matKhau, muoi, 64);
  return `scrypt$${muoi}$${khoa.toString("hex")}`;
}

async function kiemTraMatKhau(matKhau, chuoiDaBam) {
  const [thuatToan, muoi, khoaHex] = String(chuoiDaBam || "").split("$");
  if (thuatToan !== "scrypt" || !muoi || !/^[a-f0-9]{128}$/i.test(khoaHex || "")) {
    return false;
  }
  const khoaMongDoi = Buffer.from(khoaHex, "hex");
  const khoaNhap = await scrypt(matKhau, muoi, khoaMongDoi.length);
  return timingSafeEqual(khoaNhap, khoaMongDoi);
}

function bamMaPhien(maPhien) {
  return createHash("sha256").update(maPhien).digest("hex");
}

function layNguoiDungCongKhai(nguoiDung) {
  const cacMaTrungTam = Array.isArray(nguoiDung.center_ids)
    ? nguoiDung.center_ids
    : nguoiDung.center_id === null || nguoiDung.center_id === undefined
      ? []
      : [nguoiDung.center_id];
  return {
    user_id: nguoiDung.user_id,
    username: nguoiDung.username,
    role: nguoiDung.role,
    center_id: nguoiDung.center_id,
    center_ids: cacMaTrungTam.map(Number),
  };
}

export default class DichVuXacThuc {
  constructor(khoNguoiDung, { thoiHanPhien = thoiHanPhienMacDinh } = {}) {
    this.khoNguoiDung = khoNguoiDung;
    this.thoiHanPhien = thoiHanPhien;
  }

  async dangNhap({ tenDangNhap, matKhau }) {
    const tenDaChuanHoa = String(tenDangNhap || "").trim();
    const nguoiDung = await this.khoNguoiDung.timTheoTenDangNhap(tenDaChuanHoa);
    const matKhauHopLe = await kiemTraMatKhau(
      String(matKhau || ""),
      nguoiDung?.password_hash || bamMatKhauGia,
    );
    const hopLe = Boolean(nguoiDung?.is_active && matKhauHopLe);

    if (!hopLe) {
      throw new LoiUngDung(
        "INVALID_CREDENTIALS",
        "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    }

    await this.khoNguoiDung.xoaPhienHetHan();
    const maPhien = randomBytes(32).toString("base64url");
    const hetHan = new Date(Date.now() + this.thoiHanPhien);
    await this.khoNguoiDung.taoPhien({
      maPhienDaBam: bamMaPhien(maPhien),
      maNguoiDung: nguoiDung.user_id,
      hetHan,
    });
    return {
      maPhien,
      hetHan,
      nguoiDung: layNguoiDungCongKhai(nguoiDung),
    };
  }

  async xacThuc(maPhien) {
    if (!maPhien) {
      throw new LoiUngDung("UNAUTHENTICATED", "Vui lòng đăng nhập để tiếp tục.");
    }
    const nguoiDung = await this.khoNguoiDung.timNguoiDungTheoPhien(
      bamMaPhien(maPhien),
    );
    if (!nguoiDung) {
      throw new LoiUngDung("UNAUTHENTICATED", "Phiên đăng nhập đã hết hạn.");
    }
    return layNguoiDungCongKhai(nguoiDung);
  }

  async dangXuat(maPhien) {
    if (maPhien) await this.khoNguoiDung.xoaPhien(bamMaPhien(maPhien));
  }
}
