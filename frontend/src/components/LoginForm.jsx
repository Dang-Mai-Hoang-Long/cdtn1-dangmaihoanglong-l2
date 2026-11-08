import { useState } from "react";

export default function BieuMauDangNhap({ khiDangNhap, dangXuLy, loi }) {
  const [tenDangNhap, datTenDangNhap] = useState("");
  const [matKhau, datMatKhau] = useState("");

  async function guiDangNhap(suKien) {
    suKien.preventDefault();
    await khiDangNhap(tenDangNhap, matKhau);
  }

  return (
    <main className="khungNoiDung manHinhDangNhap">
      <form className="khungDangNhap" onSubmit={guiDangNhap}>
        <p className="nhanDienDangNhap">Mekong Mobile</p>
        <h1>Đăng nhập</h1>
        <label htmlFor="ten-dang-nhap">Tên đăng nhập</label>
        <input
          id="ten-dang-nhap"
          name="username"
          autoComplete="username"
          value={tenDangNhap}
          onChange={(suKien) => datTenDangNhap(suKien.target.value)}
          required
          maxLength={80}
        />
        <label htmlFor="mat-khau">Mật khẩu</label>
        <input
          id="mat-khau"
          name="password"
          type="password"
          autoComplete="current-password"
          value={matKhau}
          onChange={(suKien) => datMatKhau(suKien.target.value)}
          required
          maxLength={200}
        />
        {loi && <p className="loiDangNhap" role="alert">{loi}</p>}
        <button className="nut nutChinh" type="submit" disabled={dangXuLy}>
          {dangXuLy ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
