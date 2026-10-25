export default function BieuMauPhieu({
  duLieu,
  loiTruong,
  thongBao,
  danhMuc,
  dangXuLy,
  dangTraCuuThietBi,
  khiThayDoi,
  khiTraCuuKhachHang,
  khiHuy,
  khiXemTruoc,
}) {
  function doiTruong(suKien) {
    khiThayDoi(suKien.target.name, suKien.target.value);
  }

  return (
    <section className="manHinh manHinhTaoPhieu">
      <header className="tieuDeManHinh">
        <h1>Tạo phiếu bảo hành</h1>
      </header>
      <form className="bieuMau" onSubmit={khiXemTruoc} noValidate>
        <div className="truongHang truongTraCuu">
          <label htmlFor="so-dien-thoai">Số điện thoại khách hàng</label>
          <div>
            <div className="hangTraCuu">
              <input
                id="so-dien-thoai"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                value={duLieu.phone}
                onChange={doiTruong}
                aria-invalid={Boolean(loiTruong.phone)}
              />
              <button
                className="nut nutTraCuu"
                type="button"
                onClick={khiTraCuuKhachHang}
                disabled={dangXuLy}
              >
                Tra cứu
              </button>
            </div>
            <p className="loiTruong" title={loiTruong.phone || undefined}>
              {loiTruong.phone || "\u00a0"}
            </p>
          </div>
        </div>
        <div className="truongHang">
          <label htmlFor="ho-ten">Họ tên khách hàng</label>
          <input
            id="ho-ten"
            name="full_name"
            type="text"
            placeholder="Họ tên khách hàng"
            value={duLieu.full_name}
            readOnly
          />
        </div>
        <div className="truongHang truongSerial">
          <label htmlFor="so-serial">Số serial thiết bị</label>
          <div>
            <div className="hangTraCuu hangTraCuuSerial">
              <input
                id="so-serial"
                name="serial_no"
                type="text"
                placeholder="Nhập số serial thiết bị"
                value={duLieu.serial_no}
                onChange={doiTruong}
                aria-invalid={Boolean(loiTruong.serial_no)}
              />
            </div>
            <p
              className={`loiTruong${dangTraCuuThietBi ? " trangThaiTraCuu" : ""}`}
              role={dangTraCuuThietBi ? "status" : undefined}
              title={
                dangTraCuuThietBi ? undefined : loiTruong.serial_no || undefined
              }
            >
              {dangTraCuuThietBi
                ? "Đang kiểm tra thiết bị…"
                : loiTruong.serial_no || "\u00a0"}
            </p>
          </div>
        </div>
        <div className="truongHang truongMoTa">
          <label htmlFor="mo-ta-loi">Mô tả lỗi</label>
          <div>
            <textarea
              id="mo-ta-loi"
              name="issue_desc"
              rows="3"
              placeholder="Mô tả tình trạng lỗi"
              value={duLieu.issue_desc}
              onChange={doiTruong}
              aria-invalid={Boolean(loiTruong.issue_desc)}
            />
            <p className="loiTruong" title={loiTruong.issue_desc || undefined}>
              {loiTruong.issue_desc || "\u00a0"}
            </p>
          </div>
        </div>
        <div className="truongHang">
          <label htmlFor="nhom-su-co">Nhóm sự cố</label>
          <div>
            <select
              id="nhom-su-co"
              name="category_id"
              value={duLieu.category_id}
              onChange={doiTruong}
              aria-invalid={Boolean(loiTruong.category_id)}
            >
              <option value="">Chọn nhóm sự cố</option>
              {danhMuc.map((muc) => (
                <option key={muc.category_id} value={muc.category_id}>
                  {muc.category_name}
                </option>
              ))}
            </select>
            <p className="loiTruong" title={loiTruong.category_id || undefined}>
              {loiTruong.category_id || "\u00a0"}
            </p>
          </div>
        </div>
        <fieldset className="truongHang truongUuTien">
          <legend>Mức ưu tiên</legend>
          <div>
            <div className="cacMucUuTien">
              {[
                ["CAO", "Cao"],
                ["TRUNG_BINH", "Trung bình"],
                ["THAP", "Thấp"],
              ].map(([giaTri, nhan]) => (
                <label key={giaTri}>
                  <input
                    type="radio"
                    name="priority"
                    value={giaTri}
                    checked={duLieu.priority === giaTri}
                    onChange={doiTruong}
                  />{" "}
                  {nhan}
                </label>
              ))}
            </div>
            <p className="loiTruong" title={loiTruong.priority || undefined}>
              {loiTruong.priority || "\u00a0"}
            </p>
          </div>
        </fieldset>
        <div
          className={`canhBaoBaoHanh${thongBao ? " coThongBao" : ""}`}
          role={thongBao ? "alert" : undefined}
          aria-live="polite"
        >
          {thongBao && (
            <>
              <span className="bieuTuongCanhBao" aria-hidden="true">
                ⚠
              </span>
              <span className="noiDungCanhBao">{thongBao}</span>
            </>
          )}
        </div>
        <div className="nhomNut">
          <button
            className="nut nutPhu"
            type="button"
            onClick={khiHuy}
            disabled={dangXuLy}
          >
            Hủy
          </button>
          <button
            className="nut nutChinh"
            type="submit"
            disabled={dangXuLy || dangTraCuuThietBi}
          >
            Tạo phiếu
          </button>
        </div>
      </form>
    </section>
  );
}
