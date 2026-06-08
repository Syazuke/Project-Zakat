import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function useDashboardLogic() {
  const SPREADSHEET_URL_ZAKAT =
    "https://docs.google.com/spreadsheets/d/1iQLKVV6n_rC7297fcF7adkSfcY-PNYSNdjy-zrfp9r4/edit?usp=sharing";
  const SPREADSHEET_URL_Penyaluran_ZAKAT =
    "https://docs.google.com/spreadsheets/d/1q0Inp0UdRk_aQbQqa0Hj7bRE52crtFKEGcxQljcHGyU/edit?usp=sharing";
  const SPREADSHEET_URL_INFAQ =
    "https://docs.google.com/spreadsheets/d/1y68xX4MeYvfASl_w0lQLphpXGFQORE0VYikw2cIyIA0/edit?usp=sharing";
  const SPREADSHEET_URL_Penyaluran_INFAQ = "";
  const SPREADSHEET_URL_SPP =
    "https://docs.google.com/spreadsheets/d/16jwSK4uiDIPqTKcEElfzfwZj-RXJ2Y2dYjyYvPRWNhI/edit?usp=sharing";

  const SPREADSHEET_URL_Penggunaan_SPP =
    "https://docs.google.com/spreadsheets/d/15UptL0nXC3c-BPoMH4QoWxSebbFfHVDAb3C6ghzwEiA/edit?usp=sharing";
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saldoZakat, setSaldoZakat] = useState({
    kotor: 0,
    ditarik: 0,
    bersih: 0,
  });
  const [saldoSPP, setSaldoSPP] = useState({ kotor: 0, ditarik: 0, bersih: 0 });
  const [riwayatZakat, setRiwayatZakat] = useState([]);
  const [filterBulanZakat, setFilterBulanZakat] = useState("semua");
  const [riwayatSPP, setRiwayatSPP] = useState([]);
  const [filterBulanSPP, setFilterBulanSPP] = useState("semua");
  const [riwayatPenyaluran, setRiwayatPenyaluran] = useState([]);
  const [activeTab, setActiveTab] = useState("zakat");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    source: "ZAKAT",
    note: "",
  });

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    type: "",
    id: null,
    extraData: null,
    message: "",
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
      fetchRiwayatPenyaluran();
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
      }
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    }
  };

  const fetchRiwayatTransaksi = async () => {
    try {
      const response = await fetch("/api/admin/transactions");
      const data = await response.json();
      if (response.ok) setRiwayatZakat(data.transactions || data.zakat || []);
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
      toast.error("Admin belum memasukkan link Google Sheets di kodingan.");
      return;
    }
    window.open(url, "_blank");
  };

  const triggerWithdraw = (e) => {
    e.preventDefault();
    const nominalTarik = Number(withdrawForm.amount.replace(/\D/g, ""));
    if (nominalTarik <= 0) return toast.error("Masukkan nominal yang valid!");

    setConfirmConfig({
      isOpen: true,
      type: "WITHDRAW",
      id: null,
      extraData: nominalTarik,
      message: `Yakin ingin mencatat penarikan Rp ${nominalTarik.toLocaleString("id-ID")} dari kas ${withdrawForm.source}?`,
    });
  };

  const triggerKonfirmasi = (id, type) => {
    setConfirmConfig({
      isOpen: true,
      type: "KONFIRMASI",
      id: id,
      extraData: type,
      message:
        "Apakah uang sudah masuk ke rekening/admin dan ingin mengesahkan transaksi ini menjadi LUNAS?",
    });
  };

  const triggerLogout = () => {
    setConfirmConfig({
      isOpen: true,
      type: "LOGOUT",
      id: null,
      message: "Apakah Anda yakin ingin keluar dari halaman dashboard?",
    });
  };

  const triggerDeletePenyaluran = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: "PENYALURAN",
      id: id,
      message:
        "Yakin ingin menghapus riwayat penyaluran ini? Saldo utama akan otomatis bertambah kembali.",
    });
  };

  const triggerDeleteSingleZakat = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: "ZAKAT_SINGLE",
      id: id,
      message:
        "Yakin ingin menghapus transaksi Zakat ini? Tindakan ini tidak dapat dibatalkan.",
    });
  };

  const triggerDeleteLamaZakat = () => {
    setConfirmConfig({
      isOpen: true,
      type: "ZAKAT_LAMA",
      id: null,
      message:
        "PERINGATAN!\nYakin ingin menghapus data Zakat lebih dari 1 bulan?",
    });
  };

  const triggerDeleteSingleSPP = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: "SPP_SINGLE",
      id: id,
      message:
        "Yakin ingin menghapus transaksi SPP ini? Tindakan ini tidak dapat dibatalkan.",
    });
  };

  const triggerDeleteLamaSPP = () => {
    setConfirmConfig({
      isOpen: true,
      type: "SPP_LAMA",
      id: null,
      message:
        "PERINGATAN!\nYakin ingin menghapus data SPP lebih dari 1 bulan?",
    });
  };

  const executeConfirm = async () => {
    const { type, id, extraData } = confirmConfig;
    setIsExecuting(true);
    if (type === "LOGOUT") {
      localStorage.clear();
      document.cookie =
        "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");
      setIsExecuting(false);
      return;
    }

    if (type === "WITHDRAW") {
      setIsWithdrawing(true);
      try {
        const res = await fetch("/api/admin/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: extraData,
            source: withdrawForm.source,
            note: withdrawForm.note,
          }),
        });

        if (res.ok) {
          toast.success("Pencatatan penarikan berhasil disimpan!");
          setIsWithdrawModalOpen(false);
          setWithdrawForm({ amount: "", source: "ZAKAT", note: "" });
          fetchDashboardStats();
          fetchRiwayatPenyaluran();
        } else {
          toast.error("Gagal mencatat penarikan.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan jaringan saat menarik dana.");
      } finally {
        setIsWithdrawing(false);
        setIsExecuting(false);
        setConfirmConfig({
          isOpen: false,
          type: "",
          id: null,
          extraData: null,
          message: "",
        });
      }
      return;
    }

    if (type === "KONFIRMASI") {
      try {
        const res = await fetch("/api/admin/transactions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id, type: extraData }),
        });

        if (res.ok) {
          toast.success("Transaksi berhasil disahkan menjadi LUNAS!");
          if (extraData === "SPP") fetchRiwayatSPP();
          else fetchRiwayatTransaksi();
          fetchDashboardStats();
        } else {
          toast.error("Gagal mengonfirmasi transaksi.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan sistem saat konfirmasi.");
      } finally {
        setIsExecuting(false);
        setConfirmConfig({
          isOpen: false,
          type: "",
          id: null,
          extraData: null,
          message: "",
        });
      }
      return;
    }

    try {
      if (type === "PENYALURAN") {
        const res = await fetch("/api/admin/withdraw", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          toast.success("Riwayat penyaluran berhasil dihapus!");
          setRiwayatPenyaluran(
            riwayatPenyaluran.filter((item) => item.id !== id),
          );
          fetchDashboardStats();
        }
      } else if (type === "ZAKAT_SINGLE") {
        const res = await fetch(`/api/admin/transactions/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setRiwayatZakat(riwayatZakat.filter((trx) => trx.id !== id));
          fetchDashboardStats();
          toast.success("Data berhasil dihapus!");
        }
      } else if (type === "ZAKAT_LAMA") {
        const res = await fetch(`/api/admin/transactions/bulk`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchRiwayatTransaksi();
          fetchDashboardStats();
          toast.success("Data lama berhasil dibersihkan!");
        }
      } else if (type === "SPP_SINGLE") {
        const res = await fetch(`/api/admin/spp/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setRiwayatSPP(riwayatSPP.filter((spp) => spp.id !== id));
          fetchDashboardStats();
          toast.success("Data SPP berhasil dihapus!");
        }
      } else if (type === "SPP_LAMA") {
        const res = await fetch(`/api/admin/spp/bulk`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchRiwayatSPP();
          fetchDashboardStats();
          toast.success("Data SPP lama berhasil dibersihkan!");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan saat menghapus data.");
    } finally {
      setIsExecuting(false);
      setConfirmConfig({
        isOpen: false,
        type: "",
        id: null,
        extraData: null,
        message: "",
      });
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

  const dataTampilZakat = filterData(riwayatZakat, filterBulanZakat);
  const dataTampilSPP = filterData(riwayatSPP, filterBulanSPP);

  return {
    dataTampilSPP,
    dataTampilZakat,
    filterData,
    executeConfirm,
    triggerDeleteLamaSPP,
    triggerDeleteSingleSPP,
    triggerDeleteLamaZakat,
    triggerDeleteSingleZakat,
    triggerDeletePenyaluran,
    triggerLogout,
    triggerKonfirmasi,
    triggerWithdraw,
    handleOpenSpreadsheet,
    fetchRiwayatPenyaluran,
    fetchDashboardStats,
    fetchRiwayatSPP,
    fetchRiwayatTransaksi,
    adminName,
    isLoading,
    setIsLoading,
    confirmConfig,
    setConfirmConfig,
    saldoSPP,
    saldoZakat,
    riwayatZakat,
    filterBulanSPP,
    setFilterBulanSPP,
    filterBulanZakat,
    setFilterBulanZakat,
    riwayatSPP,
    riwayatPenyaluran,
    activeTab,
    setActiveTab,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    withdrawForm,
    setWithdrawForm,
    isWithdrawing,
    isExecuting,
    SPREADSHEET_URL_INFAQ,
    SPREADSHEET_URL_Penyaluran_INFAQ,
    SPREADSHEET_URL_ZAKAT,
    SPREADSHEET_URL_Penyaluran_ZAKAT,
    SPREADSHEET_URL_SPP,
    SPREADSHEET_URL_Penggunaan_SPP,
  };
}
