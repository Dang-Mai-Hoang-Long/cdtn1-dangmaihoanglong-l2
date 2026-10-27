import { useEffect, useState } from "react";
import { phieuApi } from "../api/tickets.api.js";

const tenTrangThai = {
  MOI: "Mới",
  DA_PHAN_CONG: "Đã phân công",
  DANG_XU_LY: "Đang xử lý",
  CHO_LINH_KIEN: "Chờ linh kiện",
  HOAN_TAT: "Hoàn tất",
  DA_DONG: "Đã đóng",
  DA_HUY: "Đã hủy",
};

export default function DanhSachPhieu({ khiTaoPhieu }) {
  const [cacPhieu, datCacPhieu] = useState([]);
  const [dangTai, datDangTai] = useState(true);
  const [loiTai, datLoiTai] = useState(null);
  const [soLanTaiLai, datSoLanTaiLai] = useState(0);
  const [trangThaiLoc, datTrangThaiLoc] = useState("");
  const [trang, datTrang] = useState(1);
  const [kichThuoc, datKichThuoc] = useState(20);
  const [tongSo, datTongSo] = useState(0);

  const tongSoTrang = Math.max(1, Math.ceil(tongSo / kichThuoc));
  const trangVuotQuaCuoi = trang > tongSoTrang;

  useEffect(() => {
    const boDieuKhien = new AbortController();

    async function taiDanhSachPhieu() {
      datDangTai(true);
      datLoiTai(null);

      try {
        const ketQua = await phieuApi.layDanhSach({
          trangThai: trangThaiLoc || undefined,
          trang,
          kichThuoc,
          signal: boDieuKhien.signal,
        });
        datCacPhieu(Array.isArray(ketQua?.data) ? ketQua.data : []);
        const tongSoPhieu = Number(ketQua?.total) || 0;
        datTongSo(tongSoPhieu);
        const soTrangToiDa = Math.max(1, Math.ceil(tongSoPhieu / kichThuoc));
        if (trang > soTrangToiDa) datTrang(soTrangToiDa);
      } catch (loi) {
        if (!boDieuKhien.signal.aborted) datLoiTai(loi);
      } finally {
        if (!boDieuKhien.signal.aborted) datDangTai(false);
      }
    }

    taiDanhSachPhieu();
    return () => boDieuKhien.abort();
  }, [trangThaiLoc, trang, kichThuoc, soLanTaiLai]);

  return (
    <section className="manHinh manHinhDanhSach">
      <header className="dauTrangDanhSach">
        <div className="nhanDienHeThong">Mekong Mobile</div>
        <div className="thanhTieuDeDanhSach">
          <h1>Danh sách phiếu bảo hành</h1>
          <button
            className="nut nutTaoPhieu"
            type="button"
            onClick={khiTaoPhieu}
          >
            + Tạo phiếu bảo hành
          </button>
        </div>
      </header>

      <div className="noiDungDanhSach">
        <div className="cotBenTrai">
          <h2>Danh sách phiếu</h2>
        </div>
        <div className="vungBang">
          <div className="dieuKhienDanhSach">
            <label htmlFor="kich-thuoc-trang">Số dòng</label>
            <select
              id="kich-thuoc-trang"
              value={kichThuoc}
              onChange={(suKien) => {
                datKichThuoc(Number(suKien.target.value));
                datTrang(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="bangCuon">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã phiếu</th>
                  <th>Khách hàng</th>
                  <th>Mã thiết bị</th>
                  <th>
                    <div className="boLocTrangThai">
                      <label htmlFor="loc-trang-thai">Trạng thái</label>
                      <select
                        id="loc-trang-thai"
                        aria-label="Lọc theo trạng thái"
                        value={trangThaiLoc}
                        onChange={(suKien) => {
                          datTrangThaiLoc(suKien.target.value);
                          datTrang(1);
                        }}
                      >
                        <option value="">Tất cả</option>
                        <option value="MOI">Mới</option>
                        <option value="DA_PHAN_CONG">Đã phân công</option>
                        <option value="DANG_XU_LY">Đang xử lý</option>
                        <option value="CHO_LINH_KIEN">Chờ linh kiện</option>
                        <option value="HOAN_TAT">Hoàn tất</option>
                        <option value="DA_DONG">Đã đóng</option>
                      </select>
                    </div>
                  </th>
                  <th>Mức ưu tiên</th>
                  <th>Nhóm sự cố</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {dangTai && (
                  <tr>
                    <td colSpan="8" role="status">
                      Đang tải danh sách phiếu...
                    </td>
                  </tr>
                )}
                {!dangTai && loiTai && (
                  <tr>
                    <td colSpan="8" role="alert">
                      {loiTai.message}{" "}
                      <button
                        type="button"
                        onClick={() => datSoLanTaiLai((lan) => lan + 1)}
                      >
                        Thử lại
                      </button>
                    </td>
                  </tr>
                )}
                {!dangTai && !loiTai && trangVuotQuaCuoi && (
                  <tr>
                    <td colSpan="8" role="status">
                      Danh sách vừa thay đổi. Đang chuyển về trang có dữ liệu...
                    </td>
                  </tr>
                )}
                {!dangTai && !loiTai && !trangVuotQuaCuoi && cacPhieu.length === 0 && tongSo === 0 && !trangThaiLoc && (
                  <tr>
                    <td colSpan="8">Chưa có phiếu bảo hành nào.</td>
                  </tr>
                )}
                {!dangTai && !loiTai && !trangVuotQuaCuoi && cacPhieu.length === 0 && tongSo === 0 && trangThaiLoc && (
                  <tr>
                    <td colSpan="8">
                      Không tìm thấy phiếu ở trạng thái {tenTrangThai[trangThaiLoc] || trangThaiLoc}.{" "}
                      <button
                        className="nut nutPhu"
                        type="button"
                        onClick={() => {
                          datTrangThaiLoc("");
                          datTrang(1);
                        }}
                      >
                        Xóa bộ lọc
                      </button>
                    </td>
                  </tr>
                )}
                {!dangTai && !loiTai && !trangVuotQuaCuoi && cacPhieu.length === 0 && tongSo > 0 && (
                  <tr>
                    <td colSpan="8" role="status">
                      Trang này hiện chưa có dòng dữ liệu dù còn {tongSo} phiếu phù hợp. Bạn có thể tải lại danh sách.{" "}
                      <button
                        type="button"
                        onClick={() => datSoLanTaiLai((lan) => lan + 1)}
                      >
                        Tải lại
                      </button>
                    </td>
                  </tr>
                )}
                {!dangTai &&
                  !loiTai &&
                  cacPhieu.map((phieu, chiSo) => (
                    <tr key={phieu.ticket_id}>
                      <td>{(trang - 1) * kichThuoc + chiSo + 1}</td>
                      <td>{phieu.ticket_code}</td>
                      <td>{phieu.customer_name}</td>
                      <td>{phieu.serial_no}</td>
                      <td>{tenTrangThai[phieu.status] || phieu.status}</td>
                      <td>{phieu.priority}</td>
                      <td>{phieu.category_name || "—"}</td>
                      <td>
                        <button
                          type="button"
                          disabled
                          title="Chức năng xem chi tiết chưa được triển khai"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div
            className="dieuKhienPhanTrang"
            aria-label="Điều khiển phân trang"
          >
            <span>Tổng số phiếu: {tongSo}</span>
            <button
              type="button"
              disabled={dangTai || trang <= 1}
              onClick={() => datTrang((giaTri) => giaTri - 1)}
            >
              Trang trước
            </button>
            <span>
              Trang {trang} / {tongSoTrang}
            </span>
            <button
              type="button"
              disabled={dangTai || trang >= tongSoTrang}
              onClick={() => datTrang((giaTri) => giaTri + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
      <p className="vaiTroTiepNhan">Nhân viên tiếp nhận</p>
    </section>
  );
}
