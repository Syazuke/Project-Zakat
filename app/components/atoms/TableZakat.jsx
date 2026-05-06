"use client";

import React from "react";

const TableZakat = ({
  filterBulanZakat,
  setFilterBulanZakat,
  handleDeleteLama,
  handleOpenSpreadsheet,
  handleDeleteSingle,
  activeTab,
  dataTampilZakat,
  StatusBadge,
  SPREADSHEET_URL_ZAKAT,
  handleKonfirmasi,
  SPREADSHEET_URL_INFAQ,
}) => {
  const SPREADSHEET_URL_Penyaluran_ZAKAT =
    "https://docs.google.com/spreadsheets/d/1q0Inp0UdRk_aQbQqa0Hj7bRE52crtFKEGcxQljcHGyU/edit?usp=sharing";
  return (
    <div>
      {activeTab === "zakat" && (
        <div>
          <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900">
              Riwayat Kas Zakat
            </h3>
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <select
                value={filterBulanZakat}
                onChange={(e) => setFilterBulanZakat(e.target.value)}
                className="border rounded-lg px-2 py-2 text-xs outline-none focus:border-emerald-500"
              >
                <option value="semua">Semua Waktu</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="bulan_lalu">Bulan Lalu</option>
              </select>
              <button
                onClick={handleDeleteLama}
                className="bg-red-50 text-red-600 px-2 py-2 rounded-lg text-xs font-semibold hover:bg-red-100"
              >
                Bersihkan 1 bulan lalu
              </button>
              <div className="flex gap-5">
                <button
                  onClick={() => handleOpenSpreadsheet(SPREADSHEET_URL_ZAKAT)}
                  className="bg-emerald-600 text-white px-2 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  📄 Laporan Pemasukkan Zakat
                </button>
                <button
                  onClick={() =>
                    handleOpenSpreadsheet(SPREADSHEET_URL_Penyaluran_ZAKAT)
                  }
                  className="bg-emerald-600 text-white px-2 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  📄 Laporan Penyaluran Zakat
                </button>
                <button
                  onClick={() => handleOpenSpreadsheet(SPREADSHEET_URL_INFAQ)}
                  className="bg-emerald-600 text-white px-2 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  📄 Laporan Pemasukan INFAQ
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-emerald-50 text-emerald-800 font-semibold">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Jenis</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataTampilZakat.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  dataTampilZakat.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {new Date(trx.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {trx.name}
                      </td>
                      {penghasilan || maal || fidyah ? (
                        <td className="px-6 py-4 capitalize">
                          Zakat {trx.zakatType}
                        </td>
                      ) : (
                        <td className="px-6 py-4 capitalize">
                          {trx.zakatType}
                        </td>
                      )}
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        Rp {trx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">{trx.message}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trx.status} />
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        {trx.status === "PENDING_TUNAI" && (
                          <button
                            onClick={() => handleKonfirmasi(trx.id, "ZAKAT")}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
                          >
                            ✅ Terima Tunai
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSingle(trx.id)}
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

export default TableZakat;
