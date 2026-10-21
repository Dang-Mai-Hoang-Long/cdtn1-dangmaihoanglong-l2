import boKetNoi from "./db.js";

try {
  const ketQua = await boKetNoi.query(
    "SELECT NOW() AS current_time, current_database() AS db_name",
  );

  console.log("Kết nối thành công!");
  console.log(ketQua.rows[0]);
} catch (loi) {
  console.error("Kết nối thất bại:", loi.message);
}

import "dotenv/config";

try {
  const ketQua = await boKetNoi.query(
    "SELECT * FROM ticket ORDER BY ticket_id ASC",
  );

  console.log("Danh sách phiếu bảo hành:");
  console.table(ketQua.rows);

  console.log("Tổng số phiếu:", ketQua.rowCount);
} catch (loi) {
  console.error("Lỗi lấy danh sách ticket:", loi.message);
} finally {
  await boKetNoi.end();
}
