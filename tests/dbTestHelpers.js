import { execFile as chayLenh } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import thuVienPg from "pg";

const { Pool: BoKetNoi } = thuVienPg;
const chayLenhBatDongBo = promisify(chayLenh);
const thuMucDuAn = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const chuoiKetNoiTest = process.env.TEST_DATABASE_URL;

export function kiemTraDatabaseTest(chuoiKetNoi = chuoiKetNoiTest) {
  assertCoChuoiKetNoi(chuoiKetNoi);
  const tenDatabase = decodeURIComponent(new URL(chuoiKetNoi).pathname.slice(1));
  if (!/_test$/i.test(tenDatabase)) {
    throw new Error("TEST_DATABASE_URL phải trỏ tới database có hậu tố _test.");
  }
}

function assertCoChuoiKetNoi(chuoiKetNoi) {
  if (!chuoiKetNoi) {
    throw new Error("Cần cấu hình TEST_DATABASE_URL để chạy kiểm thử PostgreSQL.");
  }
}

export async function dungLaiCoSoDuLieuTest() {
  kiemTraDatabaseTest();
  const coSoDuLieu = new BoKetNoi({ connectionString: chuoiKetNoiTest });
  try {
    // Chỉ dựng lại schema sau khi xác nhận tên database có hậu tố *_test.
    await coSoDuLieu.query("DROP SCHEMA public CASCADE");
    await coSoDuLieu.query("CREATE SCHEMA public");
    for (const tepScript of ["migrate.js", "seed.js"]) {
      await chayLenhBatDongBo(
        process.execPath,
        [resolve(thuMucDuAn, "scripts", tepScript)],
        {
          cwd: thuMucDuAn,
          env: { ...process.env, DATABASE_URL: chuoiKetNoiTest },
        },
      );
    }
    return coSoDuLieu;
  } catch (loi) {
    await coSoDuLieu.end();
    throw loi;
  }
}

export { chuoiKetNoiTest };
