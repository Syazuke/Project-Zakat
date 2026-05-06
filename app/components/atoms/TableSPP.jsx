"use client";

import React from "react";

const TableSPP = ({
  activeTab,
  filterBulanSPP,
  setFilterBulanSPP,
  handleDeleteLamaSPP,
  handleOpenSpreadsheet,
  handleDeleteSingleSPP,
  dataTampilSPP,
  StatusBadge,
  SPREADSHEET_URL_SPP,
  handleKonfirmasi,
}) => {
  const SPREADSHEET_URL_Penggunaan_SPP =
    "https://docs.google.com/spreadsheets/d/15UptL0nXC3c-BPoMH4QoWxSebbFfHVDAb3C6ghzwEiA/edit?usp=sharing";
  return (
    <div>
      {" "}
      {activeTab === "spp" && (
        <div>
          <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900">Riwayat Kas SPP</h3>
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <select
                value={filterBulanSPP}
                onChange={(e) => setFilterBulanSPP(e.target.value)}
                className="border rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-500"
              >
                <option value="semua">Semua Waktu</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="bulan_lalu">Bulan Lalu</option>
              </select>
              <button
                onClick={handleDeleteLamaSPP}
                className="bg-red-50 text-red-600 px-2 py-2 rounded-lg text-xs font-semibold hover:bg-red-100"
              >
                Bersihkan 1 bulan lalu
              </button>
              <button
                onClick={() => handleOpenSpreadsheet(SPREADSHEET_URL_SPP)}
                className="bg-blue-600 text-white px-2 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                📄 Laporan Pemasukan SPP
              </button>
              <button
                onClick={() =>
                  handleOpenSpreadsheet(SPREADSHEET_URL_Penggunaan_SPP)
                }
                className="bg-blue-600 text-white px-2 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                📄 Laporan Penggunaan SPP
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-blue-50 text-blue-800 font-semibold">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Tagihan</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataTampilSPP.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  dataTampilSPP.map((spp) => (
                    <tr key={spp.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {new Date(spp.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {spp.studentName}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {spp.sppType} ({spp.paymentMonth})
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        Rp {spp.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">{spp.message}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={spp.status} />
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        {spp.status === "PENDING_TUNAI" && (
                          <button
                            onClick={() => handleKonfirmasi(spp.id, "SPP")}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
                          >
                            ✅ Terima Tunai
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSingleSPP(spp.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableSPP;
