import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import thuVienDuongDan from "node:path";
import boKetNoi from "../src/db.js";

const duongDanMigrations = fileURLToPath(new URL("../migrations/", import.meta.url));
const duongDanSeeds = fileURLToPath(new URL("../seeds/", import.meta.url));

async function layTepSql(duongDan) {
  return (await readdir(duongDan))
    .filter((ten) => /^\d{3}_[a-z0-9_]+\.sql$/i.test(ten))
    .sort((tenTruoc, tenSau) => tenTruoc.localeCompare(tenSau, "en", { numeric: true }));
}

async function kiemTraMigrationDaChay(ketNoi, cacTepMigration) {
  const bangTheoDoi = await ketNoi.query("SELECT to_regclass('public.schema_migrations') AS ten_bang");
  if (!bangTheoDoi.rows[0].ten_bang) {
    throw new Error("Chưa có schema_migrations. Hãy chạy npm run db:migrate trước.");
  }

  const daApDung = await ketNoi.query("SELECT migration_name FROM schema_migrations");
  const cacMigration = new Set(daApDung.rows.map((dong) => dong.migration_name));
  const chuaApDung = cacTepMigration.filter((tenTep) => !cacMigration.has(tenTep));
  if (chuaApDung.length > 0) {
    throw new Error("Còn migration chưa chạy. Hãy chạy npm run db:migrate trước.");
  }
}

async function napSeeds() {
  const ketNoi = await boKetNoi.connect();
  try {
    const cacTepMigration = await layTepSql(duongDanMigrations);
    const cacTepSeed = await layTepSql(duongDanSeeds);
    if (cacTepSeed.length === 0) {
      throw new Error("Không tìm thấy tệp seed được đánh số trong seeds/.");
    }
    await kiemTraMigrationDaChay(ketNoi, cacTepMigration);

    await ketNoi.query("BEGIN");
    try {
      for (const tenTep of cacTepSeed) {
        const noiDungSql = await readFile(thuVienDuongDan.join(duongDanSeeds, tenTep), "utf8");
        await ketNoi.query(noiDungSql);
        console.log(`Đã chạy seed: ${tenTep}`);
      }
      await ketNoi.query("COMMIT");
    } catch (loi) {
      await ketNoi.query("ROLLBACK");
      throw loi;
    }
  } finally {
    ketNoi.release();
  }
}

napSeeds()
  .catch((loi) => {
    console.error("Không thể nạp dữ liệu mẫu:", loi.message);
    process.exitCode = 1;
  })
  .finally(() => boKetNoi.end());
