"use client"; // Tambahkan ini karena kita sekarang menggunakan useState

import React, { useState } from "react";

const Sidebar = ({ setIsWithdrawModalOpen, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 md:top-6 z-40 p-2 bg-emerald-800 text-white rounded-lg shadow-md lg:hidden hover:bg-emerald-700 transition"
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

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-800 text-white flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="p-6 border-b border-emerald-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-800 font-bold text-xl">
              Z
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">AdminPanel</h2>
              <p className="text-xs text-emerald-300">ZakatKu & SPP</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-emerald-300 hover:text-white"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-emerald-700 rounded-lg text-white font-medium"
          >
            <span className="text-xl">📊</span> Dashboard
          </a>
          {/* Tambahkan menu lain di sini */}
        </nav>

        <div className="p-4 border-t border-emerald-700 space-y-2">
          <button
            onClick={() => {
              setIsWithdrawModalOpen(true);
              setIsOpen(false); // Tutup sidebar otomatis setelah modal ditarik (untuk HP)
            }}
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
    </>
  );
};

export default Sidebar;
