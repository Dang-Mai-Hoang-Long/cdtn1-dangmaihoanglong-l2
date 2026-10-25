import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import thuVienDuongDan from "node:path";
import boKetNoi from "../src/db.js";

const duongDanMigrations = fileURLToPath(new URL("../migrations/", import.meta.url));
const maKhoaMigration = 72810421;

async function layTepMigration() {
  const tenTep = (await readdir(duongDanMigrations))
    .filter((ten) => /^\d{3}_[a-z0-9_]+\.sql$/i.test(ten))
    .sort((tenTruoc, tenSau) => tenTruoc.localeCompare(tenSau, "en", { numeric: true }));

  if (tenTep.length === 0) {
    throw new Error("Không tìm thấy tệp migration được đánh số trong migrations/.");
  }
  return tenTep;
}

async function chayMigrations() {
  const ketNoi = await boKetNoi.connect();
  try {
    await ketNoi.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        migration_name VARCHAR(120) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const cacTepMigration = await layTepMigration();
    for (const tenTep of cacTepMigration) {
      await ketNoi.query("BEGIN");
      try {
        await ketNoi.query("SELECT pg_advisory_xact_lock($1)", [maKhoaMigration]);
        const daApDung = await ketNoi.query(
          "SELECT 1 FROM schema_migrations WHERE migration_name = $1",
          [tenTep],
        );

        if (daApDung.rowCount > 0) {
          await ketNoi.query("COMMIT");
          console.log(`Đã có migration: ${tenTep}`);
          continue;
        }

        const duongDanTep = thuVienDuongDan.join(duongDanMigrations, tenTep);
        const noiDungSql = await readFile(duongDanTep, "utf8");
        await ketNoi.query(noiDungSql);
        await ketNoi.query(
          "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
          [tenTep],
        );
        await ketNoi.query("COMMIT");
        console.log(`Đã áp dụng migration: ${tenTep}`);
      } catch (loi) {
        await ketNoi.query("ROLLBACK");
        throw new Error(`Migration ${tenTep} thất bại: ${loi.message}`);
      }
    }
  } finally {
    ketNoi.release();
  }
}

chayMigrations()
  .catch((loi) => {
    console.error("Không thể chạy migration:", loi.message);
    process.exitCode = 1;
  })
  .finally(() => boKetNoi.end());
