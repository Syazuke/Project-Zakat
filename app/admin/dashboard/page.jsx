"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // ✨ LINK SPREADSHEET (GANTI DENGAN LINK ANDA)
  // ==========================================
  const SPREADSHEET_URL_ZAKAT =
    "https://docs.google.com/spreadsheets/d/1iQLKVV6n_rC7297fcF7adkSfcY-PNYSNdjy-zrfp9r4/edit?usp=sharing";
  const SPREADSHEET_URL_SPP =
    "https://docs.google.com/spreadsheets/d/16jwSK4uiDIPqTKcEElfzfwZj-RXJ2Y2dYjyYvPRWNhI/edit?usp=sharing";

  // ==========================================
  // ✨ STATE STATISTIK
  // ==========================================
  const [totalSaldoBersih, setTotalSaldoBersih] = useState(0); // Uang yang tersisa
  const [totalKotor, setTotalKotor] = useState(0); // Semua uang yang pernah masuk
  const [totalDitarik, setTotalDitarik] = useState(0); // Semua uang yang sudah ditarik
  const [detailPendapatan, setDetailPendapatan] = useState({
    zakat: 0,
    spp: 0,
  });
  const [totalOrang, setTotalOrang] = useState(0);
  const [pendingVerifikasi, setPendingVerifikasi] = useState(0);

  // ==========================================
  // ✨ STATE TRANSAKSI & TAB
  // ==========================================
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [filterBulanZakat, setFilterBulanZakat] = useState("semua");
  const [riwayatSPP, setRiwayatSPP] = useState([]);
  const [filterBulanSPP, setFilterBulanSPP] = useState("semua");
  const [activeTab, setActiveTab] = useState("zakat");

  // ==========================================
  // ✨ STATE MODAL TARIK DANA
  // ==========================================
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    source: "ZAKAT",
    note: "",
  });

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

  // --- FETCH DATA FUNCTIONS ---
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (response.ok) {
        setTotalSaldoBersih(data.totalZakat || 0); // Di backend sudah diubah jadi saldo bersih
        setTotalKotor(data.totalKotor || 0);
        setTotalDitarik(data.totalDitarik || 0);
        setTotalOrang(data.totalMuzakki || 0);
        setPendingVerifikasi(data.pendingVerifikasi || 0);
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
      console.error("Gagal memuat riwayat zakat");
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
      console.error("Gagal memuat riwayat SPP");
    }
  };

  // --- ACTION FUNCTIONS ---
  const handleOpenSpreadsheet = (url) => {
    if (url.includes("LINK_SPREADSHEET")) {
      alert("Admin belum memasukkan link Google Sheets di kodingan.");
      return;
    }
    window.open(url, "_blank");
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const nominalTarik = Number(withdrawForm.amount.replace(/\D/g, ""));

    if (nominalTarik <= 0) return alert("Masukkan nominal yang valid!");
    if (
      !window.confirm(
        `Yakin ingin mencatat penarikan Rp ${nominalTarik.toLocaleString("id-ID")} dari kas ${withdrawForm.source}?`,
      )
    )
      return;

    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/admin/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: nominalTarik,
          source: withdrawForm.source,
          note: withdrawForm.note,
          adminName: adminName,
        }),
      });

      if (res.ok) {
        alert("Pencatatan penarikan berhasil disimpan!");
        setIsWithdrawModalOpen(false);
        setWithdrawForm({ amount: "", source: "ZAKAT", note: "" });
        fetchDashboardStats(); // Refresh saldo
      } else {
        alert("Gagal mencatat penarikan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat menarik dana.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // --- DELETE FUNCTIONS ---
  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi Zakat ini?")) return;
    try {
      const response = await fetch(`/api/admin/transactions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRiwayatTransaksi(riwayatTransaksi.filter((trx) => trx.id !== id));
        fetchDashboardStats();
      }
    } catch (error) {}
  };

  const handleDeleteLama = async () => {
    if (
      !window.confirm(
        "PERINGATAN!\nYakin ingin menghapus data Zakat lebih dari 1 bulan?",
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
        alert("Data dibersihkan!");
      }
    } catch (error) {}
  };

  const handleDeleteSingleSPP = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi SPP ini?")) return;
    try {
      const response = await fetch(`/api/admin/spp/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRiwayatSPP(riwayatSPP.filter((spp) => spp.id !== id));
        fetchDashboardStats();
      }
    } catch (error) {}
  };

  const handleDeleteLamaSPP = async () => {
    if (
      !window.confirm(
        "PERINGATAN!\nYakin ingin menghapus data SPP lebih dari 1 bulan?",
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/spp/bulk`, { method: "DELETE" });
      if (response.ok) {
        fetchRiwayatSPP();
        fetchDashboardStats();
        alert("Data dibersihkan!");
      }
    } catch (error) {}
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.clear();
      document.cookie =
        "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");
    }
  };

  // --- FILTER LOGIC ---
  const filterData = (data, filterStatus) => {
    return data.filter((trx) => {
      if (filterStatus === "semua") return true;
      const trxDate = new Date(trx.createdAt);
      const now = new Date();
      if (filterStatus === "bulan_ini")
        return (
          trxDate.getMonth() === now.getMonth() &&
          trxDate.getFullYear() === now.getFullYear()
        );
      if (filterStatus === "bulan_lalu")
        return (
          trxDate.getMonth() !== now.getMonth() ||
          trxDate.getFullYear() !== now.getFullYear()
        );
      return true;
    });
  };

  const dataTampilZakat = filterData(riwayatTransaksi, filterBulanZakat);
  const dataTampilSPP = filterData(riwayatSPP, filterBulanSPP);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">
        Memuat Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-hidden relative">
      {/* --- POPUP MODAL TARIK DANA --- */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">
                💸 Tarik Dana Ke Rekening
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-gray-400 hover:text-red-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumber Kas
                </label>
                <select
                  value={withdrawForm.source}
                  onChange={(e) =>
                    setWithdrawForm({ ...withdrawForm, source: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ZAKAT">Kas Zakat</option>
                  <option value="SPP">Kas SPP / Operasional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1000000"
                  value={withdrawForm.amount}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    setWithdrawForm({
                      ...withdrawForm,
                      amount: val ? Number(val).toLocaleString("id-ID") : "",
                    });
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan / Keperluan
                </label>
                <textarea
                  placeholder="Misal: Ditarik ke rekening BCA Yayasan"
                  value={withdrawForm.note}
                  onChange={(e) =>
                    setWithdrawForm({ ...withdrawForm, note: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  rows="2"
                />
              </div>
              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
              >
                {isWithdrawing ? "Mencatat..." : "Catat Penarikan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-800 text-white flex-col lg:flex hidden`}
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
        <div className="p-4 border-t border-emerald-700 space-y-2">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-bold transition"
          >
            💸 Tarik Dana
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold transition"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex flex-col h-screen overflow-y-auto w-full lg:ml-64">
        <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Utama</h1>
          <div className="flex items-center gap-4">
            {/* Tombol Tarik Dana untuk Mobile */}
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="lg:hidden bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
            >
              💸 Tarik
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* ✨ KARTU STATISTIK ✨ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Kartu Saldo Bersih */}
            <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-md border border-emerald-700 flex flex-col col-span-1 md:col-span-2">
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Total Saldo Bersih Saat Ini
              </p>
              <h3 className="text-4xl font-bold">
                Rp {totalSaldoBersih.toLocaleString("id-ID")}
              </h3>
              <p className="text-emerald-200 text-xs mt-3 font-medium">
                Pemasukan: Rp {totalKotor.toLocaleString("id-ID")} | Ditarik: Rp{" "}
                {totalDitarik.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Kartu Rincian Kas */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">
                Pemasukan Kotor
              </p>
              <p className="text-sm text-gray-700 mb-1">
                Kas Zakat:{" "}
                <span className="font-bold text-emerald-600 ml-1">
                  Rp {detailPendapatan.zakat.toLocaleString("id-ID")}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Kas SPP:{" "}
                <span className="font-bold text-blue-600 ml-1">
                  Rp {detailPendapatan.spp.toLocaleString("id-ID")}
                </span>
              </p>
            </div>

            {/* Kartu Pending */}
            <div className="bg-orange-50 p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-center">
              <p className="text-orange-800 text-sm font-bold mb-1">
                Menunggu Verifikasi
              </p>
              <h3 className="text-3xl font-bold text-orange-600">
                {pendingVerifikasi} TRX
              </h3>
              <p className="text-orange-600/70 text-xs mt-1 font-medium">
                {totalOrang} Pembayar Aktif
              </p>
            </div>
          </div>

          {/* TAB TRANSAKSI */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("zakat")}
                className={`flex-1 py-4 text-sm font-bold transition ${activeTab === "zakat" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600"}`}
              >
                Data Kas Zakat
              </button>
              <button
                onClick={() => setActiveTab("spp")}
                className={`flex-1 py-4 text-sm font-bold transition ${activeTab === "spp" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"}`}
              >
                Data Kas SPP / Operasional
              </button>
            </div>

            {/* KONTEN TAB ZAKAT */}
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
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="semua">Semua Waktu</option>
                      <option value="bulan_ini">Bulan Ini</option>
                      <option value="bulan_lalu">Bulan Lalu</option>
                    </select>
                    <button
                      onClick={handleDeleteLama}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100"
                    >
                      Bersihkan Lama
                    </button>
                    <button
                      onClick={() =>
                        handleOpenSpreadsheet(SPREADSHEET_URL_ZAKAT)
                      }
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                    >
                      📄 Buka Spreadsheet Zakat
                    </button>
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
                              Zakat {trx.zakatType}
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

            {/* KONTEN TAB SPP */}
            {activeTab === "spp" && (
              <div>
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Riwayat Kas SPP
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <select
                      value={filterBulanSPP}
                      onChange={(e) => setFilterBulanSPP(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="semua">Semua Waktu</option>
                      <option value="bulan_ini">Bulan Ini</option>
                      <option value="bulan_lalu">Bulan Lalu</option>
                    </select>
                    <button
                      onClick={handleDeleteLamaSPP}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100"
                    >
                      Bersihkan Lama
                    </button>
                    <button
                      onClick={() => handleOpenSpreadsheet(SPREADSHEET_URL_SPP)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                    >
                      📄 Buka Spreadsheet SPP
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
                          <tr
                            key={spp.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4">
                              {new Date(spp.createdAt).toLocaleDateString(
                                "id-ID",
                              )}
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
        </div>
      </main>
    </div>
  );
}
