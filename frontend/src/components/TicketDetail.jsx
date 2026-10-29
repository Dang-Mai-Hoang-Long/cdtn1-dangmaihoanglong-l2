function dinhDangThoiGian(giaTri) {
  if (!giaTri) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(giaTri));
}

const tenTrangThai = {
  MOI: "Mới",
  DA_PHAN_CONG: "Đã phân công",
  DANG_XU_LY: "Đang xử lý",
  CHO_LINH_KIEN: "Chờ linh kiện",
  HOAN_TAT: "Hoàn tất",
  DA_DONG: "Đã đóng",
  DA_HUY: "Đã hủy",
};

const tenUuTien = { CAO: "Cao", TRUNG_BINH: "Trung bình", THAP: "Thấp" };

export default function ChiTietPhieu({
  phieu,
  thongBao,
  thongBaoThanhCong,
  dangXuLy,
  coLoiTaiChiTiet,
  khiQuayLai,
  khiChinhSua,
  khiDongPhieu,
}) {
  const coTheChinhSua = !["DA_DONG", "DA_HUY"].includes(phieu.status);

  return (
    <section className="manHinh manHinhXacNhan">
      <header className="tieuDeManHinh">
        <h1>Chi tiết phiếu bảo hành</h1>
      </header>
      <div className="khungXacNhan">
        <dl className="nhomThongTin nhomThongTinChiTiet">
          <dt>Mã phiếu</dt><dd>{phieu.ticket_code}</dd>
          <dt>Khách hàng</dt><dd>{phieu.customer_name || "—"}</dd>
          <dt>Mã thiết bị</dt><dd>{phieu.serial_no || "—"}</dd>
          <dt>Mô tả lỗi</dt><dd>{phieu.issue_desc || "—"}</dd>
          <dt>Nhóm sự cố</dt><dd>{phieu.category_name || "—"}</dd>
          <dt>Mức ưu tiên</dt><dd>{tenUuTien[phieu.priority] || phieu.priority}</dd>
          <dt>Trạng thái</dt><dd>{tenTrangThai[phieu.status] || phieu.status}</dd>
          <dt>Tiếp nhận</dt><dd>{dinhDangThoiGian(phieu.received_at)}</dd>
          <dt>Hạn cam kết</dt><dd>{dinhDangThoiGian(phieu.due_date)}</dd>
          <dt>Đóng phiếu</dt><dd>{dinhDangThoiGian(phieu.closed_at)}</dd>
        </dl>
        {thongBao && (
          <p
            className={`thongBaoChiTiet${thongBaoThanhCong ? " thongBaoThanhCong" : ""}`}
            role={thongBaoThanhCong ? "status" : "alert"}
          >
            {thongBao}
          </p>
        )}
        <div className="nhomNut">
          <button className="nut nutPhu" type="button" onClick={khiQuayLai} disabled={dangXuLy}>
            Quay lại
          </button>
          {coTheChinhSua && !coLoiTaiChiTiet && (
            <button className="nut nutPhu" type="button" onClick={khiChinhSua} disabled={dangXuLy}>
              Chỉnh sửa
            </button>
          )}
          {phieu.status !== "DA_DONG" && !coLoiTaiChiTiet && (
            <button className="nut nutChinh nutDongPhieu" type="button" onClick={khiDongPhieu} disabled={dangXuLy}>
              {dangXuLy ? "Đang đóng..." : "Đóng phiếu"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
