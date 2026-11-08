import "dotenv/config";
import boKetNoi from "../src/db.js";
import { bamMatKhau } from "../src/services/authService.js";

const matKhauTaiKhoanDemo = "MekongL2Demo!2026";
const cacTaiKhoanDemo = [
  {
    tenDangNhap: "nv.trungtam-a.1",
    vaiTro: "NHAN_VIEN_TIEP_NHAN",
    maTrungTam: 0,
  },
  {
    tenDangNhap: "nv.trungtam-a.2",
    vaiTro: "NHAN_VIEN_TIEP_NHAN",
    maTrungTam: 0,
  },
  {
    tenDangNhap: "nv.trungtam-b.1",
    vaiTro: "NHAN_VIEN_TIEP_NHAN",
    maTrungTam: 1,
  },
  {
    tenDangNhap: "nv.trungtam-b.2",
    vaiTro: "NHAN_VIEN_TIEP_NHAN",
    maTrungTam: 1,
  },
  {
    tenDangNhap: "quanly",
    vaiTro: "QUAN_LY",
    maTrungTam: null,
    cacMaTrungTam: [0, 1],
  },
];

async function taoNguoiDungDemo() {
  const ketNoi = await boKetNoi.connect();
  try {
    await ketNoi.query("BEGIN");
    for (const taiKhoan of cacTaiKhoanDemo) {
      const matKhauDaBam = await bamMatKhau(matKhauTaiKhoanDemo);
      const { rows } = await ketNoi.query(
        `
          INSERT INTO app_user (username, password_hash, role, center_id, is_active)
          VALUES ($1, $2, $3, $4, TRUE)
          ON CONFLICT (username) DO UPDATE
          SET password_hash = EXCLUDED.password_hash,
              role = EXCLUDED.role,
              center_id = EXCLUDED.center_id,
              is_active = TRUE
          RETURNING user_id
        `,
        [
          taiKhoan.tenDangNhap,
          matKhauDaBam,
          taiKhoan.vaiTro,
          taiKhoan.maTrungTam,
        ],
      );
      if (taiKhoan.vaiTro === "QUAN_LY") {
        await ketNoi.query("DELETE FROM user_center WHERE user_id = $1", [rows[0].user_id]);
        await ketNoi.query(
          `
            INSERT INTO user_center (user_id, center_id)
            SELECT $1, cac_trung_tam.center_id
            FROM UNNEST($2::BIGINT[]) AS cac_trung_tam(center_id)
          `,
          [rows[0].user_id, taiKhoan.cacMaTrungTam],
        );
      }
    }
    await ketNoi.query("COMMIT");
    console.log("Đã tạo hoặc cập nhật 5 tài khoản demo.");
  } catch (loi) {
    await ketNoi.query("ROLLBACK");
    throw loi;
  } finally {
    ketNoi.release();
  }
}

taoNguoiDungDemo()
  .catch((loi) => {
    console.error("Không thể tạo tài khoản demo:", loi.message);
    process.exitCode = 1;
  })
  .finally(() => boKetNoi.end());
