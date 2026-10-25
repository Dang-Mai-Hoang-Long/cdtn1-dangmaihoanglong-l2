import { useEffect, useState } from "react";
import XacNhanPhieu from "./TicketConfirmation.jsx";
import BieuMauPhieu from "./TicketForm.jsx";
import DanhSachPhieu from "./TicketList.jsx";
import { phieuApi } from "../api/tickets.api.js";

const cacManHinh = {
  danhSach: "danh-sach",
  taoPhieu: "tao-phieu",
  xacNhan: "xac-nhan",
};

const khoaBanNhap = "banNhapTaoPhieuBaoHanh.v1";
const duLieuPhieuRong = {
  phone: "",
  phone_masked: "",
  full_name: "",
  customer_id: null,
  serial_no: "",
  device_id: null,
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
  const [danhMuc, datDanhMuc] = useState([]);
  const [dangXuLy, datDangXuLy] = useState(false);
  const [dangTraCuuThietBi, datDangTraCuuThietBi] = useState(false);
  const [phieuXemTruoc, datPhieuXemTruoc] = useState(null);

  useEffect(() => {
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
  }, [duLieuPhieu]);

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

  function chuyenManHinh(manHinhTiepTheo) {
    const hashTiepTheo = `#${cacManHinh[manHinhTiepTheo]}`;
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
          }
        : {}),
      ...(tenTruong === "serial_no" ? { device_id: null } : {}),
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
          }));
          datThongBao("");
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
      const ketQuaXemTruoc = await phieuApi.xemTruocTaoPhieu(lapDuLieuGui(duLieuPhieu));
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

  return (
    <main className="khungNoiDung">
      {manHinhHienTai === "danhSach" && (
        <DanhSachPhieu khiTaoPhieu={() => chuyenManHinh("taoPhieu")} />
      )}
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
    </main>
  );
}
