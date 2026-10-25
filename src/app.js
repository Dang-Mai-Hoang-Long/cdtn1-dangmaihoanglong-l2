import duongDan from 'node:path';
import { fileURLToPath as doiUrlThanhDuongDan } from 'node:url';
import ungDungExpress from 'express';
import boKetNoi from './db.js';
import LoiUngDung from './errors/AppError.js';
import xuLyLoiApi from './errors/errorHandler.js';
import KhoPhieu from './repositories/ticketRepository.js';
import KhoKhachHang from './repositories/customerRepository.js';
import KhoThietBi from './repositories/deviceRepository.js';
import taoTuyenPhieu from './routes/ticketRoute.js';
import taoTuyenKhachHang from './routes/customerRoute.js';
import taoTuyenThietBi from './routes/deviceRoute.js';
import DichVuPhieu from './services/ticketService.js';
import DichVuKhachHang from './services/customerService.js';
import DichVuThietBi from './services/deviceService.js';

const duongDanGocDuAn = duongDan.resolve(duongDan.dirname(doiUrlThanhDuongDan(import.meta.url)), '..');
const thuMucBanDung = duongDan.join(duongDanGocDuAn, 'dist');

export function taoUngDung({ coSoDuLieu = boKetNoi } = {}) {
  const ungDung = ungDungExpress();

  ungDung.disable('x-powered-by');
  ungDung.use(ungDungExpress.json());

  ungDung.get('/health', (_yeuCau, phanHoi) => {
    phanHoi.json({ status: 'ok' });
  });

  const khoPhieu = new KhoPhieu(coSoDuLieu);
  const khoKhachHang = new KhoKhachHang(coSoDuLieu);
  const khoThietBi = new KhoThietBi(coSoDuLieu);
  const dichVuPhieu = new DichVuPhieu(khoPhieu);
  const dichVuKhachHang = new DichVuKhachHang(khoKhachHang);
  const dichVuThietBi = new DichVuThietBi(khoThietBi, khoKhachHang);
  ungDung.use('/api/customers', taoTuyenKhachHang(dichVuKhachHang));
  ungDung.use('/api/devices', taoTuyenThietBi(dichVuThietBi));
  ungDung.use('/api/tickets', taoTuyenPhieu(dichVuPhieu));

  ungDung.use('/api', (yeuCau, phanHoi, tiepTuc) => {
    tiepTuc(new LoiUngDung('NOT_FOUND', 'Không tìm thấy API được yêu cầu.'));
  });
  ungDung.use('/api', xuLyLoiApi);

  ungDung.use(ungDungExpress.static(thuMucBanDung, { index: 'index.html' }));

  return ungDung;
}

const ungDung = taoUngDung();

export default ungDung;
