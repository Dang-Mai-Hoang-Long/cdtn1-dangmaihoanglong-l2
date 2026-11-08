export default class KhoNguoiDung {
  constructor(boKetNoi) {
    this.boKetNoi = boKetNoi;
  }

  async timTheoTenDangNhap(tenDangNhap) {
    const { rows } = await this.boKetNoi.query(
      `
        SELECT
          u.user_id,
          u.username,
          u.password_hash,
          u.role,
          u.center_id,
          u.is_active,
          CASE
            WHEN u.role = 'QUAN_LY' THEN COALESCE(
              ARRAY_AGG(uc.center_id ORDER BY uc.center_id) FILTER (WHERE uc.center_id IS NOT NULL),
              ARRAY[]::BIGINT[]
            )
            ELSE ARRAY[u.center_id]
          END AS center_ids
        FROM app_user u
        LEFT JOIN user_center uc ON uc.user_id = u.user_id
        WHERE u.username = $1
        GROUP BY u.user_id
      `,
      [tenDangNhap],
    );
    return rows[0] || null;
  }

  async taoNguoiDung({
    tenDangNhap,
    matKhauDaBam,
    vaiTro,
    maTrungTam,
    cacMaTrungTam = [],
  }) {
    const ketNoi = await this.boKetNoi.connect();
    try {
      await ketNoi.query("BEGIN");
      const cacTrungTamQuanLy = [...new Set(cacMaTrungTam.map(Number))];
      if (vaiTro === "QUAN_LY") {
        if (cacTrungTamQuanLy.length === 0) {
          throw new Error("Tài khoản quản lý cần được gán ít nhất một trung tâm.");
        }
        const { rows: trungTamTonTai } = await ketNoi.query(
          "SELECT center_id FROM service_center WHERE center_id = ANY($1::BIGINT[])",
          [cacTrungTamQuanLy],
        );
        if (trungTamTonTai.length !== cacTrungTamQuanLy.length) {
          throw new Error("Một hoặc nhiều mã trung tâm quản lý được gán không tồn tại.");
        }
      }

      const { rows } = await ketNoi.query(
        `
          INSERT INTO app_user (username, password_hash, role, center_id)
          VALUES ($1, $2, $3, $4)
          RETURNING user_id, username, role, center_id, is_active
        `,
        [tenDangNhap, matKhauDaBam, vaiTro, maTrungTam],
      );
      const nguoiDung = rows[0];

      if (vaiTro === "QUAN_LY") {
        await ketNoi.query(
          `
            INSERT INTO user_center (user_id, center_id)
            SELECT $1, cac_trung_tam.center_id
            FROM UNNEST($2::BIGINT[]) AS cac_trung_tam(center_id)
          `,
          [nguoiDung.user_id, cacTrungTamQuanLy],
        );
      }

      await ketNoi.query("COMMIT");
      return {
        ...nguoiDung,
        center_ids: vaiTro === "QUAN_LY"
          ? cacTrungTamQuanLy
          : [Number(maTrungTam)],
      };
    } catch (loi) {
      await ketNoi.query("ROLLBACK");
      throw loi;
    } finally {
      ketNoi.release();
    }
  }

  async taoPhien({ maPhienDaBam, maNguoiDung, hetHan }) {
    await this.boKetNoi.query(
      `
        INSERT INTO app_session (session_hash, user_id, expires_at)
        VALUES ($1, $2, $3)
      `,
      [maPhienDaBam, maNguoiDung, hetHan],
    );
  }

  async timNguoiDungTheoPhien(maPhienDaBam) {
    const { rows } = await this.boKetNoi.query(
      `
        SELECT
          u.user_id,
          u.username,
          u.role,
          u.center_id,
          CASE
            WHEN u.role = 'QUAN_LY' THEN COALESCE(
              ARRAY_AGG(uc.center_id ORDER BY uc.center_id) FILTER (WHERE uc.center_id IS NOT NULL),
              ARRAY[]::BIGINT[]
            )
            ELSE ARRAY[u.center_id]
          END AS center_ids
        FROM app_session s
        JOIN app_user u ON u.user_id = s.user_id
        LEFT JOIN user_center uc ON uc.user_id = u.user_id
        WHERE s.session_hash = $1
          AND s.expires_at > NOW()
          AND u.is_active = TRUE
        GROUP BY u.user_id
      `,
      [maPhienDaBam],
    );
    return rows[0] || null;
  }

  async xoaPhien(maPhienDaBam) {
    await this.boKetNoi.query(
      "DELETE FROM app_session WHERE session_hash = $1",
      [maPhienDaBam],
    );
  }

  async xoaPhienHetHan() {
    await this.boKetNoi.query("DELETE FROM app_session WHERE expires_at <= NOW()");
  }
}
