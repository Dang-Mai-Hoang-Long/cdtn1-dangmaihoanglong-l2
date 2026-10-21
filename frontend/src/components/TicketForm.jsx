export default function BieuMauPhieu({ khiHuy, khiGui }) {
  return (
    <section className="manHinh manHinhTaoPhieu">
      <header className="tieuDeManHinh"><h1>Tạo phiếu bảo hành</h1></header>
      <form className="bieuMau" onSubmit={khiGui}>
        <div className="truongHang truongTraCuu">
          <label htmlFor="so-dien-thoai">Số điện thoại khách hàng</label>
          <div className="hangTraCuu">
            <input id="so-dien-thoai" name="phone" type="tel" autoComplete="tel" placeholder="Nhập số điện thoại" />
            <button className="nut nutTraCuu" type="button">Tra cứu</button>
          </div>
        </div>
        <div className="truongHang">
          <label htmlFor="ho-ten">Họ tên khách hàng</label>
          <input id="ho-ten" name="full_name" type="text" placeholder="Họ tên khách hàng" />
        </div>
        <div className="truongHang truongSerial">
          <label htmlFor="so-serial">Số serial thiết bị</label>
          <div><input id="so-serial" name="serial_no" type="text" placeholder="Nhập số serial thiết bị" /></div>
        </div>
        <div className="truongHang truongMoTa">
          <label htmlFor="mo-ta-loi">Mô tả lỗi</label>
          <textarea id="mo-ta-loi" name="issue_desc" rows="3" placeholder="Mô tả tình trạng lỗi" />
        </div>
        <div className="truongHang">
          <label htmlFor="nhom-su-co">Nhóm sự cố</label>
          <select id="nhom-su-co" name="category_name" defaultValue="">
            <option value="">Chọn nhóm sự cố</option>
            <option>Màn hình</option>
            <option>Pin</option>
            <option>Sạc</option>
            <option>Phần mềm</option>
            <option>Nước vào</option>
            <option>Khác</option>
          </select>
        </div>
        <fieldset className="truongHang truongUuTien">
          <legend>Mức ưu tiên</legend>
          <div className="cacMucUuTien">
            <label><input type="radio" name="priority" value="CAO" /> Cao</label>
            <label><input type="radio" name="priority" value="TRUNG_BINH" /> Trung bình</label>
            <label><input type="radio" name="priority" value="THAP" /> Thấp</label>
          </div>
        </fieldset>
        <div className="canhBaoBaoHanh" aria-hidden="true" />
        <div className="nhomNut">
          <button className="nut nutPhu" type="button" onClick={khiHuy}>Hủy</button>
          <button className="nut nutChinh" type="submit">Tạo phiếu</button>
        </div>
      </form>
    </section>
  );
}
