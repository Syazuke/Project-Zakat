"use client";

import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex justify-center items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              Z
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-emerald-800">
                Yayasan Zakat
              </span>
              <p className="text-[10px]">Mensucikan Harta Anda</p>
            </div>
          </div>
          <div className="hidden md:inline space-x-6">
            <a href="#beranda" className="py-4 hover:text-hover">
              Beranda
            </a>
            <a href="#about" className="py-4 hover:text-hover">
              Tentang
            </a>
            <a href="#kalkulator" className="py-4 mb-6 hover:text-hover">
              Kalkulator
            </a>
            <a href="#bayar" className="py-4 mb-6 hover:text-hover">
              Bayar Zakat
            </a>
            <a href="/admin/dashboard" className="py-4 mb-6 hover:text-hover">
              Dashboard
            </a>
            <a href="/login" className="py-4 mb-6 hover:text-hover">
              Login Admin
            </a>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl focus:outline-none md:hidden inline"
          >
            <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
        {isOpen && (
          <div
            className={`absolute top-full left-0 w-full bg-white flex flex-col py-6 px-4 shadow-lg z-50 ${isOpen ? "border-b border-(--divider)" : ""}`}
          >
            <a href="#beranda" className="py-4 hover:text-hover">
              Beranda
            </a>
            <a href="#about" className="py-4 hover:text-hover">
              Tentang
            </a>
            <a href="#kalkulator" className="py-4 hover:text-hover">
              Kalkulator
            </a>
            <a href="#bayar" className="py-4 hover:text-hover">
              Bayar Zakat
            </a>
            <a href="/admin/dashboard" className="py-4 hover:text-hover">
              Dashboard
            </a>
            <a href="/login" className="py-4 hover:text-hover">
              Login Admin
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
