import 'dotenv/config';
import ungDung from './app.js';

const cong = Number(process.env.API_PORT || process.env.PORT) || 3001;
const mayChu = ungDung.listen(cong, () => {
  console.log(`API đang chạy tại http://localhost:${cong}`);
});

mayChu.on('error', (loi) => {
  if (loi.code === 'EADDRINUSE') {
    console.error(`Cổng ${cong} đang được sử dụng. Hãy dừng server đang chạy hoặc đổi PORT trong .env.`);
  } else {
    console.error('Không thể khởi động server:', loi.message);
  }
  process.exitCode = 1;
});
