import { guiYeuCau } from "./client.js";

export const xacThucApi = {
  dangNhap: (tenDangNhap, matKhau) =>
    guiYeuCau("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: tenDangNhap, password: matKhau }),
    }),
  layNguoiDung: () => guiYeuCau("/api/auth/me"),
  dangXuat: () => guiYeuCau("/api/auth/logout", { method: "POST" }),
};
