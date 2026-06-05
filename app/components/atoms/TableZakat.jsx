"use client";

import { EllipsisVertical } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

const TableZakat = ({
  activeTab,
  Confirmation,
  DeleteLongZakat,
  DeleteSingleZakat,
  ShowDataZakat,
  StatusBadge,
  UrlReceiveZakat,
  UrlUsedZakat,
  UrlReceiveInfaq,
  UrlUsedInfaq,
  setFilterMonthZakat,
  filterMonthZakat,
  handleOpenSpreadsheet,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsReportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div className="flex flex-col">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 relative z-[60]">
          <h3 className="text-xl font-bold text-gray-900">Riwayat Kas Zakat</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={filterMonthZakat}
              onChange={(e) => setFilterMonthZakat(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm outline-none focus:border-emerald-500 bg-white"
            >
              <option value="semua">Semua Waktu</option>
              <option value="bulan_ini">Bulan Ini</option>
              <option value="bulan_lalu">Bulan Lalu</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={DeleteLongZakat}
                title="Bersihkan 1 bulan lalu"
                className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-red-100 transition flex items-center gap-2"
              >
                <span className="hidden sm:inline">Bersihkan 1 bulan lalu</span>
                <span className="sm:hidden text-lg">🗑️</span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsReportOpen(!isReportOpen)}
                  title="Menu Laporan"
                  className={`p-2 rounded-lg transition border flex items-center justify-center ${
                    isReportOpen
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <EllipsisVertical />
                </button>

                {/* ✨ DROPDOWN Z-INDEX PALING TINGGI (z-[100]) ✨ */}
                {isReportOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pilih Laporan
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleOpenSpreadsheet(UrlReceiveZakat);
                        setIsReportOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-gray-50 transition"
                    >
                      📄 Pemasukan Zakat
                    </button>
                    <button
                      onClick={() => {
                        handleOpenSpreadsheet(UrlUsedZakat);
                        setIsReportOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-gray-50 transition"
                    >
                      📤 Penyaluran Zakat
                    </button>
                    <button
                      onClick={() => {
                        handleOpenSpreadsheet(UrlReceiveInfaq);
                        setIsReportOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-gray-50 transition"
                    >
                      📄 Pemasukan Infaq
                    </button>
                    <button
                      onClick={() => {
                        handleOpenSpreadsheet(UrlUsedInfaq);
                        setIsReportOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                    >
                      📤 Penyaluran Infaq
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative z-0">
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
              {ShowDataZakat.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                ShowDataZakat.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      {new Date(i.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {i.name}
                    </td>

                    {["penghasilan", "maal", "fidyah", "fitrah"].includes(
                      i.zakatType?.toLowerCase(),
                    ) ? (
                      <td className="px-6 py-4 capitalize">
                        Zakat {i.zakatType}
                      </td>
                    ) : (
                      <td className="px-6 py-4 capitalize">{i.zakatType}</td>
                    )}

                    <td className="px-6 py-4 font-bold text-emerald-600">
                      Rp {i.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">{i.message}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      {i.status.includes("PENDING") && (
                        <button
                          onClick={() => Confirmation(i.id, "ZAKAT")}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
                        >
                          ✅ Terima Tunai
                        </button>
                      )}
                      <button
                        onClick={() => DeleteSingleZakat(i.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-md font-medium transition"
                        title="Hapus Transaksi"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableZakat;
