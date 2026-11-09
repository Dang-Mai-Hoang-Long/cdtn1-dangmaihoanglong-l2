import test from "node:test";
import assert from "node:assert/strict";
import { guiYeuCauApi } from "./apiTestHelpers.js";
import DichVuPhieu from "../src/services/ticketService.js";

// Mục tiêu: kiểm tra validator từ chối mô tả sự cố bị bỏ trống qua HTTP.
// Tiền điều kiện: các ID hợp lệ nhưng thiếu issue_desc.
// Kỳ vọng: HTTP 400, VALIDATION_FAILED và fields.issue_desc ghi rõ nguyên nhân.
test("TC-09 thiếu mô tả sự cố trả về HTTP 400 VALIDATION_FAILED", async () => {
  const coSoDuLieu = {
    async query() {
      throw new Error("Validator phải dừng trước khi truy vấn DB");
    },
  };
  const phanHoi = await guiYeuCauApi(coSoDuLieu, "/api/tickets/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id: 1,
      device_id: 2,
      center_id: 0,
      category_id: 3,
    }),
  });

  assert.equal(phanHoi.maHttp, 400);
  assert.equal(phanHoi.noiDung.error.code, "VALIDATION_FAILED");
  assert.equal(phanHoi.noiDung.error.message, "Dữ liệu không hợp lệ");
  assert.equal(
    phanHoi.noiDung.error.fields.issue_desc,
    "Mô tả lỗi không được để trống",
  );
});

// TC-13 — bảo vệ tính toàn vẹn SLA: mốc gửi khi xác nhận phải khớp bản xem trước.
test("TC-13 tính lại hạn cam kết thay vì lấy due_date mới do client gửi", async () => {
  const dichVuPhieu = new DichVuPhieu({
    async timKhachHangTheoMa() {
      return { customer_id: 1 };
    },
    async timThietBiTheoMa() {
      return {
        device_id: 2,
        customer_id: 1,
        purchase_date: "2025-01-01",
        warranty_months: 1200,
      };
    },
    async layDanhMucTheoMa() {
      return { category_id: 3, default_priority: "TRUNG_BINH" };
    },
  });
  const thoiDiemNhan = new Date("2030-01-01T00:00:00.000Z");
  const daChuanBi = await dichVuPhieu.chuanBiDuLieuTaoPhieu({
    customer_id: 1,
    device_id: 2,
    category_id: 3,
    issue_desc: "Máy không nhận sạc",
    priority: "TRUNG_BINH",
    received_at: thoiDiemNhan,
    due_date: new Date("2099-01-01T00:00:00.000Z"),
  });

  assert.equal(
    daChuanBi.due_date.getTime(),
    thoiDiemNhan.getTime() + 72 * 60 * 60 * 1000,
  );
});