import test from "node:test";
import assert from "node:assert/strict";
import { conHanBaoHanh } from "../src/services/warrantyRules.js";

test("TC-05 | QT-05: thiết bị còn bảo hành đến hết ngày cuối cùng của kỳ hạn", () => {
  const thietBi = {
    purchase_date: "2025-01-31",
    warranty_months: 1,
  };

  assert.equal(
    conHanBaoHanh(thietBi, new Date("2025-02-28T23:59:59.999Z")),
    true,
  );
});

test("TC-06 | QT-05: thiết bị hết bảo hành ngay sau thời điểm kết thúc kỳ hạn", () => {
  const thietBi = {
    purchase_date: "2025-01-31",
    warranty_months: 1,
  };

  assert.equal(
    conHanBaoHanh(thietBi, new Date("2025-03-01T00:00:00.000Z")),
    false,
  );
});

test("TC-07 | QT-05: thiếu ngày mua được coi là chưa xác minh, không còn hạn", () => {
  assert.equal(
    conHanBaoHanh({ purchase_date: null, warranty_months: 12 }),
    false,
  );
});
