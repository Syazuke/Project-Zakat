"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx"; // TAMBAHAN: Import library Excel

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalDanaZakat, setTotalDanaZakat] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalMuzakki, setTotalMuzakki] = useState(0);
  const [pendingVerifikasi, setPendingVerifikasi] = useState(0);

  // STATE: Untuk menyimpan daftar riwayat transaksi
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);

  // STATE BARU: Untuk efek loading tombol export
  const [isExporting, setIsExporting] = useState(false);

  // ✨ STATE BARU: Untuk filter bulan
  const [filterBulan, setFilterBulan] = useState("semua");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setAdminName(localStorage.getItem("userName") || "Admin");
      fetchDashboardStats();
      fetchRiwayatTransaksi();
    }
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setTotalDanaZakat(data.totalZakat);
        setTotalMuzakki(data.totalMuzakki);
        setPendingVerifikasi(data.pendingVerifikasi);
      }
    } catch (error) {
      console.error("Gagal memuat statistik total uang", error);
    }
  };

  const fetchRiwayatTransaksi = async () => {
    try {
      const response = await fetch("/api/admin/transactions");
      const data = await response.json();
      if (response.ok) {
        setRiwayatTransaksi(data.transactions);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat", error);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI: Untuk Export Data Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/transactions/success");
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      const dataTransaksi = result.data;

      if (!dataTransaksi || dataTransaksi.length === 0) {
        alert("Belum ada data transaksi yang sukses.");
        setIsExporting(false);
        return;
      }

      const dataRapih = dataTransaksi.map((item, index) => ({
        No: index + 1,
        "Nama Muzakki": item.name || "Hamba Allah",
        "Jenis Zakat": item.zakatType,
        "Nominal (Rp)": item.amount,
        "Pesan/Doa": item.message || "-",
        "Tanggal Bayar": new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        Status: item.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataRapih);
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 30 },
        { wch: 15 },
        { wch: 20 },
        { wch: 50 },
        { wch: 25 },
        { wch: 15 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Zakat");

      XLSX.writeFile(workbook, `Laporan_Zakat_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error("Gagal export:", error);
      alert("Gagal mengunduh data Excel. Pastikan API terhubung.");
    } finally {
      setIsExporting(false);
    }
  };

  // ✨ FUNGSI BARU: Hapus 1 Data
  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini selamanya?"))
      return;

    try {
      const response = await fetch(`/api/admin/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Data berhasil dihapus!");
        setRiwayatTransaksi(riwayatTransaksi.filter((trx) => trx.id !== id));
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // ✨ FUNGSI BARU: Hapus Data > 1 Bulan
  const handleDeleteLama = async () => {
    if (
      !window.confirm(
        "PERINGATAN BAHAYA!\nYakin ingin menghapus SEMUA data yang umurnya lebih dari 1 bulan?",
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/transactions/bulk`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Data lama berhasil dibersihkan!");
        fetchRiwayatTransaksi(); // Tarik data ulang
      } else {
        alert("Gagal membersihkan data.");
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

  // ✨ LOGIKA PEMISAH BULAN (Filter)
  const dataTampil = riwayatTransaksi.filter((trx) => {
    if (filterBulan === "semua") return true;

    const trxDate = new Date(trx.createdAt);
    const now = new Date();

    if (filterBulan === "bulan_ini") {
      return (
        trxDate.getMonth() === now.getMonth() &&
        trxDate.getFullYear() === now.getFullYear()
      );
    } else if (filterBulan === "bulan_lalu") {
      return (
        trxDate.getMonth() !== now.getMonth() ||
        trxDate.getFullYear() !== now.getFullYear()
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-emerald-600 font-bold">
        Memuat Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-hidden relative">
      {/* 1. SIDEBAR KIRI */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-emerald-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-800 font-bold text-xl">
              Z
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">AdminPanel</h2>
              <p className="text-xs text-emerald-300">ZakatKu App</p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-emerald-300 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-emerald-700 rounded-lg text-white font-medium transition"
          >
            <span className="text-xl">📊</span> Dashboard
          </a>
          <a
            href="/"
            className="flex items-center justify-center gap-3 p-3 bg-emerald-700 rounded-lg text-white font-medium transition"
          >
            Kembali ke halama awal
          </a>
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition"
          >
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* 2. KONTEN UTAMA */}
      <main className="flex flex-col h-screen overflow-y-auto w-full">
        {/* HEADER ATAS */}
        <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Ringkasan Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{adminName}</p>
              <p className="text-xs text-gray-500">Amil Zakat (Admin)</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-bold">
              Z
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Kartu Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Dana Zakat (Bulan ini)
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                Rp {totalDanaZakat.toLocaleString("id-ID")}
              </h3>
              <p className="text-emerald-600 text-sm mt-2 font-medium">
                Berdasarkan data Midtrans
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Muzakki Aktif
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {totalMuzakki} Orang
              </h3>
              <p className="text-emerald-600 text-sm mt-2 font-medium">
                Bulan ini
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  Menunggu Verifikasi
                </p>
                <h3 className="text-3xl font-bold">
                  {pendingVerifikasi} Transaksi
                </h3>
              </div>
              <button className="mt-4 bg-white text-emerald-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-emerald-50 transition w-fit">
                Cek Sekarang →
              </button>
            </div>
          </div>

          {/* Tabel Transaksi Terbaru */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            {/* ✨ HEADER TABEL & KONTROL PANEL BARU ✨ */}
            <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <h3 className="text-lg font-bold text-gray-900">
                Riwayat Pembayaran Terbaru
              </h3>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* 1. Filter Bulan */}
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-500 bg-white cursor-pointer"
                >
                  <option value="semua">Semua Waktu</option>
                  <option value="bulan_ini">Bulan Ini</option>
                  <option value="bulan_lalu">Bulan Sebelumnya</option>
                </select>

                {/* 2. Tombol Hapus Data Lama */}
                <button
                  onClick={handleDeleteLama}
                  className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 text-sm font-bold transition shadow-sm flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Bersihkan Lama
                </button>

                {/* 3. Tombol Export */}
                <button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center gap-2 text-sm font-bold transition shadow-sm"
                >
                  {isExporting ? (
                    "Menyiapkan File..."
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export (Sukses)
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Nama Muzakki</th>
                    <th className="px-6 py-4">Jenis Zakat</th>
                    <th className="px-6 py-4">Pesan / Doa</th>
                    <th className="px-6 py-4">Nominal</th>
                    <th className="px-6 py-4">Status</th>
                    {/* ✨ KOLOM AKSI BARU ✨ */}
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataTampil.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        Belum ada data transaksi untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    // ✨ ITERASI MENGGUNAKAN dataTampil ✨
                    dataTampil.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {trx.name}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {trx.zakatType}
                        </td>
                        <td
                          className="px-6 py-4 italic text-gray-500 max-w-xs truncate"
                          title={trx.message}
                        >
                          {trx.message || "-"}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          Rp {trx.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              trx.status === "SUCCESS" || trx.status === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : trx.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {trx.status}
                          </span>
                        </td>
                        {/* ✨ TOMBOL HAPUS SATUAN ✨ */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteSingle(trx.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                            title="Hapus Transaksi"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
      </main>
    </div>
  );
}
