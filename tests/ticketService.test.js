import test from "node:test";
import assert from "node:assert/strict";
import DichVuPhieu from "../src/services/ticketService.js";

function taoKhoGia({ ngayMua = "2099-10-01" } = {}) {
  const cacPhieuDaLuu = [];
  return {
    cacPhieuDaLuu,
    async timKhachHangTheoMa(ma) {
      return [1, 99].includes(ma) ? { customer_id: ma } : null;
    },
    async timThietBiTheoMa(ma) {
      return ma === 2
        ? {
            device_id: 2,
            customer_id: 1,
            purchase_date: ngayMua,
            warranty_months: 12,
          }
        : null;
    },
    async layDanhMucTheoMa(ma) {
      return ma === 3
        ? { category_id: 3, default_priority: "TRUNG_BINH" }
        : null;
    },
    async taoPhieu(duLieu) {
      cacPhieuDaLuu.push(duLieu);
      return {
        ticket_id: 101,
        ticket_code: "BH-000101/2026",
        status: "MOI",
        priority: duLieu.priority,
        received_at: duLieu.received_at,
        due_date: duLieu.due_date,
      };
    },
  };
}

test("TC-01 | AC2.1/AC4.1: tạo phiếu hợp lệ với ưu tiên và hạn đã xác nhận", async () => {
  const khoPhieu = taoKhoGia();
  const dichVu = new DichVuPhieu(khoPhieu);
  const duLieuXemTruoc = {
    customer_id: 1,
    device_id: 2,
    center_id: 0,
    issue_desc: "Máy không nhận sạc",
    category_id: 3,
    priority: "CAO",
    received_at: "2026-10-20T09:00:00.000Z",
    due_date: "2026-10-21T09:00:00.000Z",
  };

  const phieu = await dichVu.xacNhanTaoPhieu(duLieuXemTruoc);

  assert.equal(phieu.status, "MOI");
  assert.equal(phieu.priority, "CAO");
  assert.equal(khoPhieu.cacPhieuDaLuu.length, 1);
  assert.equal(khoPhieu.cacPhieuDaLuu[0].is_warranty, true);
  assert.equal(
    khoPhieu.cacPhieuDaLuu[0].due_date.toISOString(),
    duLieuXemTruoc.due_date,
  );
});

test("TC-02 | QT-03: từ chối thiết bị không thuộc khách hàng đang chọn", async () => {
  const khoPhieu = taoKhoGia();
  const dichVu = new DichVuPhieu(khoPhieu);

  await assert.rejects(
    dichVu.xacNhanTaoPhieu({
      customer_id: 99,
      device_id: 2,
      center_id: 0,
      issue_desc: "Máy không nhận sạc",
      category_id: 3,
      received_at: "2026-10-20T09:00:00.000Z",
      due_date: "2026-10-21T09:00:00.000Z",
    }),
    (loi) => loi.maLoi === "DEVICE_CUSTOMER_MISMATCH",
  );
  assert.equal(khoPhieu.cacPhieuDaLuu.length, 0);
});

test("TC-03 | QT-04/FR5: SLA 24 giờ từ thứ Bảy bỏ qua Chủ nhật", async () => {
  const dichVu = new DichVuPhieu(taoKhoGia());
  const thoiDiemNhan = new Date(2026, 9, 24, 9, 0, 0);
  const duLieuDaChuanBi = await dichVu.chuanBiDuLieuTaoPhieu({
    customer_id: 1,
    device_id: 2,
    center_id: 0,
    issue_desc: "Máy không nhận sạc",
    category_id: 3,
    priority: "CAO",
    received_at: thoiDiemNhan.toISOString(),
  });

  assert.equal(
    duLieuDaChuanBi.due_date.toISOString(),
    new Date(2026, 9, 26, 9, 0, 0).toISOString(),
  );
});

test("TC-04 | QT-05: không tạo phiếu cho thiết bị đã hết hạn bảo hành", async () => {
  const khoPhieu = taoKhoGia({ ngayMua: "2020-01-01" });
  const dichVu = new DichVuPhieu(khoPhieu);

  await assert.rejects(
    dichVu.xacNhanTaoPhieu({
      customer_id: 1,
      device_id: 2,
      center_id: 0,
      issue_desc: "Máy không nhận sạc",
      category_id: 3,
      received_at: "2026-10-20T09:00:00.000Z",
      due_date: "2026-10-21T09:00:00.000Z",
    }),
    (loi) => loi.maLoi === "WARRANTY_NOT_APPROVED",
  );
  assert.equal(khoPhieu.cacPhieuDaLuu.length, 0);
});
