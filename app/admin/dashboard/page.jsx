"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ✨ LINK SPREADSHEET (Ganti dengan link Google Sheets Anda)
  const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/1iQLKVV6n_rC7297fcF7adkSfcY-PNYSNdjy-zrfp9r4/edit?usp=sharing";

  // ✨ STATE STATISTIK GABUNGAN ✨
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [detailPendapatan, setDetailPendapatan] = useState({
    zakat: 0,
    spp: 0,
  });
  const [totalOrang, setTotalOrang] = useState(0);
  const [pendingVerifikasi, setPendingVerifikasi] = useState(0);

  // STATE ZAKAT
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [filterBulanZakat, setFilterBulanZakat] = useState("semua");

  // STATE SPP
  const [riwayatSPP, setRiwayatSPP] = useState([]);
  const [filterBulanSPP, setFilterBulanSPP] = useState("semua");

  // STATE TAB
  const [activeTab, setActiveTab] = useState("zakat");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setAdminName(localStorage.getItem("userName") || "Admin");
      fetchDashboardStats();
      fetchRiwayatTransaksi();
      fetchRiwayatSPP();
    }
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (response.ok) {
        setTotalPendapatan(data.totalZakat);
        setTotalOrang(data.totalMuzakki);
        setPendingVerifikasi(data.pendingVerifikasi);
        setDetailPendapatan({
          zakat: data.detailZakat || 0,
          spp: data.detailSPP || 0,
        });
      }
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    }
  };

  const fetchRiwayatTransaksi = async () => {
    try {
      const response = await fetch("/api/admin/transactions");
      const data = await response.json();
      if (response.ok) setRiwayatTransaksi(data.transactions);
    } catch (error) {
      console.error("Gagal memuat riwayat zakat", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRiwayatSPP = async () => {
    try {
      const response = await fetch("/api/admin/spp");
      const data = await response.json();
      if (response.ok) setRiwayatSPP(data.transactions || []);
    } catch (error) {
      console.error("Gagal memuat riwayat SPP", error);
    }
  };

  // ==========================================
  // ✨ FUNGSI BUKA GOOGLE SHEETS
  // ==========================================
  const handleOpenSpreadsheet = () => {
    if (SPREADSHEET_URL === "LINK_GOOGLE_SHEETS_ANDA_DI_SINI") {
      alert("Admin belum memasukkan link Google Sheets di kodingan.");
      return;
    }
    window.open(SPREADSHEET_URL, "_blank"); // Membuka di tab baru
  };

  // ==========================================
  // ✨ FUNGSI HAPUS ZAKAT
  // ==========================================
  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi Zakat ini selamanya?"))
      return;
    try {
      const response = await fetch(`/api/admin/transactions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRiwayatTransaksi(riwayatTransaksi.filter((trx) => trx.id !== id));
        fetchDashboardStats();
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleDeleteLama = async () => {
    if (
      !window.confirm(
        "PERINGATAN!\nYakin ingin menghapus SEMUA data Zakat yang umurnya lebih dari 1 bulan?",
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/transactions/bulk`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchRiwayatTransaksi();
        fetchDashboardStats();
        alert("Data lama berhasil dibersihkan!");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // ==========================================
  // ✨ FUNGSI HAPUS SPP
  // ==========================================
  const handleDeleteSingleSPP = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi SPP ini selamanya?"))
      return;
    try {
      const response = await fetch(`/api/admin/spp/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRiwayatSPP(riwayatSPP.filter((spp) => spp.id !== id));
        fetchDashboardStats();
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleDeleteLamaSPP = async () => {
    if (
      !window.confirm(
        "PERINGATAN!\nYakin ingin menghapus SEMUA data SPP yang umurnya lebih dari 1 bulan?",
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/spp/bulk`, { method: "DELETE" });
      if (response.ok) {
        fetchRiwayatSPP();
        fetchDashboardStats();
        alert("Data SPP lama dibersihkan!");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.clear();
      document.cookie =
        "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");
    }
  };

  // LOGIKA FILTER
  const dataTampilZakat = riwayatTransaksi.filter((trx) => {
    if (filterBulanZakat === "semua") return true;
    const trxDate = new Date(trx.createdAt);
    const now = new Date();
    if (filterBulanZakat === "bulan_ini")
      return (
        trxDate.getMonth() === now.getMonth() &&
        trxDate.getFullYear() === now.getFullYear()
      );
    if (filterBulanZakat === "bulan_lalu")
      return (
        trxDate.getMonth() !== now.getMonth() ||
        trxDate.getFullYear() !== now.getFullYear()
      );
    return true;
  });

  const dataTampilSPP = riwayatSPP.filter((trx) => {
    if (filterBulanSPP === "semua") return true;
    const trxDate = new Date(trx.createdAt);
    const now = new Date();
    if (filterBulanSPP === "bulan_ini")
      return (
        trxDate.getMonth() === now.getMonth() &&
        trxDate.getFullYear() === now.getFullYear()
      );
    if (filterBulanSPP === "bulan_lalu")
      return (
        trxDate.getMonth() !== now.getMonth() ||
        trxDate.getFullYear() !== now.getFullYear()
      );
    return true;
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">
        Memuat Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-hidden relative">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-800 text-white flex flex-col lg:flex hidden`}
      >
        <div className="p-6 border-b border-emerald-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-800 font-bold text-xl">
            Z
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">AdminPanel</h2>
            <p className="text-xs text-emerald-300">ZakatKu & SPP</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-emerald-700 rounded-lg text-white font-medium"
          >
            <span className="text-xl">📊</span> Dashboard
          </a>
        </nav>
        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition"
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex flex-col h-screen overflow-y-auto w-full lg:ml-64">
        <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Utama</h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* ✨ KARTU STATISTIK GABUNGAN ✨ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Pendapatan (Bulan Ini)
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                Rp {totalPendapatan.toLocaleString("id-ID")}
              </h3>
              <p className="text-gray-400 text-xs mt-2 font-medium">
                Zakat:{" "}
                <span className="text-emerald-600 font-bold">
                  Rp {detailPendapatan.zakat.toLocaleString("id-ID")}
                </span>{" "}
                | SPP:{" "}
                <span className="text-blue-600 font-bold">
                  Rp {detailPendapatan.spp.toLocaleString("id-ID")}
                </span>
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Pembayar Aktif
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {totalOrang} Orang
              </h3>
              <p className="text-emerald-600 text-sm mt-2 font-medium">
                Gabungan Muzakki & Siswa
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  Menunggu Verifikasi (Pending)
                </p>
                <h3 className="text-3xl font-bold">
                  {pendingVerifikasi} Transaksi
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            {/* MENU TAB */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("zakat")}
                className={`flex-1 py-4 text-sm font-bold transition ${
                  activeTab === "zakat"
                    ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600"
                }`}
              >
                Data Pembayaran Zakat
              </button>
              <button
                onClick={() => setActiveTab("spp")}
                className={`flex-1 py-4 text-sm font-bold transition ${
                  activeTab === "spp"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                Data Pembayaran SPP
              </button>
            </div>

            {/* TAB ZAKAT */}
            {activeTab === "zakat" && (
              <div>
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Riwayat Zakat
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <select
                      value={filterBulanZakat}
                      onChange={(e) => setFilterBulanZakat(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="semua">Semua Waktu</option>
                      <option value="bulan_ini">Bulan Ini</option>
                      <option value="bulan_lalu">Bulan Sebelumnya</option>
                    </select>
                    <button
                      onClick={handleDeleteLama}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100"
                    >
                      Bersihkan Lama
                    </button>
                    {/* ✨ TOMBOL GOOGLE SHEETS BARU ✨ */}
                    <button
                      onClick={handleOpenSpreadsheet}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                    >
                      📄 Buka Laporan Live
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-emerald-50 text-emerald-800 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Nama Muzakki</th>
                        <th className="px-6 py-4">Jenis Zakat</th>
                        <th className="px-6 py-4">Nominal</th>
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
                            Belum ada data zakat.
                          </td>
                        </tr>
                      ) : (
                        dataTampilZakat.map((trx) => (
                          <tr
                            key={trx.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4">
                              {new Date(trx.createdAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {trx.name}
                            </td>
                            <td className="px-6 py-4 capitalize">
                              zakat {trx.zakatType}
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-600">
                              Rp {trx.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold ${trx.status === "SUCCESS" || trx.status === "PAID" ? "bg-emerald-100 text-emerald-700" : trx.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                              >
                                {trx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteSingle(trx.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full"
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

            {/* TAB SPP */}
            {activeTab === "spp" && (
              <div>
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Riwayat Pembayaran SPP
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <select
                      value={filterBulanSPP}
                      onChange={(e) => setFilterBulanSPP(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="semua">Semua Waktu</option>
                      <option value="bulan_ini">Bulan Ini</option>
                      <option value="bulan_lalu">Bulan Sebelumnya</option>
                    </select>
                    <button
                      onClick={handleDeleteLamaSPP}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100"
                    >
                      Bersihkan Lama
                    </button>
                    {/* ✨ TOMBOL GOOGLE SHEETS BARU ✨ */}
                    <button
                      onClick={handleOpenSpreadsheet}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                    >
                      📄 Buka Laporan Live
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-blue-50 text-blue-800 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Tanggal Bayar</th>
                        <th className="px-6 py-4">Nama Siswa</th>
                        <th className="px-6 py-4">Jenis Tagihan</th>
                        <th className="px-6 py-4">Bulan Tagihan</th>
                        <th className="px-6 py-4">Nominal</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dataTampilSPP.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-400"
                          >
                            Belum ada data SPP saat ini.
                          </td>
                        </tr>
                      ) : (
                        dataTampilSPP.map((spp) => (
                          <tr
                            key={spp.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(spp.createdAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {spp.studentName}
                            </td>
                            <td className="px-6 py-4 capitalize">
                              {spp.sppType}
                            </td>
                            <td className="px-6 py-4 font-bold">
                              {spp.paymentMonth}
                            </td>
                            <td className="px-6 py-4 font-bold text-blue-600">
                              Rp {spp.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold ${spp.status === "SUCCESS" || spp.status === "PAID" ? "bg-blue-100 text-blue-700" : spp.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                              >
                                {spp.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteSingleSPP(spp.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full"
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
        </div>
      </main>
    </div>
  );
}
