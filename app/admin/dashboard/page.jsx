"use client";

import Card from "@/app/components/atoms/Card";
import NavDashboard from "@/app/components/atoms/NavDashboard";
import useDashboardLogic from "@/app/hooks/useDashboardLogic";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import TableZakat from "@/app/components/atoms/TableZakat";
const TableSPP = dynamic(() => import("@/app/components/atoms/TableSPP"), {
  ssr: false,
  loading: () => (
    <div className="text-center font-bold text-blue-600 animate-pulse">
      Memuat table Sekolah
    </div>
  ),
});
const TablePenyaluran = dynamic(
  () => import("@/app/components/atoms/TablePenyaluran"),
  {
    ssr: false,
    loading: () => (
      <div className="text-center font-bold text-red-600 animate-pulse">
        Memuat Table Penyaluran
      </div>
    ),
  },
);
const ModalConfirm = dynamic(
  () => import("@/app/components/atoms/ModalConfirm"),
  { ssr: false },
);
const TarikDana = dynamic(() => import("@/app/components/atoms/TarikDana"), {
  ssr: false,
});
const StatusBadge = ({ status }) => {
  if (
    status === "settlement" ||
    status === "capture" ||
    status === "SUCCESS" ||
    status === "PAID"
  ) {
    return (
      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold shadow-sm">
        LUNAS
      </span>
    );
  }
  if (status === "PENDING_TUNAI") {
    return (
      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold animate-pulse shadow-sm">
        ⏳ MENUNGGU TUNAI
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold animate-pulse shadow-sm">
        ⏳ CEK TRANSFER
      </span>
    );
  }
  return (
    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold shadow-sm">
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const {
    dataTampilSPP,
    dataTampilZakat,
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
    isLoading,
    setIsLoading,
    confirmConfig,
    setConfirmConfig,
    saldoSPP,
    saldoZakat,
    filterBulanSPP,
    setFilterBulanSPP,
    filterBulanZakat,
    setFilterBulanZakat,
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
  } = useDashboardLogic();

  const newTransaction = dataTampilZakat.some(
    (i) =>
      i.status === "PENDING" ||
      i.status === "PENDING_TUNAI" ||
      dataTampilSPP.some(
        (i) => i.status === "PENDING" || i.status === "PENDING_TUNAI",
      ),
  );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">
        Memuat Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden relative">
      <Toaster position="top-center" reverseOrder={false} />

      <TarikDana
        isWithdrawModalOpen={isWithdrawModalOpen}
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        handleWithdraw={triggerWithdraw}
        withdrawForm={withdrawForm}
        setWithdrawForm={setWithdrawForm}
        isWithdrawing={isWithdrawing}
      />

      <ModalConfirm
        isOpen={confirmConfig.isOpen}
        pesan={confirmConfig.message}
        onClose={() =>
          setConfirmConfig({
            isOpen: false,
            type: "",
            id: null,
            extraData: null,
            message: "",
          })
        }
        onConfirm={executeConfirm}
        isLoading={isExecuting}
      />

      <main className="flex flex-col h-screen overflow-y-auto w-full lg:ml-64">
        <NavDashboard
          setIsWithdrawModalOpen={setIsWithdrawModalOpen}
          handleLogout={triggerLogout}
          newTransaction={newTransaction}
        />

        <div className="p-4 md:p-6 space-y-6">
          <Card saldoSPP={saldoSPP} saldoZakat={saldoZakat} />

          <div className="dark:bg-foreground rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-visible">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <button
                onClick={() => setActiveTab("zakat")}
                className={`flex-1 py-4 px-4 text-sm font-bold transition-all whitespace-nowrap ${activeTab === "zakat" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600 rounded-tl-xl" : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600 hover:rounded-tl-xl duration-500"}`}
              >
                Data Kas Zakat
              </button>
              <button
                onClick={() => setActiveTab("spp")}
                className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap ${activeTab === "spp" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"}`}
              >
                Data Kas Madrasah
              </button>
              <button
                onClick={() => setActiveTab("penyaluran")}
                className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap ${activeTab === "penyaluran" ? "bg-red-50 text-red-700 border-b-2 border-red-600 rounded-tr-xl" : "text-gray-500 hover:bg-gray-50 hover:text-red-600 hover:rounded-tr-xl"}`}
              >
                Riwayat Penyaluran Dana
              </button>
            </div>
            {activeTab === "zakat" && (
              <TableZakat
                activeTab={activeTab}
                Confirmation={triggerKonfirmasi}
                DeleteLongZakat={triggerDeleteLamaZakat}
                DeleteSingleZakat={triggerDeleteSingleZakat}
                filterMonthZakat={filterBulanZakat}
                handleOpenSpreadsheet={handleOpenSpreadsheet}
                UrlReceiveZakat={SPREADSHEET_URL_ZAKAT}
                UrlUsedZakat={SPREADSHEET_URL_Penyaluran_ZAKAT}
                UrlReceiveInfaq={SPREADSHEET_URL_INFAQ}
                UrlUsedInfaq={SPREADSHEET_URL_Penyaluran_INFAQ}
                ShowDataZakat={dataTampilZakat}
                StatusBadge={StatusBadge}
                setFilterMonthZakat={setFilterBulanZakat}
              />
            )}
            {activeTab === "spp" && (
              <TableSPP
                activeTab={activeTab}
                Confirmation={triggerKonfirmasi}
                DeleteLongSpp={triggerDeleteLamaSPP}
                DeleteSingleSpp={triggerDeleteSingleSPP}
                filterMonthSpp={filterBulanSPP}
                handleOpenSpreadsheet={handleOpenSpreadsheet}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                UrlReceiveSpp={SPREADSHEET_URL_SPP}
                UrlUsedSpp={SPREADSHEET_URL_Penggunaan_SPP}
                StatusBadge={StatusBadge}
                ShowDataSpp={dataTampilSPP}
                setFilterMonthSpp={setFilterBulanSPP}
              />
            )}

            {/* KONTEN TAB PENYALURAN */}
            {activeTab === "penyaluran" && (
              <TablePenyaluran
                riwayat={riwayatPenyaluran}
                handleDelete={triggerDeletePenyaluran}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
