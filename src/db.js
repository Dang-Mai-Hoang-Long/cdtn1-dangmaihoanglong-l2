import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const poolOptions = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || undefined,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_NAME || undefined,
      user: process.env.DB_USER || undefined,
      password: process.env.DB_PASSWORD || undefined,
    };

const pool = new Pool(poolOptions);

pool.on("error", (err) => {
  console.error("Lỗi kết nối PostgreSQL:", err.message);
});

export default pool;
