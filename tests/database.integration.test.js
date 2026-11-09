import test from "node:test";
import assert from "node:assert/strict";
import { execFile as chayLenh } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { guiYeuCauApi } from "./apiTestHelpers.js";
import { chuoiKetNoiTest, dungLaiCoSoDuLieuTest } from "./dbTestHelpers.js";
import { bamMatKhau } from "../src/services/authService.js";
import KhoPhieu from "../src/repositories/ticketRepository.js";
import DichVuPhieu from "../src/services/ticketService.js";

const chayLenhBatDongBo = promisify(chayLenh);
const thuMucDuAn = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function demDuLieu(coSoDuLieu) {
  const { rows } = await coSoDuLieu.query(`
    SELECT
      (SELECT COUNT(*)::int FROM customer) AS customers,
      (SELECT COUNT(*)::int FROM device) AS devices,
      (SELECT COUNT(*)::int FROM ticket) AS tickets,
      (SELECT COUNT(*)::int FROM ticket_status_log) AS logs
  `);
  return rows[0];
}

async function demPhieuVaLogTheoThietBi(coSoDuLieu, maThietBi) {
  const { rows } = await coSoDuLieu.query(
    `
      SELECT
        (SELECT COUNT(*)::int FROM ticket WHERE device_id = $1) AS tickets,
        (
          SELECT COUNT(*)::int
          FROM ticket_status_log l
          JOIN ticket t ON t.ticket_id = l.ticket_id
          WHERE t.device_id = $1
        ) AS logs
    `,
    [maThietBi],
  );
  return rows[0];
}

// TC-03 — API/E2E / luồng đúng: nhân viên xác nhận và tạo phiếu thành công.
test(
  "TC-03 nhân viên tạo phiếu thành công trả về 201 và có ticket_code",
  { skip: !chuoiKetNoiTest, timeout: 180_000 },
  async () => {
    const coSoDuLieu = await dungLaiCoSoDuLieuTest();
    try {
      const {
        rows: [thietBiTrong],
      } = await coSoDuLieu.query(
        `
        SELECT d.device_id, d.customer_id
        FROM device d
        WHERE d.serial_no = $1
          AND NOT EXISTS (
            SELECT 1 FROM ticket t WHERE t.device_id = d.device_id
          )
      `,
        ["DEMO-IMEI-L2-001"],
      );
      assert.ok(thietBiTrong, "Seed phải có thiết bị chưa từng có phiếu");

      // Thứ Sáu 09:00 Bangkok + 72 giờ làm việc (bỏ Chủ nhật) = thứ Ba 09:00.
      const thoiDiemNhan = new Date();
      const soNgayLuiDenThuSau = (thoiDiemNhan.getUTCDay() + 2) % 7;
      thoiDiemNhan.setUTCDate(thoiDiemNhan.getUTCDate() - soNgayLuiDenThuSau);
      thoiDiemNhan.setUTCHours(2, 0, 0, 0);
      const hanCamKetMongDoi = new Date(
        thoiDiemNhan.getTime() + 96 * 60 * 60 * 1000,
      );

      const duLieuGuiDi = {
        customer_id: Number(thietBiTrong.customer_id),
        device_id: Number(thietBiTrong.device_id),
        // Backend phải lấy center_id từ phiên, không tin giá trị client gửi.
        center_id: 1,
        issue_desc: "Máy không nhận sạc khi dùng bộ sạc chính hãng.",
        category_id: 1,
        priority: "TRUNG_BINH",
        received_at: thoiDiemNhan.toISOString(),
      };
      const phanHoiXemTruoc = await guiYeuCauApi(
        coSoDuLieu,
        "/api/tickets/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(duLieuGuiDi),
        },
      );
      assert.equal(phanHoiXemTruoc.maHttp, 200);
      assert.equal(phanHoiXemTruoc.noiDung.priority, duLieuGuiDi.priority);
      assert.equal(phanHoiXemTruoc.noiDung.is_warranty, true);
      assert.equal(
        new Date(phanHoiXemTruoc.noiDung.due_date).toISOString(),
        hanCamKetMongDoi.toISOString(),
      );
      const phanHoi = await guiYeuCauApi(coSoDuLieu, "/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...duLieuGuiDi,
          due_date: phanHoiXemTruoc.noiDung.due_date,
        }),
      });

      assert.equal(phanHoi.maHttp, 201);
      assert.match(phanHoi.noiDung.ticket_code, /^BH-\d{6}\/\d{4}$/);
      assert.equal(phanHoi.noiDung.status, "MOI");
      assert.equal(phanHoi.noiDung.priority, "TRUNG_BINH");
      assert.equal(phanHoi.noiDung.category_id, duLieuGuiDi.category_id);
      assert.equal(
        new Date(phanHoi.noiDung.received_at).toISOString(),
        new Date(phanHoiXemTruoc.noiDung.received_at).toISOString(),
      );
      assert.equal(
        new Date(phanHoi.noiDung.due_date).toISOString(),
        new Date(phanHoiXemTruoc.noiDung.due_date).toISOString(),
      );

      const {
        rows: [phieuDaLuu],
      } = await coSoDuLieu.query(
        `
          SELECT ticket_id, ticket_code, customer_id, device_id, center_id,
                 issue_desc, category_id, priority, status, received_at,
                 due_date, is_warranty
          FROM ticket WHERE ticket_id = $1
        `,
        [phanHoi.noiDung.ticket_id],
      );
      assert.ok(phieuDaLuu, "Phiếu đã xác nhận phải được lưu");
      assert.equal(Number(phieuDaLuu.customer_id), duLieuGuiDi.customer_id);
      assert.equal(Number(phieuDaLuu.device_id), duLieuGuiDi.device_id);
      assert.equal(Number(phieuDaLuu.center_id), 0);
      assert.equal(phieuDaLuu.issue_desc, duLieuGuiDi.issue_desc);
      assert.equal(Number(phieuDaLuu.category_id), duLieuGuiDi.category_id);
      assert.equal(phieuDaLuu.priority, duLieuGuiDi.priority);
      assert.equal(phieuDaLuu.status, "MOI");
      assert.equal(phieuDaLuu.is_warranty, true);
      assert.equal(
        new Date(phieuDaLuu.received_at).toISOString(),
        new Date(phanHoiXemTruoc.noiDung.received_at).toISOString(),
      );
      assert.equal(
        new Date(phieuDaLuu.due_date).toISOString(),
        new Date(phanHoiXemTruoc.noiDung.due_date).toISOString(),
      );

      const {
        rows: [logKhoiTao],
      } = await coSoDuLieu.query(
        `
          SELECT from_status, to_status, changed_by
          FROM ticket_status_log
          WHERE ticket_id = $1 AND to_status = 'MOI'
        `,
        [phanHoi.noiDung.ticket_id],
      );
      assert.ok(logKhoiTao, "Phiếu phải có log khởi tạo trạng thái");
      assert.equal(logKhoiTao.from_status, null);
      assert.equal(logKhoiTao.to_status, "MOI");
      assert.equal(Number(logKhoiTao.changed_by), 1);
      const {
        rows: [demMaPhieu],
      } = await coSoDuLieu.query(
        "SELECT COUNT(*)::int AS total FROM ticket WHERE ticket_code = $1",
        [phieuDaLuu.ticket_code],
      );
      assert.equal(demMaPhieu.total, 1);
    } finally {
      await coSoDuLieu.end();
    }
  },
);

// TC-04 — Integration / luồng đúng: repository lọc, phân trang và sắp mã phiếu.
test(
  "TC-04 repository lọc phiếu MOI và trả trang 2 theo mã tăng dần",
  { skip: !chuoiKetNoiTest, timeout: 180_000 },
  async () => {
    const coSoDuLieu = await dungLaiCoSoDuLieuTest();
    try {
      const khoPhieu = new KhoPhieu(coSoDuLieu);
      const ketQua = await khoPhieu.layDanhSach({
        trangThai: "MOI",
        trang: 2,
        kichThuoc: 5,
        thuTuMaPhieu: "ticket_code_asc",
        centerId: 0,
      });

      assert.equal(ketQua.page, 2);
      assert.equal(ketQua.size, 5);
      assert.equal(ketQua.data.length, 5);
      assert.equal(ketQua.total, 1006);
      assert.ok(ketQua.data.every((phieu) => phieu.status === "MOI"));
      const cacMa = ketQua.data.map((phieu) => phieu.ticket_code);
      assert.deepEqual(cacMa, [...cacMa].sort());
    } finally {
      await coSoDuLieu.end();
    }
  },
);

// TC-10 — Integration / dữ liệu sai: PostgreSQL từ chối tạo phiếu trùng thiết bị đang mở.
test(
  "TC-10 không tạo phiếu khi thiết bị đã có phiếu chưa đóng",
  { skip: !chuoiKetNoiTest, timeout: 180_000 },
  async () => {
    const coSoDuLieu = await dungLaiCoSoDuLieuTest();
    try {
      const { rows: thietBiMo } = await coSoDuLieu.query(
        `
          SELECT d.device_id, d.customer_id
          FROM device d
          JOIN ticket t ON t.device_id = d.device_id
          WHERE d.serial_no = $1
            AND t.status NOT IN ('HOAN_TAT', 'DA_DONG', 'DA_HUY')
          LIMIT 1
        `,
        ["DEMO-IMEI-L2-011"],
      );
      assert.ok(thietBiMo[0], "Seed phải có thiết bị với phiếu đang mở");

      const maThietBi = Number(thietBiMo[0].device_id);
      const demTruoc = await demPhieuVaLogTheoThietBi(coSoDuLieu, maThietBi);
      assert.equal(demTruoc.tickets, 1);
      assert.equal(demTruoc.logs, 1);
      const dichVuPhieu = new DichVuPhieu(new KhoPhieu(coSoDuLieu));
      const thoiDiemNhan = new Date();
      const hanCamKet = new Date(thoiDiemNhan.getTime() + 72 * 60 * 60 * 1000);

      await assert.rejects(
        dichVuPhieu.xacNhanTaoPhieu({
          customer_id: Number(thietBiMo[0].customer_id),
          device_id: maThietBi,
          center_id: 0,
          issue_desc: "Máy không nhận sạc, yêu cầu tạo phiếu trùng.",
          category_id: 1,
          priority: "TRUNG_BINH",
          received_at: thoiDiemNhan,
          due_date: hanCamKet,
        }),
        (loi) =>
          loi.maLoi === "TICKET_CONFLICT" &&
          loi.message === "Thiết bị đang có phiếu chưa đóng.",
      );

      assert.deepEqual(
        await demPhieuVaLogTheoThietBi(coSoDuLieu, maThietBi),
        demTruoc,
      );
    } finally {
      await coSoDuLieu.end();
    }
  },
);

// TC-11 — API/E2E / bảo mật: quản lý đăng nhập nhưng không được gọi API tạo phiếu.
test(
  "TC-11 quản lý gọi API tạo phiếu nhận 403 FORBIDDEN và không phát sinh dữ liệu",
  { skip: !chuoiKetNoiTest, timeout: 180_000 },
  async () => {
    const coSoDuLieu = await dungLaiCoSoDuLieuTest();
    try {
      const tenDangNhap = "quanly-test-tc11";
      const matKhau = "MatKhauKiemThu!2026";
      await coSoDuLieu.query(
        `INSERT INTO app_user (username, password_hash, role, center_id) VALUES ($1, $2, 'QUAN_LY', NULL)`,
        [tenDangNhap, await bamMatKhau(matKhau)],
      );
      const demTruoc = await demDuLieu(coSoDuLieu);
      const phanHoiDangNhap = await guiYeuCauApi(
        coSoDuLieu,
        "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: tenDangNhap, password: matKhau }),
        },
        { dungXacThucThat: true },
      );

      assert.equal(phanHoiDangNhap.maHttp, 200);
      assert.equal(phanHoiDangNhap.noiDung.user.role, "QUAN_LY");
      assert.ok(phanHoiDangNhap.cookiePhien);
      const phanHoiTaoPhieu = await guiYeuCauApi(
        coSoDuLieu,
        "/api/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: phanHoiDangNhap.cookiePhien.split(";")[0],
          },
          body: JSON.stringify({
            customer_id: 1,
            device_id: 1,
            center_id: 0,
            issue_desc: "Yêu cầu thử tạo phiếu từ tài khoản quản lý.",
            category_id: 1,
            received_at: "2026-11-07T09:00:00.000Z",
            due_date: "2026-11-10T09:00:00.000Z",
          }),
        },
        { dungXacThucThat: true },
      );

      assert.equal(phanHoiTaoPhieu.maHttp, 403);
      assert.equal(phanHoiTaoPhieu.noiDung.error.code, "FORBIDDEN");
      assert.equal(
        phanHoiTaoPhieu.noiDung.error.message,
        "Bạn không có quyền thực hiện thao tác này.",
      );
      assert.deepEqual(await demDuLieu(coSoDuLieu), demTruoc);
    } finally {
      await coSoDuLieu.end();
    }
  },
);

// TC-12 — Integration / tái lập: chạy lại seed giữ nguyên số lượng dữ liệu mẫu.
test(
  "TC-12 chạy lại seed không làm tăng số khách hàng, thiết bị, phiếu và log",
  { skip: !chuoiKetNoiTest, timeout: 180_000 },
  async () => {
    const coSoDuLieu = await dungLaiCoSoDuLieuTest();
    try {
      const demTruoc = await demDuLieu(coSoDuLieu);
      await chayLenhBatDongBo(
        process.execPath,
        [resolve(thuMucDuAn, "scripts", "seed.js")],
        {
          cwd: thuMucDuAn,
          env: { ...process.env, DATABASE_URL: chuoiKetNoiTest },
        },
      );
      const demSau = await demDuLieu(coSoDuLieu);
      assert.deepEqual(demSau, demTruoc);
    } finally {
      await coSoDuLieu.end();
    }
  },
);

// TC-15 — dữ liệu sai: HOAN_TAT vẫn là phiếu chưa đóng, không được tạo phiếu mới.
test(
  "TC-15 từ chối tạo phiếu mới khi thiết bị có phiếu HOAN_TAT chưa đóng",
  { skip: !chuoiKetNoiTest, timeout: 180_000 },
  async () => {
    const coSoDuLieu = await dungLaiCoSoDuLieuTest();
    try {
      const {
        rows: [thietBi],
      } = await coSoDuLieu.query(`
        SELECT d.device_id, d.customer_id
        FROM device d
        JOIN ticket t ON t.device_id = d.device_id
        WHERE t.status = 'HOAN_TAT' AND t.closed_at IS NULL
        LIMIT 1
      `);
      assert.ok(thietBi, "Cần dữ liệu thiết bị có phiếu HOAN_TAT chưa đóng");

      const dichVuPhieu = new DichVuPhieu(new KhoPhieu(coSoDuLieu));
      await assert.rejects(
        dichVuPhieu.xacNhanTaoPhieu({
          customer_id: Number(thietBi.customer_id),
          device_id: Number(thietBi.device_id),
          center_id: 0,
          issue_desc: "Yêu cầu tạo phiếu mới khi phiếu cũ chưa đóng.",
          category_id: 1,
          priority: "TRUNG_BINH",
          received_at: new Date(),
          due_date: new Date(Date.now() + 72 * 60 * 60 * 1000),
        }),
        (loi) => loi.maLoi === "TICKET_CONFLICT",
      );
    } finally {
      await coSoDuLieu.end();
    }
  },
);
