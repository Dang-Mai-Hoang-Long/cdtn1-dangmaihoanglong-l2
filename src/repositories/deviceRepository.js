export default class KhoThietBi {
  constructor(boKetNoi) {
    this.boKetNoi = boKetNoi;
  }

  async timTheoSoSerial(soSerial) {
    const { rows } = await this.boKetNoi.query(
      `
      SELECT device_id, customer_id, serial_no, purchase_date, warranty_months
      FROM device WHERE serial_no = $1
    `,
      [soSerial],
    );
    return rows[0] || null;
  }
}
