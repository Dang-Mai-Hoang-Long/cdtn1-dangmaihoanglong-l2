export default class KhoPhieu {
  constructor(boKetNoi) {
    this.boKetNoi = boKetNoi;
  }

  async layDanhSach({ trangThai, trang = 1, kichThuoc = 20, thuTuMaPhieu } = {}) {
    const cacThamSoLoc = [];
    let dieuKienTrangThai = "";
    if (trangThai) {
      cacThamSoLoc.push(trangThai);
      dieuKienTrangThai = "WHERE t.status = $1";
    }
    const ketQuaDem = await this.boKetNoi.query(
      `
      SELECT COUNT(*)::int AS total
      FROM ticket t
      ${dieuKienTrangThai}
    `,
      cacThamSoLoc,
    );

    const viTriKichThuoc = cacThamSoLoc.length + 1;
    const viTriBatDau = cacThamSoLoc.length + 2;
    const thuTuSql = {
      ticket_code_asc: "t.ticket_code ASC, t.ticket_id ASC",
      ticket_code_desc: "t.ticket_code DESC, t.ticket_id DESC",
    }[thuTuMaPhieu] || "t.received_at DESC, t.ticket_id DESC";
    const cacThamSoDanhSach = [
      ...cacThamSoLoc,
      kichThuoc,
      (trang - 1) * kichThuoc,
    ];

    const { rows: cacDong } = await this.boKetNoi.query(
      `
      SELECT
        t.ticket_id AS ticket_id,
        t.ticket_code AS ticket_code,
        t.customer_id AS customer_id,
        c.full_name AS customer_name,
        t.device_id AS device_id,
        d.serial_no AS serial_no,
        t.status,
        t.priority,
        ic.category_name AS category_name,
        t.received_at AS received_at,
        t.due_date AS due_date
      FROM ticket t
      JOIN customer c ON c.customer_id = t.customer_id
      JOIN device d ON d.device_id = t.device_id
      LEFT JOIN issue_category ic ON ic.category_id = t.category_id
      ${dieuKienTrangThai}
      ORDER BY ${thuTuSql}
      LIMIT $${viTriKichThuoc} OFFSET $${viTriBatDau}
    `,
      cacThamSoDanhSach,
    );

    return {
      data: cacDong,
      page: trang,
      size: kichThuoc,
      total: ketQuaDem.rows[0].total,
    };
  }

  async layDanhMucSuCo() {
    const { rows } = await this.boKetNoi.query(`
      SELECT category_id, category_name, default_priority
      FROM issue_category WHERE is_active = TRUE ORDER BY category_id
    `);
    return rows;
  }

  async timKhachHangTheoMa(maKhachHang) {
    const { rows } = await this.boKetNoi.query(
      "SELECT customer_id FROM customer WHERE customer_id = $1",
      [maKhachHang],
    );
    return rows[0] || null;
  }

  async timThietBiTheoMa(maThietBi) {
    const { rows } = await this.boKetNoi.query(
      `
      SELECT device_id, customer_id, purchase_date, warranty_months
      FROM device WHERE device_id = $1
    `,
      [maThietBi],
    );
    return rows[0] || null;
  }

  async layDanhMucTheoMa(maDanhMuc) {
    const { rows } = await this.boKetNoi.query(
      `
      SELECT category_id, default_priority FROM issue_category
      WHERE category_id = $1 AND is_active = TRUE
    `,
      [maDanhMuc],
    );
    return rows[0] || null;
  }

  async coPhieuChuaDong(maThietBi) {
    const { rows } = await this.boKetNoi.query(
      `
      SELECT 1 FROM ticket
      WHERE device_id = $1 AND status NOT IN ('HOAN_TAT', 'DA_DONG', 'DA_HUY')
      LIMIT 1
    `,
      [maThietBi],
    );
    return rows.length > 0;
  }

  /**
   * Lưu một phiếu và log trạng thái MOI nguyên tử trong một transaction.
   * @param {Record<string, unknown>} duLieu Dữ liệu phiếu đã được service chuẩn bị.
   * @returns {Promise<object>} Phiếu vừa lưu.
   * @throws {Error} Khi CSDL lỗi hoặc thiết bị đã có phiếu chưa đóng; transaction được rollback.
   */
  async taoPhieu(duLieu) {
    const ketNoi = await this.boKetNoi.connect();
    try {
      // Phiếu và log trạng thái phải cùng thành công hoặc cùng rollback.
      await ketNoi.query("BEGIN");
      await ketNoi.query("SELECT pg_advisory_xact_lock($1)", [
        Number(duLieu.device_id),
      ]);
      const { rows: cacPhieuMo } = await ketNoi.query(
        `
        SELECT ticket_id FROM ticket
        WHERE device_id = $1 AND status NOT IN ('HOAN_TAT', 'DA_DONG', 'DA_HUY')
        FOR UPDATE
      `,
        [duLieu.device_id],
      );
      if (cacPhieuMo.length) {
        const loiTranhChap = new Error("Thiết bị đã có phiếu chưa đóng.");
        loiTranhChap.code = "DEVICE_HAS_OPEN_TICKET";
        throw loiTranhChap;
      }

      const { rows: dongId } = await ketNoi.query(
        "SELECT nextval(pg_get_serial_sequence('ticket', 'ticket_id')) AS ticket_id",
      );
      const maPhieu = `BH-${String(dongId[0].ticket_id).padStart(6, "0")}/${new Date(duLieu.received_at).getFullYear()}`;
      const { rows: cacDong } = await ketNoi.query(
        `
        INSERT INTO ticket (
          ticket_id, ticket_code, customer_id, device_id, center_id, issue_desc,
          category_id, priority, status, received_at, due_date, is_warranty
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'MOI', $9, $10, $11
        ) RETURNING ticket_id, received_at, due_date
      `,
        [
          dongId[0].ticket_id,
          maPhieu,
          duLieu.customer_id,
          duLieu.device_id,
          duLieu.center_id,
          duLieu.issue_desc,
          duLieu.category_id,
          duLieu.priority,
          duLieu.received_at,
          duLieu.due_date,
          duLieu.is_warranty,
        ],
      );
      const phieu = cacDong[0];
      // 0 là tác nhân hệ thống cho trạng thái khởi tạo vì L2 chưa có đăng nhập/nhân viên.
      await ketNoi.query(
        `
        INSERT INTO ticket_status_log (
          ticket_id, from_status, to_status, changed_at, changed_by, note
        ) VALUES ($1, NULL, 'MOI', $2, 0, $3)
      `,
        [
          phieu.ticket_id,
          duLieu.received_at,
          "Khởi tạo phiếu ở trạng thái Mới.",
        ],
      );

      const { rows: ketQuaCapNhat } = await ketNoi.query(
        `
        SELECT t.ticket_id, t.ticket_code, t.status, t.category_id, t.priority, t.received_at, t.due_date
        FROM ticket t WHERE t.ticket_id = $1
      `,
        [phieu.ticket_id],
      );
      await ketNoi.query("COMMIT");
      return ketQuaCapNhat[0];
    } catch (loi) {
      await ketNoi.query("ROLLBACK");
      throw loi;
    } finally {
      ketNoi.release();
    }
  }
}
