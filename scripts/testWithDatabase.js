import { spawnSync as chayTienTrinh } from "node:child_process";
import thuVienPg from "pg";

const { Pool: BoKetNoi } = thuVienPg;

function taoCauHinhKetNoi(tenCoSoDuLieu) {
  return {
    host: process.env.DB_HOST || "database",
    port: Number(process.env.DB_PORT || 5432),
    database: tenCoSoDuLieu,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "mekong_mobile_l2_dev",
  };
}

function taoChuoiKetNoi(cauHinh) {
  const chuoiKetNoi = new URL("postgresql://localhost");
  chuoiKetNoi.hostname = cauHinh.host;
  chuoiKetNoi.port = String(cauHinh.port);
  chuoiKetNoi.username = cauHinh.user;
  chuoiKetNoi.password = cauHinh.password;
  chuoiKetNoi.pathname = `/${cauHinh.database}`;
  return chuoiKetNoi.toString();
}

async function damBaoCoDatabaseTest(tenDatabaseTest) {
  if (
    !/^[a-zA-Z0-9_-]+$/.test(tenDatabaseTest) ||
    tenDatabaseTest.length > 63 ||
    !/_test$/i.test(tenDatabaseTest)
  ) {
    throw new Error("Tên database kiểm thử không hợp lệ hoặc thiếu hậu tố _test.");
  }

  const ketNoiQuanTri = new BoKetNoi(taoCauHinhKetNoi("postgres"));
  try {
    const { rowCount } = await ketNoiQuanTri.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [tenDatabaseTest],
    );
    if (rowCount === 0) {
      await ketNoiQuanTri.query(`CREATE DATABASE "${tenDatabaseTest}"`);
      console.log(`Đã tạo database kiểm thử ${tenDatabaseTest}.`);
    } else {
      console.log(`Sử dụng database kiểm thử ${tenDatabaseTest}.`);
    }
  } finally {
    await ketNoiQuanTri.end();
  }
}

const tenDatabaseUngDung = process.env.DB_NAME || "mekong_mobile_l2";
const tenDatabaseTest = `${tenDatabaseUngDung}_test`;
const cauHinhDatabaseTest = taoCauHinhKetNoi(tenDatabaseTest);

try {
  await damBaoCoDatabaseTest(tenDatabaseTest);
  const chuoiKetNoiTest = taoChuoiKetNoi(cauHinhDatabaseTest);
  const [lenh = "npm", ...thamSo] = process.argv.slice(2);
  const tienTrinh = chayTienTrinh(lenh, thamSo.length > 0 ? thamSo : ["test"], {
    env: {
      ...process.env,
      DATABASE_URL: chuoiKetNoiTest,
      TEST_DATABASE_URL: chuoiKetNoiTest,
    },
    stdio: "inherit",
  });

  if (tienTrinh.error) throw tienTrinh.error;
  process.exitCode = tienTrinh.status ?? 1;
} catch (loi) {
  console.error("Không thể chạy kiểm thử trong Docker:", loi.message);
  process.exitCode = 1;
}
