"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TarikDana from "@/app/components/atoms/TarikDana";
import Sidebar from "@/app/components/atoms/Sidebar";
import NavDashboard from "@/app/components/atoms/NavDashboard";
import Card from "@/app/components/atoms/Card";
import TableZakat from "@/app/components/atoms/TableZakat";
import TableSPP from "@/app/components/atoms/TableSPP";
// ✨ IMPORT KOMPONEN BARU
import TablePenyaluran from "@/app/components/atoms/TablePenyaluran";

export default function AdminDashboard() {
  const SPREADSHEET_URL_ZAKAT =
    "https://docs.google.com/spreadsheets/d/1iQLKVV6n_rC7297fcF7adkSfcY-PNYSNdjy-zrfp9r4/edit?usp=sharing";
  const SPREADSHEET_URL_SPP =
    "https://docs.google.com/spreadsheets/d/16jwSK4uiDIPqTKcEElfzfwZj-RXJ2Y2dYjyYvPRWNhI/edit?usp=sharing";
  const SPREADSHEET_URL_INFAQ =
    "https://docs.google.com/spreadsheets/d/1y68xX4MeYvfASl_w0lQLphpXGFQORE0VYikw2cIyIA0/edit?usp=sharing";

  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [saldoZakat, setSaldoZakat] = useState({
    kotor: 0,
    ditarik: 0,
    bersih: 0,
  });
  const [saldoSPP, setSaldoSPP] = useState({ kotor: 0, ditarik: 0, bersih: 0 });

  const [totalOrang, setTotalOrang] = useState(0);
  const [pendingVerifikasi, setPendingVerifikasi] = useState(0);

  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [filterBulanZakat, setFilterBulanZakat] = useState("semua");
  const [riwayatSPP, setRiwayatSPP] = useState([]);
  const [filterBulanSPP, setFilterBulanSPP] = useState("semua");

  // ✨ STATE BARU UNTUK PENYALURAN DANA
  const [riwayatPenyaluran, setRiwayatPenyaluran] = useState([]);

  const [activeTab, setActiveTab] = useState("zakat");

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
      fetchRiwayatPenyaluran(); // ✨ PANGGIL API PENYALURAN SAAT LOAD
    }
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (response.ok) {
        const zakatMasuk = data.detailZakat || 0;
        const zakatKeluar = data.zakatDitarik || 0;

        const sppMasuk = data.detailSPP || 0;
        const sppKeluar = data.sppDitarik || 0;

        setSaldoZakat({
          kotor: zakatMasuk,
          ditarik: zakatKeluar,
          bersih: zakatMasuk - zakatKeluar,
        });

        setSaldoSPP({
          kotor: sppMasuk,
          ditarik: sppKeluar,
          bersih: sppMasuk - sppKeluar,
        });

        setTotalOrang(data.totalMuzakki || 0);
        setPendingVerifikasi(data.pendingVerifikasi || 0);
      }
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    }
  };

  const fetchRiwayatTransaksi = async () => {
    try {
      const response = await fetch("/api/admin/transactions");
      const data = await response.json();
      if (response.ok)
        setRiwayatTransaksi(data.transactions || data.zakat || []);
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

  // ✨ FUNGSI BARU UNTUK FETCH PENYALURAN
  const fetchRiwayatPenyaluran = async () => {
    try {
      const response = await fetch("/api/admin/withdraw");
      const data = await response.json();
      if (response.ok) setRiwayatPenyaluran(data);
    } catch (error) {
      console.error("Gagal memuat riwayat penyaluran");
    }
  };

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
        fetchDashboardStats();
        fetchRiwayatPenyaluran(); // ✨ REFRESH TABEL PENYALURAN
      } else {
        alert("Gagal mencatat penarikan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat menarik dana.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ✨ FUNGSI BARU UNTUK MENGHAPUS PENYALURAN (JIKA SALAH INPUT)
  const handleDeletePenyaluran = async (id) => {
    if (
      !window.confirm(
        "Yakin ingin menghapus riwayat penyaluran ini? Saldo utama akan otomatis bertambah kembali.",
      )
    )
      return;
    try {
      const response = await fetch("/api/admin/withdraw", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        alert("Riwayat penyaluran berhasil dihapus!");
        setRiwayatPenyaluran(
          riwayatPenyaluran.filter((item) => item.id !== id),
        );
        fetchDashboardStats(); // ✨ REFRESH SALDO CARD
      }
    } catch (error) {
      alert("Gagal menghapus riwayat.");
    }
  };

  const handleKonfirmasi = async (id, type) => {
    const confirm = window.confirm(
      "Apakah uang tunai sudah Anda terima dan ingin mengesahkan transaksi ini menjadi LUNAS?",
    );
    if (!confirm) return;

    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      if (response.ok) {
        alert("✅ Transaksi berhasil disahkan menjadi LUNAS!");
        if (type === "SPP") fetchRiwayatSPP();
        if (type === "ZAKAT") fetchRiwayatTransaksi();
        fetchDashboardStats();
      } else {
        alert("❌ Gagal mengonfirmasi transaksi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat konfirmasi.");
    }
  };

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

  const filterData = (data, filterStatus) => {
    if (!Array.isArray(data)) return [];
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

  const StatusBadge = ({ status }) => {
    if (
      status === "settlement" ||
      status === "capture" ||
      status === "SUCCESS" ||
      status === "PAID"
    ) {
      return (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
          LUNAS
        </span>
      );
    }
    if (status === "PENDING_TUNAI") {
      return (
        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold animate-pulse">
          ⏳ TUNGGU TUNAI
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
          PENDING (VA)
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
        {status}
      </span>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">
        Memuat Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-hidden relative">
      <TarikDana
        isWithdrawModalOpen={isWithdrawModalOpen}
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        handleWithdraw={handleWithdraw}
        withdrawForm={withdrawForm}
        setWithdrawForm={setWithdrawForm}
        isWithdrawing={isWithdrawing}
      />

      <Sidebar
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        handleLogout={handleLogout}
      />

      <main className="flex flex-col h-screen overflow-y-auto w-full lg:ml-64">
        <NavDashboard
          setIsWithdrawModalOpen={setIsWithdrawModalOpen}
          adminName={adminName}
        />

        <div className="p-4 md:p-6 space-y-6">
          <Card
            saldoSPP={saldoSPP}
            saldoZakat={saldoZakat}
            totalOrang={totalOrang}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            {/* ✨ MENU TAB BARU */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab("zakat")}
                className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap ${activeTab === "zakat" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600"}`}
              >
                Data Kas Zakat
              </button>
              <button
                onClick={() => setActiveTab("spp")}
                className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap ${activeTab === "spp" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"}`}
              >
                Data Kas SPP / Operasional
              </button>
              <button
                onClick={() => setActiveTab("penyaluran")}
                className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap ${activeTab === "penyaluran" ? "bg-red-50 text-red-700 border-b-2 border-red-600" : "text-gray-500 hover:bg-gray-50 hover:text-red-600"}`}
              >
                Riwayat Penyaluran Dana
              </button>
            </div>

            {/* KONTEN TAB ZAKAT */}
            {activeTab === "zakat" && (
              <TableZakat
                filterBulanZakat={filterBulanZakat}
                setFilterBulanZakat={setFilterBulanZakat}
                handleDeleteLama={handleDeleteLama}
                handleOpenSpreadsheet={handleOpenSpreadsheet}
                handleDeleteSingle={handleDeleteSingle}
                activeTab={activeTab}
                dataTampilZakat={dataTampilZakat}
                StatusBadge={StatusBadge}
                SPREADSHEET_URL_ZAKAT={SPREADSHEET_URL_ZAKAT}
                handleKonfirmasi={handleKonfirmasi}
                SPREADSHEET_URL_INFAQ={SPREADSHEET_URL_INFAQ}
              />
            )}

            {/* KONTEN TAB SPP */}
            {activeTab === "spp" && (
              <TableSPP
                activeTab={activeTab}
                filterBulanSPP={filterBulanSPP}
                setFilterBulanSPP={setFilterBulanSPP}
                handleDeleteLamaSPP={handleDeleteLamaSPP}
                handleOpenSpreadsheet={handleOpenSpreadsheet}
                handleDeleteSingleSPP={handleDeleteSingleSPP}
                dataTampilSPP={dataTampilSPP}
                StatusBadge={StatusBadge}
                SPREADSHEET_URL_SPP={SPREADSHEET_URL_SPP}
                handleKonfirmasi={handleKonfirmasi}
              />
            )}

            {activeTab === "penyaluran" && (
              <TablePenyaluran
                riwayat={riwayatPenyaluran}
                handleDelete={handleDeletePenyaluran}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
