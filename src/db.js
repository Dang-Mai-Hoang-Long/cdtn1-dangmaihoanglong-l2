import "dotenv/config";
import thuVienPg from "pg";

const { Pool: BoKetNoi } = thuVienPg;

const tuyChonKetNoi = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || undefined,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_NAME || undefined,
      user: process.env.DB_USER || undefined,
      password: process.env.DB_PASSWORD || undefined,
    };

const boKetNoi = new BoKetNoi(tuyChonKetNoi);

boKetNoi.on("error", (loi) => {
  console.error("Lỗi kết nối PostgreSQL:", loi.message);
});

export default boKetNoi;
