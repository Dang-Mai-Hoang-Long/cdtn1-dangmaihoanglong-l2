import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.API_PORT) || 3001;
const server = app.listen(port, () => {
  console.log(`API đang chạy tại http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Cổng ${port} đang được sử dụng. Hãy dừng server đang chạy hoặc đổi PORT trong .env.`);
  } else {
    console.error('Không thể khởi động server:', error.message);
  }
  process.exitCode = 1;
});
