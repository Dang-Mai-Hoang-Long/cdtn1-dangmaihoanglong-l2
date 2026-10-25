function dinhDangThoiGian(giaTri) {
  if (!giaTri) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(giaTri));
}

function cheSoDienThoai(soDienThoai) {
  let soDaChuanHoa = String(soDienThoai || "").replace(/\D/g, "");
  if (soDaChuanHoa.length === 11 && soDaChuanHoa.startsWith("84")) {
    soDaChuanHoa = `0${soDaChuanHoa.slice(2)}`;
  }
  if (soDaChuanHoa.length !== 10) return "—";
  return `${soDaChuanHoa.slice(0, 3)}****${soDaChuanHoa.slice(-3)}`;
}

export default function XacNhanPhieu({
  phieuXemTruoc,
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
          <dd>
            {phieuXemTruoc?.phone_masked || cheSoDienThoai(phieuXemTruoc?.phone)}
          </dd>
          <dt>Họ tên khách hàng</dt>
          <dd>{phieuXemTruoc?.full_name || "—"}</dd>
          <dt>Số serial thiết bị</dt>
          <dd>{phieuXemTruoc?.serial_no || "—"}</dd>
          <dt>Mô tả lỗi</dt>
          <dd>{phieuXemTruoc?.issue_desc || "—"}</dd>
          <dt>Nhóm sự cố</dt>
          <dd>{phieuXemTruoc?.category_name || "—"}</dd>
          <dt>Mức ưu tiên</dt>
          <dd>{nhanUuTien[phieuXemTruoc?.priority] || "—"}</dd>
        </dl>
        <dl className="nhomThongTin nhomThongTinHan">
          <dt>Hạn cam kết dự kiến</dt>
          <dd>{dinhDangThoiGian(phieuXemTruoc?.due_date)}</dd>
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
            Xác nhận
          </button>
        </div>
      </section>
    </section>
  );
}
