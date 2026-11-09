import test from "node:test";
import assert from "node:assert/strict";
import DichVuPhieu from "../src/services/ticketService.js";

function taoKhoPhieuGia({ thietBi = {}, coPhieuMo = false } = {}) {
  return {
    soLanTaoPhieuThanhCong: 0,
    async timKhachHangTheoMa(maKhach) {
      return maKhach === 1 || maKhach === 99 ? { customer_id: maKhach } : null;
    },
    async timThietBiTheoMa(maThietBi) {
      return maThietBi === 2
        ? {
            device_id: 2,
            customer_id: 1,
            purchase_date: "2025-01-01",
            warranty_months: 1200,
            ...thietBi,
          }
        : null;
    },
    async layDanhMucTheoMa(maDanhMuc) {
      return maDanhMuc === 3
        ? { category_id: 3, default_priority: "TRUNG_BINH" }
        : null;
    },
    async coPhieuChuaDong() {
      return coPhieuMo;
    },
    async taoPhieu(duLieu) {
      this.soLanTaoPhieuThanhCong += 1;
      return duLieu;
    },
  };
}

const duLieuPhieuHopLe = {
  customer_id: 1,
  device_id: 2,
  center_id: 0,
  issue_desc: "Máy không nhận sạc",
  category_id: 3,
};

// TC-02 — Unit / luồng đúng: QT-04 tính SLA 72 giờ và bỏ qua Chủ nhật.
test("TC-02 tính hạn cam kết 72 giờ và bỏ qua Chủ nhật", async () => {
  const dichVu = new DichVuPhieu(taoKhoPhieuGia());
  const ketQua = await dichVu.chuanBiDuLieuTaoPhieu({
    ...duLieuPhieuHopLe,
    priority: "TRUNG_BINH",
    received_at: new Date(2026, 9, 23, 9).toISOString(),
  });

  assert.equal(ketQua.priority, "TRUNG_BINH");
  assert.equal(ketQua.is_warranty, true);
  assert.equal(
    ketQua.received_at.toISOString(),
    new Date(2026, 9, 23, 9).toISOString(),
  );
  assert.equal(
    ketQua.due_date.toISOString(),
    new Date(2026, 9, 27, 9).toISOString(),
  );
});

// TC-07 — Unit / dữ liệu sai: thiết bị không thuộc khách hàng được chọn.
test("TC-07 từ chối tạo phiếu khi thiết bị không thuộc khách hàng", async () => {
  const dichVu = new DichVuPhieu(taoKhoPhieuGia());

  await assert.rejects(
    dichVu.xemTruocTaoPhieu({ ...duLieuPhieuHopLe, customer_id: 99 }),
    (loi) =>
      loi.maLoi === "DEVICE_CUSTOMER_MISMATCH" &&
      loi.message === "Thiết bị không thuộc khách hàng này." &&
      loi.loiTheoTruong.device_id ===
        "Thiết bị không thuộc khách hàng đang chọn",
  );
});

// TC-08 — Unit / dữ liệu sai: hai nhánh dữ liệu tham chiếu không tồn tại.
test("TC-08 từ chối tạo phiếu khi không tìm thấy khách hàng hoặc thiết bị", async () => {
  const khoPhieu = taoKhoPhieuGia();
  const dichVu = new DichVuPhieu(khoPhieu);

  await assert.rejects(
    dichVu.xemTruocTaoPhieu({ ...duLieuPhieuHopLe, customer_id: 404 }),
    (loi) =>
      loi.maLoi === "CUSTOMER_NOT_FOUND" &&
      loi.message === "Không tìm thấy khách hàng.",
  );

  await assert.rejects(
    dichVu.xemTruocTaoPhieu({ ...duLieuPhieuHopLe, device_id: 404 }),
    (loi) =>
      loi.maLoi === "DEVICE_NOT_FOUND" &&
      loi.message === "Không tìm thấy thiết bị.",
  );
  assert.equal(khoPhieu.soLanTaoPhieuThanhCong, 0);
});

// TC-14 — QT-05 xét hạn bảo hành tại thời điểm tiếp nhận, không phải thời điểm hiện tại.
test("TC-14 chấp nhận thiết bị còn bảo hành tại received_at dù hiện tại đã hết hạn", async () => {
  const ngayHienTai = new Date();
  const ngayMua = new Date(Date.UTC(
    ngayHienTai.getUTCFullYear(),
    ngayHienTai.getUTCMonth() - 2,
    1,
  ));
  const ngayTiepNhan = new Date(ngayMua);
  ngayTiepNhan.setUTCDate(16);
  const chuoiNgayMua = ngayMua.toISOString().slice(0, 10);
  const chuoiNgayTiepNhan = ngayTiepNhan.toISOString();
  const dichVu = new DichVuPhieu(taoKhoPhieuGia({
    thietBi: { purchase_date: chuoiNgayMua, warranty_months: 1 },
  }));

  const ketQua = await dichVu.chuanBiDuLieuTaoPhieu({
    ...duLieuPhieuHopLe,
    priority: "TRUNG_BINH",
    received_at: chuoiNgayTiepNhan,
  });

  assert.equal(ketQua.is_warranty, true);
});