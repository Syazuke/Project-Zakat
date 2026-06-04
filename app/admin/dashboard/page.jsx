"use client";

import React from "react";
import Card from "@/app/components/atoms/Card";
import ModalHapus from "@/app/components/atoms/ModalHapus";
import NavDashboard from "@/app/components/atoms/NavDashboard";
import Sidebar from "@/app/components/atoms/Sidebar";
import TablePenyaluran from "@/app/components/atoms/TablePenyaluran";
import TableSPP from "@/app/components/atoms/TableSPP";
import TableZakat from "@/app/components/atoms/TableZakat";
import TarikDana from "@/app/components/atoms/TarikDana";
import { Toaster } from "react-hot-toast";
import useDashboardLogic from "@/app/hooks/useDashboardLogic";

export default function AdminDashboard() {
  const {
    executeConfirm,
    triggerDeleteLamaSPP,
    triggerDeleteSingleSPP,
    triggerDeleteLama,
    triggerDeleteSingle,
    triggerDeletePenyaluran,
    triggerLogout,
    triggerKonfirmasi,
    triggerWithdraw,
    adminName,
    isLoading,
    confirmConfig,
    setConfirmConfig,
    saldoSPP,
    saldoZakat,
    riwayatPenyaluran,
    activeTab,
    setActiveTab,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    withdrawForm,
    setWithdrawForm,
    isWithdrawing,
  } = useDashboardLogic();

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

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">
        Memuat Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-hidden relative">
      <Toaster position="top-center" reverseOrder={false} />

      <TarikDana
        isWithdrawModalOpen={isWithdrawModalOpen}
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        handleWithdraw={triggerWithdraw}
        withdrawForm={withdrawForm}
        setWithdrawForm={setWithdrawForm}
        isWithdrawing={isWithdrawing}
      />

      <ModalHapus
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
      />

      <Sidebar
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        handleLogout={triggerLogout}
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
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
                Data Kas Madrasah
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
                handleDeleteLama={triggerDeleteLama}
                handleOpenSpreadsheet={handleOpenSpreadsheet}
                handleDeleteSingle={triggerDeleteSingle}
                activeTab={activeTab}
                dataTampilZakat={dataTampilZakat}
                StatusBadge={StatusBadge}
                SPREADSHEET_URL_ZAKAT={SPREADSHEET_URL_ZAKAT}
                handleKonfirmasi={triggerKonfirmasi}
                SPREADSHEET_URL_INFAQ={SPREADSHEET_URL_INFAQ}
              />
            )}

            {/* KONTEN TAB SPP */}
            {activeTab === "spp" && (
              <TableSPP
                activeTab={activeTab}
                filterBulanSPP={filterBulanSPP}
                setFilterBulanSPP={setFilterBulanSPP}
                handleDeleteLamaSPP={triggerDeleteLamaSPP}
                handleOpenSpreadsheet={handleOpenSpreadsheet}
                handleDeleteSingleSPP={triggerDeleteSingleSPP}
                dataTampilSPP={dataTampilSPP}
                StatusBadge={StatusBadge}
                SPREADSHEET_URL_SPP={SPREADSHEET_URL_SPP}
                handleKonfirmasi={triggerKonfirmasi}
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
