"use client";

import { EllipsisVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TableSPP = ({
  activeTab,
  Confirmation,
  DeleteSingleSpp,
  DeleteLongSpp,
  filterMonthSpp,
  handleOpenSpreadsheet,
  UrlReceiveSpp,
  UrlUsedSpp,
  ShowDataSpp,
  StatusBadge,
  setFilterMonthSpp,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsReportOpen(false);
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {activeTab === "spp" && (
        <div className="flex flex-col">
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 relative z-[60]">
            <h3 className="text-xl font-bold text-gray-900">Riwayat Kas SPP</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                name="filter bulan spp"
                aria-label="filter bulan"
                value={filterMonthSpp}
                onChange={(e) => setFilterMonthSpp(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="semua">Semua Waktu</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="bulan_lalu">Bulan Lalu</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={DeleteLongSpp}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100"
                >
                  <span className="hidden md:inline">
                    Bersihkan 1 bulan lalu
                  </span>
                  <span className="md:hidden text-lg">🗑️</span>
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsReportOpen(!isReportOpen)}
                    className={`p-2 rounded-lg border transition flex items-center justify-center ${isReportOpen ? "bg-blue-500 border-blue-200 text-black" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    <EllipsisVertical />
                  </button>
                  {isReportOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <h1 className="text-xs font-bold text-gray-600 uppercase tracking-wider font-sans">
                          Pilih Laporan
                        </h1>
                      </div>
                      <button
                        onClick={() => handleOpenSpreadsheet(UrlReceiveSpp)}
                        className="w-full text-sm text-left px-4 py-3 font-medium text-gray-700  hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 transition-all duration-300"
                      >
                        📄 Pemasukan Dana
                      </button>
                      <button
                        onClick={() => handleOpenSpreadsheet(UrlUsedSpp)}
                        className="w-full text-sm font-medium text-left text-gray-700 px-4 py-3 border-b border-gray-50 transition-all duration-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        📤 Penggunaan Dana
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
                {ShowDataSpp.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  ShowDataSpp.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {new Date(i.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {i.studentName}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {i.sppType} ({i.paymentMonth})
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        Rp {i.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">{i.message}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={i.status} />
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        {i.status.includes("PENDING") && (
                          <button
                            onClick={() => Confirmation(i.id, "SPP")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
                          >
                            ✅ Terima Dana
                          </button>
                        )}
                        <button
                          onClick={() => DeleteSingleSpp(i.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="Hapus Transaksi"
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
