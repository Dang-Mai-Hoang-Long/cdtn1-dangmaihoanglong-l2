import test from "node:test";
import assert from "node:assert/strict";
import { guiYeuCauApi } from "./apiTestHelpers.js";

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
