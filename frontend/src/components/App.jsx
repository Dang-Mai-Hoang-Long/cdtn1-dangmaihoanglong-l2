import { useEffect, useState } from "react";
import XacNhanPhieu from "./TicketConfirmation.jsx";
import ChiTietPhieu from "./TicketDetail.jsx";
import BieuMauPhieu from "./TicketForm.jsx";
import DanhSachPhieu from "./TicketList.jsx";
import { phieuApi } from "../api/tickets.api.js";

const cacManHinh = {
  danhSach: "danh-sach",
  taoPhieu: "tao-phieu",
  xacNhan: "xac-nhan",
  chiTietPhieu: "chi-tiet-phieu",
};

const khoaBanNhap = "banNhapTaoPhieuBaoHanh.v1";
const duLieuPhieuRong = {
  phone: "",
  phone_masked: "",
  full_name: "",
  customer_id: null,
  serial_no: "",
  device_id: null,
  purchase_date: null,
  warranty_approved: null,
  issue_desc: "",
  category_id: "",
  priority: "",
};

function docBanNhap() {
  try {
    const chuoiBanNhap = window.sessionStorage.getItem(khoaBanNhap);
    if (!chuoiBanNhap) return duLieuPhieuRong;
    const banNhap = JSON.parse(chuoiBanNhap);
    if (
      banNhap?.version !== 1 ||
      !banNhap.duLieu ||
      typeof banNhap.duLieu !== "object"
    ) {
      window.sessionStorage.removeItem(khoaBanNhap);
      return duLieuPhieuRong;
    }
    return {
      ...duLieuPhieuRong,
      ...banNhap.duLieu,
      customer_id:
        banNhap.duLieu.customer_id !== null &&
        banNhap.duLieu.customer_id !== undefined &&
        Number.isSafeInteger(Number(banNhap.duLieu.customer_id)) &&
        Number(banNhap.duLieu.customer_id) > 0
          ? Number(banNhap.duLieu.customer_id)
          : null,
      // ID thiết bị cũ không được tin cậy sau refresh; serial sẽ được tra cứu lại.
      device_id: null,
      // Trạng thái bảo hành cũ cũng cần được tra cứu lại từ backend.
      purchase_date: null,
      warranty_approved: null,
    };
  } catch {
    return duLieuPhieuRong;
  }
}

function xoaBanNhap() {
  try {
    window.sessionStorage.removeItem(khoaBanNhap);
  } catch {
    /* Storage có thể bị trình duyệt chặn. */
  }
}

function layManHinhTuHash() {
  const hashHienTai = window.location.hash.slice(1);
  if (hashHienTai.startsWith(`${cacManHinh.chiTietPhieu}/`)) return "chiTietPhieu";
  return (
    Object.keys(cacManHinh).find(
      (manHinh) => cacManHinh[manHinh] === hashHienTai,
    ) || "danhSach"
  );
}

export default function UngDung() {
  const [manHinhHienTai, datManHinhHienTai] = useState(layManHinhTuHash);
  const [duLieuPhieu, datDuLieuPhieu] = useState(docBanNhap);
  const [loiTruong, datLoiTruong] = useState({});
  const [thongBao, datThongBao] = useState("");
  const [thongBaoThanhCong, datThongBaoThanhCong] = useState(false);
  const [danhMuc, datDanhMuc] = useState([]);
  const [dangXuLy, datDangXuLy] = useState(false);
  const [dangTraCuuThietBi, datDangTraCuuThietBi] = useState(false);
  const [phieuXemTruoc, datPhieuXemTruoc] = useState(null);
  const [phieuDangXem, datPhieuDangXem] = useState(null);
  const [dangTaiChiTiet, datDangTaiChiTiet] = useState(false);
  const [loiTaiChiTiet, datLoiTaiChiTiet] = useState(false);
  const [dangSuaPhieu, datDangSuaPhieu] = useState(false);
  const [lanCapNhatDanhSach, datLanCapNhatDanhSach] = useState(0);
  const [lanTaoPhieuMoi, datLanTaoPhieuMoi] = useState(0);

  useEffect(() => {
    if (manHinhHienTai !== "taoPhieu") return;
    const coDuLieu = Boolean(
      duLieuPhieu.phone ||
      duLieuPhieu.full_name ||
      duLieuPhieu.customer_id ||
      duLieuPhieu.serial_no ||
      duLieuPhieu.issue_desc ||
      duLieuPhieu.category_id ||
      duLieuPhieu.priority,
    );
    if (!coDuLieu) {
      xoaBanNhap();
      return;
    }
    try {
      window.sessionStorage.setItem(
        khoaBanNhap,
        JSON.stringify({ version: 1, duLieu: duLieuPhieu }),
      );
    } catch {
      /* Form vẫn hoạt động nếu Storage hết dung lượng hoặc bị trình duyệt chặn. */
    }
  }, [duLieuPhieu, manHinhHienTai]);

  useEffect(() => {
    phieuApi
      .layDanhMucSuCo()
      .then(datDanhMuc)
      .catch(() =>
        datThongBao("Không thể tải danh mục sự cố. Vui lòng tải lại trang."),
      );
  }, []);

  useEffect(() => {
    const dongBoManHinh = () => datManHinhHienTai(layManHinhTuHash());
    window.addEventListener("hashchange", dongBoManHinh);
    return () => window.removeEventListener("hashchange", dongBoManHinh);
  }, []);

  useEffect(() => {
    const ketQuaHash = window.location.hash.match(/^#chi-tiet-phieu\/(\d+)$/);
    if (!ketQuaHash) return;

    datDangTaiChiTiet(true);
    phieuApi
      .layChiTiet(ketQuaHash[1])
      .then(datPhieuDangXem)
      .catch((loi) => {
        datLoiTaiChiTiet(true);
        datThongBao(loi.message || "Không thể tải chi tiết phiếu.");
      })
      .finally(() => datDangTaiChiTiet(false));
  }, []);

  function chuyenManHinh(manHinhTiepTheo, maPhieu) {
    const duoiHash =
      manHinhTiepTheo === "chiTietPhieu"
        ? `/${maPhieu || phieuDangXem?.ticket_id || ""}`
        : "";
    const hashTiepTheo = `#${cacManHinh[manHinhTiepTheo]}${duoiHash}`;
    if (window.location.hash === hashTiepTheo)
      datManHinhHienTai(manHinhTiepTheo);
    else window.location.hash = hashTiepTheo;
    window.scrollTo(0, 0);
  }

  function thayDoiTruong(tenTruong, giaTri) {
    const mucUuTienMacDinh =
      tenTruong === "category_id"
        ? danhMuc.find((muc) => String(muc.category_id) === giaTri)
            ?.default_priority || ""
        : undefined;
    datDuLieuPhieu((duLieuCu) => ({
      ...duLieuCu,
      [tenTruong]: giaTri,
      ...(tenTruong === "phone"
        ? {
            customer_id: null,
            phone_masked: "",
            full_name: "",
            device_id: null,
            purchase_date: null,
            warranty_approved: null,
          }
        : {}),
      ...(tenTruong === "serial_no"
        ? {
            device_id: null,
            purchase_date: null,
            warranty_approved: null,
          }
        : {}),
      ...(tenTruong === "category_id" ? { priority: mucUuTienMacDinh } : {}),
    }));
    datLoiTruong((loiCu) => ({ ...loiCu, [tenTruong]: undefined }));
    if (tenTruong === "serial_no" || tenTruong === "phone") datThongBao("");
  }

  async function traCuuKhachHang() {
    datDangXuLy(true);
    datLoiTruong({});
    try {
      const khachHang = await phieuApi.timKhachHang(duLieuPhieu.phone);
      datDuLieuPhieu((duLieuCu) => ({
        ...duLieuCu,
        customer_id: khachHang.customer_id,
        full_name: khachHang.full_name,
        // Giữ số nhân viên đã nhập; API chỉ trả phone_masked.
        phone: duLieuCu.phone,
        phone_masked: khachHang.phone_masked,
        device_id: null,
        purchase_date: null,
        warranty_approved: null,
      }));
    } catch (loi) {
      if (loi.loiTheoTruong?.phone)
        datLoiTruong({ phone: loi.loiTheoTruong.phone });
      else datThongBao(loi.message);
    } finally {
      datDangXuLy(false);
    }
  }

  useEffect(() => {
    const soSerial = duLieuPhieu.serial_no.trim();
    const maKhachHang = duLieuPhieu.customer_id;
    if (!soSerial || !maKhachHang) {
      datDangTraCuuThietBi(false);
      return undefined;
    }

    const boDieuKhien = new AbortController();
    let conHieuLuc = true;
    datDangTraCuuThietBi(true);
    const henGio = window.setTimeout(async () => {
      datLoiTruong((loiCu) => ({ ...loiCu, serial_no: undefined }));
      try {
        const thietBi = await phieuApi.timThietBi(
          soSerial,
          maKhachHang,
          boDieuKhien.signal,
        );
        if (conHieuLuc) {
          datDuLieuPhieu((duLieuCu) => ({
            ...duLieuCu,
            device_id: thietBi.device_id,
            serial_no: thietBi.serial_no,
            purchase_date: thietBi.purchase_date,
            warranty_approved: thietBi.warranty_approved,
          }));
          datThongBao(
            thietBi.warranty_approved
              ? ""
              : thietBi.purchase_date
                ? "Thiết bị đã hết hạn bảo hành."
                : "Thiết bị chưa xác minh bảo hành do thiếu ngày mua.",
          );
        }
      } catch (loi) {
        if (!conHieuLuc || loi.name === "AbortError") return;
        if (loi.maLoi === "DEVICE_NOT_FOUND") {
          datThongBao("");
          datLoiTruong((loiCu) => ({ ...loiCu, serial_no: loi.message }));
        } else if (
          loi.maLoi === "VALIDATION_FAILED" &&
          loi.loiTheoTruong?.serial
        ) {
          datThongBao("");
          datLoiTruong((loiCu) => ({
            ...loiCu,
            serial_no: loi.loiTheoTruong.serial,
          }));
        } else {
          datLoiTruong((loiCu) => ({ ...loiCu, serial_no: undefined }));
          datThongBao(loi.message);
        }
      } finally {
        if (conHieuLuc) datDangTraCuuThietBi(false);
      }
    }, 400);

    return () => {
      conHieuLuc = false;
      window.clearTimeout(henGio);
      boDieuKhien.abort();
    };
  }, [duLieuPhieu.serial_no, duLieuPhieu.customer_id]);

  /**
   * CONTRACT: đổi dữ liệu màn hình thành JSON cho preview hoặc tạo phiếu.
   * Lúc tạo thật, phải gửi lại received_at và due_date đã nhận từ preview.
   * @param {Record<string, unknown>} phieu Dữ liệu đang hiển thị trên biểu mẫu/xác nhận.
   * @returns {Record<string, unknown>} Payload dùng chung cho hai endpoint.
   */
  function lapDuLieuGui(phieu) {
    return {
      customer_id: phieu.customer_id,
      device_id: phieu.device_id,
      center_id: 0,
      issue_desc: phieu.issue_desc,
      category_id: Number(phieu.category_id),
      ...(phieu.priority ? { priority: phieu.priority } : {}),
      ...(phieu.received_at ? { received_at: phieu.received_at } : {}),
      ...(phieu.due_date ? { due_date: phieu.due_date } : {}),
    };
  }

  async function kiemTraVaXemTruoc(suKien) {
    suKien.preventDefault();
    const loiMoi = {};
    if (!duLieuPhieu.customer_id)
      loiMoi.phone = "Vui lòng tra cứu và chọn khách hàng";
    if (!duLieuPhieu.serial_no.trim())
      loiMoi.serial_no = "Vui lòng nhập số serial thiết bị";
    if (!duLieuPhieu.issue_desc.trim())
      loiMoi.issue_desc = "Mô tả lỗi không được để trống";
    if (!duLieuPhieu.category_id)
      loiMoi.category_id = "Vui lòng chọn nhóm sự cố";
    if (Object.keys(loiMoi).length) {
      datLoiTruong((loiCu) => ({ ...loiCu, ...loiMoi }));
      return;
    }
    // Serial đã nhập nhưng API tra cứu chưa xác nhận thiết bị: giữ nguyên lỗi
    // tra cứu hoặc banner nghiệp vụ, không thêm thông báo chung trùng lặp.
    if (!duLieuPhieu.device_id) return;
    datThongBao("");
    datLoiTruong({});
    datDangXuLy(true);
    try {
      const ketQuaXemTruoc = await phieuApi.xemTruocTaoPhieu(
        lapDuLieuGui(duLieuPhieu),
      );
      datPhieuXemTruoc({
        ...duLieuPhieu,
        ...ketQuaXemTruoc,
        category_name: danhMuc.find(
          (muc) => Number(muc.category_id) === Number(duLieuPhieu.category_id),
        )?.category_name,
      });
      chuyenManHinh("xacNhan");
    } catch (loi) {
      if (
        [
          "DEVICE_CUSTOMER_MISMATCH",
          "WARRANTY_NOT_APPROVED",
          "TICKET_CONFLICT",
          "CUSTOMER_NOT_FOUND",
          "DEVICE_NOT_FOUND",
        ].includes(loi.maLoi)
      ) {
        datThongBao(loi.message);
      } else if (loi.loiTheoTruong && Object.keys(loi.loiTheoTruong).length) {
        const loiHienThi = { ...loi.loiTheoTruong };
        if (loiHienThi.serial) loiHienThi.serial_no = loiHienThi.serial;
        datLoiTruong(loiHienThi);
      } else
        datThongBao(
          loi.message || "Không thể kiểm tra thông tin phiếu lúc này.",
        );
    } finally {
      datDangXuLy(false);
    }
  }

  async function xacNhanTaoPhieu() {
    if (!phieuXemTruoc || dangXuLy) return;
    datDangXuLy(true);
    datThongBao("");
    try {
      await phieuApi.xacNhanTaoPhieu(lapDuLieuGui(phieuXemTruoc));
      datLanCapNhatDanhSach((soLan) => soLan + 1);
      datLanTaoPhieuMoi((soLan) => soLan + 1);
      xoaBanNhap();
      datDuLieuPhieu(duLieuPhieuRong);
      datPhieuXemTruoc(null);
      chuyenManHinh("danhSach");
    } catch (loi) {
      datThongBao(loi.message || "Không thể tạo phiếu ngay lúc này.");
    } finally {
      datDangXuLy(false);
    }
  }

  function huyBieuMau() {
    xoaBanNhap();
    datDuLieuPhieu(duLieuPhieuRong);
    datLoiTruong({});
    datThongBao("");
    chuyenManHinh("danhSach");
  }

  function batDauTaoPhieu() {
    datDangSuaPhieu(false);
    datDuLieuPhieu(duLieuPhieuRong);
    datLoiTruong({});
    datThongBao("");
    chuyenManHinh("taoPhieu");
  }

  async function moChiTietPhieu(phieu) {
    datDangSuaPhieu(false);
    datPhieuDangXem(phieu);
    datDangTaiChiTiet(true);
    datLoiTaiChiTiet(false);
    datThongBao("");
    datThongBaoThanhCong(false);
    chuyenManHinh("chiTietPhieu", phieu.ticket_id);
    try {
      datPhieuDangXem(await phieuApi.layChiTiet(phieu.ticket_id));
    } catch (loi) {
      datLoiTaiChiTiet(true);
      datThongBao(loi.message || "Không thể tải chi tiết phiếu.");
    } finally {
      datDangTaiChiTiet(false);
    }
  }

  function batDauChinhSuaPhieu() {
    if (!phieuDangXem) return;
    datDuLieuPhieu({
      ...duLieuPhieuRong,
      issue_desc: phieuDangXem.issue_desc || "",
      category_id: String(phieuDangXem.category_id || ""),
      priority: phieuDangXem.priority || "",
    });
    datLoiTruong({});
    datThongBao("");
    datThongBaoThanhCong(false);
    datDangSuaPhieu(true);
  }

  async function luuThayDoiPhieu(suKien) {
    suKien.preventDefault();
    if (!phieuDangXem || dangXuLy) return;
    const loiMoi = {};
    if (!duLieuPhieu.issue_desc.trim())
      loiMoi.issue_desc = "Mô tả lỗi không được để trống";
    if (!duLieuPhieu.category_id)
      loiMoi.category_id = "Vui lòng chọn nhóm sự cố";
    if (!duLieuPhieu.priority)
      loiMoi.priority = "Vui lòng chọn mức ưu tiên";
    if (Object.keys(loiMoi).length) {
      datLoiTruong(loiMoi);
      return;
    }

    datLoiTruong({});
    datThongBao("");
    datDangXuLy(true);
    try {
      const phieuCapNhat = await phieuApi.capNhatPhieu(phieuDangXem.ticket_id, {
        issue_desc: duLieuPhieu.issue_desc,
        category_id: Number(duLieuPhieu.category_id),
        priority: duLieuPhieu.priority,
      });
      datPhieuDangXem(phieuCapNhat);
      datDuLieuPhieu(duLieuPhieuRong);
      datThongBao("Đã cập nhật phiếu bảo hành.");
      datThongBaoThanhCong(true);
      datDangSuaPhieu(false);
      datLanCapNhatDanhSach((soLan) => soLan + 1);
    } catch (loi) {
      datThongBaoThanhCong(false);
      if (loi.loiTheoTruong) datLoiTruong(loi.loiTheoTruong);
      else datThongBao(loi.message || "Không thể cập nhật phiếu lúc này.");
    } finally {
      datDangXuLy(false);
    }
  }

  async function dongPhieuDangXem() {
    if (!phieuDangXem || dangXuLy) return;
    if (!window.confirm(`Đóng phiếu ${phieuDangXem.ticket_code}?`)) return;
    datDangXuLy(true);
    datThongBao("");
    datThongBaoThanhCong(false);
    try {
      const ketQua = await phieuApi.dongPhieu(phieuDangXem.ticket_id);
      datPhieuDangXem((phieuCu) => ({ ...phieuCu, ...ketQua }));
      datThongBao("Đã đóng phiếu bảo hành.");
      datThongBaoThanhCong(true);
      datLanCapNhatDanhSach((soLan) => soLan + 1);
    } catch (loi) {
      datThongBaoThanhCong(false);
      datThongBao(loi.message || "Không thể đóng phiếu lúc này.");
    } finally {
      datDangXuLy(false);
    }
  }

  function huyChinhSuaPhieu() {
    datDangSuaPhieu(false);
    datDuLieuPhieu(duLieuPhieuRong);
    datLoiTruong({});
    datThongBao("");
    datThongBaoThanhCong(false);
    chuyenManHinh("chiTietPhieu");
  }

  return (
    <main className="khungNoiDung">
      <div className={manHinhHienTai === "danhSach" ? "" : "an"}>
        <DanhSachPhieu
          khiTaoPhieu={batDauTaoPhieu}
          khiXemChiTiet={moChiTietPhieu}
          lanCapNhatNgoai={lanCapNhatDanhSach}
          lanTaoPhieuMoi={lanTaoPhieuMoi}
        />
      </div>
      {manHinhHienTai === "taoPhieu" && (
        <BieuMauPhieu
          duLieu={duLieuPhieu}
          loiTruong={loiTruong}
          thongBao={thongBao}
          danhMuc={danhMuc}
          dangXuLy={dangXuLy}
          dangTraCuuThietBi={dangTraCuuThietBi}
          khiThayDoi={thayDoiTruong}
          khiTraCuuKhachHang={traCuuKhachHang}
          khiHuy={huyBieuMau}
          khiXemTruoc={kiemTraVaXemTruoc}
        />
      )}
      {manHinhHienTai === "xacNhan" && (
        <XacNhanPhieu
          phieuXemTruoc={phieuXemTruoc}
          thongBao={thongBao}
          dangXuLy={dangXuLy}
          khiQuayLai={() => chuyenManHinh("taoPhieu")}
          khiXacNhan={xacNhanTaoPhieu}
        />
      )}
      {manHinhHienTai === "chiTietPhieu" && !phieuDangXem && (
        <section className="manHinh manHinhXacNhan">
          <header className="tieuDeManHinh"><h1>Chi tiết phiếu bảo hành</h1></header>
          <div className="khungXacNhan">
            <p role={dangTaiChiTiet ? "status" : "alert"}>
              {dangTaiChiTiet ? "Đang tải chi tiết phiếu..." : thongBao || "Không có thông tin phiếu để hiển thị."}
            </p>
            <div className="nhomNut">
              <button className="nut nutPhu" type="button" onClick={() => chuyenManHinh("danhSach")}>
                Quay lại danh sách
              </button>
            </div>
          </div>
        </section>
      )}
      {manHinhHienTai === "chiTietPhieu" && phieuDangXem && !dangSuaPhieu && (
        <ChiTietPhieu
          phieu={phieuDangXem}
          thongBao={dangTaiChiTiet ? "Đang tải chi tiết phiếu..." : thongBao}
          thongBaoThanhCong={thongBaoThanhCong}
          dangXuLy={dangXuLy || dangTaiChiTiet}
          coLoiTaiChiTiet={loiTaiChiTiet}
          khiQuayLai={() => chuyenManHinh("danhSach")}
          khiChinhSua={batDauChinhSuaPhieu}
          khiDongPhieu={dongPhieuDangXem}
        />
      )}
      {manHinhHienTai === "chiTietPhieu" && phieuDangXem && dangSuaPhieu && (
        <BieuMauPhieu
          duLieu={duLieuPhieu}
          loiTruong={loiTruong}
          thongBao={thongBao}
          danhMuc={danhMuc}
          dangXuLy={dangXuLy}
          dangTraCuuThietBi={false}
          khiThayDoi={thayDoiTruong}
          khiTraCuuKhachHang={() => {}}
          khiHuy={huyChinhSuaPhieu}
          khiXemTruoc={luuThayDoiPhieu}
          cheDoChinhSua
          phieuHienTai={phieuDangXem}
        />
      )}
    </main>
  );
}
