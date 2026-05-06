import React from "react";
import { Trash2, AlertCircle } from "lucide-react";

export default function TablePenyaluran({ riwayat, handleDelete }) {
  const totalKeluar = riwayat.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  return (
    <div className="p-4 md:p-6 bg-white animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Riwayat Penarikan Dana
          </h2>
          <p className="text-sm text-slate-500">
            Data uang keluar dari kas yayasan/sekolah.
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg font-bold shadow-sm">
          Total Keluar: Rp {totalKeluar.toLocaleString("id-ID")}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <th className="p-4 font-bold whitespace-nowrap">Tanggal</th>
              <th className="p-4 font-bold whitespace-nowrap">Sumber Kas</th>
              <th className="p-4 font-bold">Keterangan</th>
              <th className="p-4 font-bold whitespace-nowrap">Admin</th>
              <th className="p-4 font-bold whitespace-nowrap">Nominal</th>
              <th className="p-4 font-bold text-center whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Belum ada riwayat penyaluran/penarikan dana.
                </td>
              </tr>
            ) : (
              riwayat.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded font-bold text-[10px] sm:text-xs whitespace-nowrap ${
                        item.source === "ZAKAT"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.source}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-700 min-w-[200px]">
                    {item.note}
                  </td>
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {item.withdrawnBy}
                  </td>
                  <td className="p-4 font-bold text-red-600 whitespace-nowrap">
                    - Rp {Number(item.amount).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                      title="Hapus Data (Batalkan Penarikan)"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
