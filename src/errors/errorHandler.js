import LoiUngDung from "./AppError.js";

const maHttpTheoMaLoi = {
  NOT_FOUND: 404,
  INVALID_STATUS: 400,
  INVALID_PAGE_SIZE: 400,
  VALIDATION_FAILED: 400,
  INVALID_PHONE: 400,
  CUSTOMER_NOT_FOUND: 404,
  DEVICE_NOT_FOUND: 404,
  TICKET_CONFLICT: 409,
  WARRANTY_NOT_APPROVED: 422,
  DEVICE_CUSTOMER_MISMATCH: 422,
};

export default function xuLyLoiApi(loi, yeuCau, phanHoi, tiepTuc) {
  if (loi instanceof LoiUngDung && maHttpTheoMaLoi[loi.maLoi]) {
    const maHttp = maHttpTheoMaLoi[loi.maLoi];
    return phanHoi.status(maHttp).json({
      error: {
        code: loi.maLoi,
        message: loi.message,
        fields: loi.loiTheoTruong,
      },
    });
  }

  // JSON sai cú pháp do express.json() ném ra trước khi request vào route.
  if (loi?.type === "entity.parse.failed") {
    return phanHoi.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Nội dung JSON không hợp lệ.",
        fields: {},
      },
    });
  }

  console.error("Lỗi API:", loi);
  return phanHoi.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Không thể xử lý yêu cầu lúc này.",
      fields: {},
    },
  });
}
