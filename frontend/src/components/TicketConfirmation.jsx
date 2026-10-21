export default function XacNhanPhieu({ khiQuayLai, khiXacNhan }) {
  return (
    <section className="manHinh manHinhXacNhan">
      <header className="tieuDeManHinh"><h1>Xác nhận tạo phiếu bảo hành</h1></header>
      <section className="khungXacNhan">
        <dl className="nhomThongTin nhomThongTinPhieu">
          <dt>Mã phiếu bảo hành</dt><dd />
          <dt>Thời gian tiếp nhận</dt><dd />
        </dl>
        <dl className="nhomThongTin nhomThongTinKhachHang">
          <dt>Số điện thoại khách hàng</dt><dd />
          <dt>Họ tên khách hàng</dt><dd />
          <dt>Số serial thiết bị</dt><dd />
          <dt>Mô tả lỗi</dt><dd />
          <dt>Nhóm sự cố</dt><dd />
          <dt>Mức ưu tiên</dt><dd />
        </dl>
        <dl className="nhomThongTin nhomThongTinHan">
          <dt>Hạn cam kết bảo hành</dt><dd />
        </dl>
        <div className="nhomNut">
          <button className="nut nutPhu" type="button" onClick={khiQuayLai}>Quay lại</button>
          <button className="nut nutChinh" type="button" onClick={khiXacNhan}>Xác nhận</button>
        </div>
      </section>
    </section>
  );
}
