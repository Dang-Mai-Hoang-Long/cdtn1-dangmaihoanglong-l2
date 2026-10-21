export default class DichVuPhieu {
  constructor(khoPhieu) {
    this.khoPhieu = khoPhieu;
  }

  layDanhSachPhieu(tuyChonDanhSach) {
    return this.khoPhieu.layDanhSach(tuyChonDanhSach);
  }
}
