import React from "react";

const NavDashboard = ({ setIsWithdrawModalOpen, adminName }) => {
  return (
    <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 px-12 lg:px-0">
        Dashboard Utama
      </h1>
      <div className="flex items-center gap-4">
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
  );
};

export default NavDashboard;
