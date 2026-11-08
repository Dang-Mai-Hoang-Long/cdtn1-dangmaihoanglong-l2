import test from "node:test";
import assert from "node:assert/strict";
import { conHanBaoHanh } from "../src/services/warrantyRules.js";

// Mục tiêu: kiểm tra giá trị sát cuối thời hạn bảo hành.
// Tiền điều kiện: mua ngày 31/01, thời hạn một tháng (kết thúc 28/02).
// Kỳ vọng: thiết bị còn bảo hành tại 23:59:59.999 ngày cuối.
test("TC-05 thiết bị còn bảo hành tại mili giây cuối của thời hạn", () => {
  const thietBi = { purchase_date: "2025-01-31", warranty_months: 1 };

  assert.equal(
    conHanBaoHanh(thietBi, new Date("2025-02-28T23:59:59.999Z")),
    true,
  );
});

// Mục tiêu: kiểm tra giá trị ngay sau thời hạn bảo hành.
// Tiền điều kiện: mua ngày 31/01, thời hạn một tháng kết thúc ngày 28/02.
// Kỳ vọng: thiết bị hết bảo hành từ 00:00 ngày 01/03.
test("TC-06 thiết bị hết bảo hành ngay sau ngày cuối của thời hạn", () => {
  const thietBi = { purchase_date: "2025-01-31", warranty_months: 1 };

  assert.equal(
    conHanBaoHanh(thietBi, new Date("2025-03-01T00:00:00.000Z")),
    false,
  );
});

