"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalDanaZakat, setTotalDanaZakat] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalMuzakki, setTotalMuzakki] = useState(0);
  const [pendingVerifikasi, setPendingVerifikasi] = useState(0);

  // STATE BARU: Untuk menyimpan daftar riwayat transaksi
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);

  useEffect(() => {
    // ... (Logika pengecekan login Anda tetap sama) ...
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setAdminName(localStorage.getItem("userName") || "Admin");
      fetchDashboardStats();
      fetchRiwayatTransaksi(); // Panggil fungsi baru
    }
  }, [router]);

  // Fungsi untuk ambil total uang (Tetap sama)
  // Fungsi untuk ambil total uang
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setTotalDanaZakat(data.totalZakat);
        // Tangkap dua data baru ini:
        setTotalMuzakki(data.totalMuzakki);
        setPendingVerifikasi(data.pendingVerifikasi);
      }
    } catch (error) {
      console.error("Gagal memuat statistik total uang", error);
    }
  };

  // FUNGSI BARU: Ambil Daftar Transaksi
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

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.clear();
      document.cookie =
        "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");
    }
  };

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
          onClick={() => setIsSidebarOpen(false)} // Tutup sidebar jika area gelap diklik
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

          {/* Tombol X (Tutup) khusus di HP */}
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
          {/* Tambahkan menu lain di sini nanti */}
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
      <main className="flex flex-col h-screen overflow-y-auto">
        {/* HEADER ATAS */}
        <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            >
              {/* Ikon Garis Tiga (SVG) */}
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

              {/* UBAH BAGIAN INI MENJADI DINAMIS */}
              <h3 className="text-3xl font-bold text-gray-900">
                Rp {totalDanaZakat.toLocaleString("id-ID")}
              </h3>

              <p className="text-emerald-600 text-sm mt-2 font-medium">
                Berdasarkan data Midtrans
              </p>
            </div>

            {/* Kartu 2: Total Muzakki Aktif */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Muzakki Aktif
              </p>
              {/* 👇 Angka dinamis */}
              <h3 className="text-3xl font-bold text-gray-900">
                {totalMuzakki} Orang
              </h3>
              <p className="text-emerald-600 text-sm mt-2 font-medium">
                Bulan ini
              </p>
            </div>

            {/* Kartu 3: Menunggu Verifikasi */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  Menunggu Verifikasi
                </p>
                {/* 👇 Angka dinamis */}
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
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Riwayat Pembayaran Terbaru
              </h3>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {riwayatTransaksi.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        Belum ada data transaksi.
                      </td>
                    </tr>
                  ) : (
                    riwayatTransaksi.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-50 transition">
                        {/* Kolom Tanggal */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Kolom Nama */}
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {trx.name}
                        </td>

                        {/* Kolom Jenis Zakat */}
                        <td className="px-6 py-4 capitalize">
                          {trx.zakatType}
                        </td>

                        {/* Kolom Pesan (Bisa panjang, jadi kita buat italic) */}
                        <td
                          className="px-6 py-4 italic text-gray-500 max-w-xs truncate"
                          title={trx.message}
                        >
                          {trx.message || "-"}
                        </td>

                        {/* Kolom Nominal */}
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          Rp {trx.amount.toLocaleString("id-ID")}
                        </td>

                        {/* Kolom Status (Badge Warna) */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              trx.status === "SUCCESS"
                                ? "bg-emerald-100 text-emerald-700"
                                : trx.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {trx.status}
                          </span>
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
