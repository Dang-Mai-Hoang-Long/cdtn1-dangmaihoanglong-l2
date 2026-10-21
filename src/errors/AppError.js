export default class LoiUngDung extends Error {
  constructor(maLoi, thongDiep, loiTheoTruong = {}) {
    super(thongDiep);
    this.name = 'LoiUngDung';
    this.maLoi = maLoi;
    this.loiTheoTruong = loiTheoTruong;
  }
}
