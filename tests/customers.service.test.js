import test from "node:test";
import assert from "node:assert/strict";
import DichVuKhachHang from "../src/services/customerService.js";

// Mục tiêu: chuẩn hóa số điện thoại và chỉ trả số đã che.
// Tiền điều kiện: kho khách hàng có hồ sơ với số 0999000001.
// Kỳ vọng: số +84 được chuẩn hóa; response không có số đầy đủ.
test("TC-01 tra cứu bằng số +84 được chuẩn hóa và trả số điện thoại đã che", async () => {
  const dichVu = new DichVuKhachHang({
    async timTheoSoDienThoai(soDienThoai) {
      assert.equal(soDienThoai, "0999000001");
      return {
        customer_id: 1,
        full_name: "Nguyễn Minh An",
        phone: "0999000001",
        address: "Ninh Kiều, Cần Thơ",
      };
    },
  });

  const ketQua = await dichVu.timTheoSoDienThoai("+84 999.000.001");

  assert.equal(ketQua.phone_masked, "099****001");
  assert.equal(Object.hasOwn(ketQua, "phone"), false);
  assert.equal(JSON.stringify(ketQua).includes("0999000001"), false);
});
