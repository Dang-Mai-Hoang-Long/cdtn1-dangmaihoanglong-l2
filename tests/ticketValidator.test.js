import test from "node:test";
import assert from "node:assert/strict";
import xuLyLoiApi from "../src/errors/errorHandler.js";
import { kiemTraDuLieuTaoPhieu } from "../src/validators/ticketValidator.js";

test("TC-08 | AC3.2: thiếu mô tả lỗi bị từ chối với mã 400 và nêu đúng trường", () => {
  let loiBatDuoc;
  try {
    kiemTraDuLieuTaoPhieu({
      customer_id: 1,
      device_id: 2,
      center_id: 0,
      category_id: 3,
    });
  } catch (loi) {
    loiBatDuoc = loi;
  }

  assert.ok(loiBatDuoc, "Validator phải từ chối mô tả lỗi bị thiếu");
  const phanHoiGia = {
    maHttp: null,
    noiDung: null,
    status(maHttp) {
      this.maHttp = maHttp;
      return this;
    },
    json(noiDung) {
      this.noiDung = noiDung;
      return this;
    },
  };

  xuLyLoiApi(loiBatDuoc, {}, phanHoiGia, () => {});

  assert.equal(phanHoiGia.maHttp, 400);
  assert.equal(phanHoiGia.noiDung.error.code, "VALIDATION_FAILED");
  assert.equal(typeof phanHoiGia.noiDung.error.fields.issue_desc, "string");
});

test("TC-09 | AC4.2: từ chối mức ưu tiên không thuộc danh sách cho phép", () => {
  assert.throws(
    () =>
      kiemTraDuLieuTaoPhieu({
        customer_id: 1,
        device_id: 2,
        center_id: 0,
        category_id: 3,
        issue_desc: "Máy không nhận sạc",
        priority: "KHAN_CAP",
      }),
    (loi) =>
      loi.maLoi === "VALIDATION_FAILED" &&
      typeof loi.loiTheoTruong.priority === "string",
  );
});
