import React from "react";

const Card = ({ saldoZakat, saldoSPP, pendingVerifikasi, totalOrang }) => {
  return (
    <div className="flex gap-10">
      {/* KARTU KAS ZAKAT */}
      <div className="bg-emerald-600 text-white p-6 w-full rounded-2xl shadow-md border border-emerald-700 flex flex-col justify-between">
        <div>
          <p className="text-emerald-100 text-sm font-medium mb-1">
            Sisa Kas Zakat (Tersedia)
          </p>
          <h3 className="text-3xl font-bold">
            Rp {saldoZakat.bersih.toLocaleString("id-ID")}
          </h3>
        </div>
        <div className="mt-4 bg-emerald-700/50 p-3 rounded-lg text-xs font-medium space-y-1">
          <p className="flex justify-between">
            <span>Pemasukan Kotor:</span>{" "}
            <span>Rp {saldoZakat.kotor.toLocaleString("id-ID")}</span>
          </p>
          <p className="flex justify-between text-red-200">
            <span>Telah Disalurkan:</span>{" "}
            <span>- Rp {saldoZakat.ditarik.toLocaleString("id-ID")}</span>
          </p>
        </div>
      </div>

      {/* KARTU KAS SPP */}
      <div className="bg-blue-600 text-white p-6 w-full rounded-2xl shadow-md border border-blue-700 flex flex-col justify-between">
        <div>
          <p className="text-blue-100 text-sm font-medium mb-1">
            Sisa Kas SPP (Tersedia)
          </p>
          <h3 className="text-3xl font-bold">
            Rp {saldoSPP.bersih.toLocaleString("id-ID")}
          </h3>
        </div>
        <div className="mt-4 bg-blue-700/50 p-3 rounded-lg text-xs font-medium space-y-1">
          <p className="flex justify-between">
            <span>Pemasukan Kotor:</span>{" "}
            <span>Rp {saldoSPP.kotor.toLocaleString("id-ID")}</span>
          </p>
          {/* ✨ Ubah kata 'Ditarik' menjadi 'Terpakai' */}
          <p className="flex justify-between text-red-200">
            <span>Terpakai (Operasional):</span>{" "}
            <span>- Rp {saldoSPP.ditarik.toLocaleString("id-ID")}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
