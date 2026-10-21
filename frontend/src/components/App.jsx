import { useEffect, useState } from 'react';
import XacNhanPhieu from './TicketConfirmation.jsx';
import BieuMauPhieu from './TicketForm.jsx';
import DanhSachPhieu from './TicketList.jsx';

const cacManHinh = {
  danhSach: 'danh-sach',
  taoPhieu: 'tao-phieu',
  xacNhan: 'xac-nhan'
};

function layManHinhTuHash() {
  const hashHienTai = window.location.hash.slice(1);
  return Object.keys(cacManHinh).find((manHinh) => cacManHinh[manHinh] === hashHienTai) || 'danhSach';
}

export default function UngDung() {
  const [manHinhHienTai, datManHinhHienTai] = useState(layManHinhTuHash);

  useEffect(() => {
    const dongBoManHinh = () => datManHinhHienTai(layManHinhTuHash());
    window.addEventListener('hashchange', dongBoManHinh);
    return () => window.removeEventListener('hashchange', dongBoManHinh);
  }, []);

  function chuyenManHinh(manHinhTiepTheo) {
    const hashTiepTheo = `#${cacManHinh[manHinhTiepTheo]}`;
    if (window.location.hash === hashTiepTheo) datManHinhHienTai(manHinhTiepTheo);
    else window.location.hash = hashTiepTheo;
    window.scrollTo(0, 0);
  }

  function guiBieuMau(suKien) {
    suKien.preventDefault();
    chuyenManHinh('xacNhan');
  }

  return (
    <main className="khungNoiDung">
      {manHinhHienTai === 'danhSach' && <DanhSachPhieu khiTaoPhieu={() => chuyenManHinh('taoPhieu')} />}
      {manHinhHienTai === 'taoPhieu' && (
        <BieuMauPhieu khiHuy={() => chuyenManHinh('danhSach')} khiGui={guiBieuMau} />
      )}
      {manHinhHienTai === 'xacNhan' && (
        <XacNhanPhieu
          khiQuayLai={() => chuyenManHinh('taoPhieu')}
          khiXacNhan={() => chuyenManHinh('danhSach')}
        />
      )}
    </main>
  );
}
