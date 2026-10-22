function dinhDangThoiGian(giaTri) {
  if (!giaTri) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(giaTri));
}

export default function XacNhanPhieu({
  phieu,
  thongBao,
  dangXuLy,
  khiQuayLai,
  khiXacNhan,
}) {
  const nhanUuTien = { CAO: "Cao", TRUNG_BINH: "Trung bình", THAP: "Thấp" };
  return (
    <section className="manHinh manHinhXacNhan">
      <header className="tieuDeManHinh">
        <h1>Xác nhận thông tin phiếu bảo hành</h1>
      </header>
      <section className="khungXacNhan">
        <dl className="nhomThongTin nhomThongTinKhachHang">
          <dt>Số điện thoại khách hàng</dt>
          <dd>{phieu?.phone || "—"}</dd>
          <dt>Họ tên khách hàng</dt>
          <dd>{phieu?.full_name || "—"}</dd>
          <dt>Số serial thiết bị</dt>
          <dd>{phieu?.serial_no || "—"}</dd>
          <dt>Mô tả lỗi</dt>
          <dd>{phieu?.issue_desc || "—"}</dd>
          <dt>Nhóm sự cố</dt>
          <dd>{phieu?.category_name || "—"}</dd>
          <dt>Mức ưu tiên</dt>
          <dd>{nhanUuTien[phieu?.priority] || "—"}</dd>
        </dl>
        <dl className="nhomThongTin nhomThongTinHan">
          <dt>Hạn cam kết dự kiến</dt>
          <dd>{dinhDangThoiGian(phieu?.due_date)}</dd>
        </dl>
        {thongBao && (
          <div className="canhBaoBaoHanh coThongBao" role="alert">
            {thongBao}
          </div>
        )}
        <div className="nhomNut">
          <button
            className="nut nutPhu"
            type="button"
            onClick={khiQuayLai}
            disabled={dangXuLy}
          >
            Quay lại
          </button>
          <button
            className="nut nutChinh"
            type="button"
            onClick={khiXacNhan}
            disabled={dangXuLy}
          >
            {dangXuLy ? "Đang tạo…" : "Xác nhận"}
          </button>
        </div>
      </section>
    </section>
  );
}
