export default function TicketList({ onCreate }) {
  return (
    <section className="manHinh manHinhDanhSach">
      <header className="dauTrangDanhSach">
        <div className="nhanDienHeThong">Mekong Mobile</div>
        <div className="thanhTieuDeDanhSach">
          <h1>Danh sách phiếu bảo hành</h1>
          <button className="nut nutTaoPhieu" type="button" onClick={onCreate}>
            + Tạo phiếu bảo hành
          </button>
        </div>
      </header>

      <div className="noiDungDanhSach">
        <div className="cotBenTrai"><h2>Danh sách phiếu</h2></div>
        <div className="vungBang">
          <div className="bangCuon">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã phiếu</th>
                  <th>Khách hàng</th>
                  <th>Mã thiết bị</th>
                  <th>Trạng thái</th>
                  <th>Mức ưu tiên</th>
                  <th>Nhóm sự cố</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody />
            </table>
          </div>
        </div>
      </div>
      <p className="vaiTroTiepNhan">Nhân viên tiếp nhận</p>
    </section>
  );
}
