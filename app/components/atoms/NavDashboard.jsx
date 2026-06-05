"use client";

import administratorDark from "@/app/assets/images/administratorDark.png";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NavDashboard = ({
  handleLogout,
  setIsWithdrawModalOpen,
  newTransaction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenProfil, setIsOpenProfil] = useState(false);
  const profileRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpenProfil(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="shadow-sm p-4 flex justify-between items-center sticky top-0 bg-background text-foreground z-[900]">
      <div className="flex flex-row font-serif gap-2 items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="z-40 p-2 bg-emerald-800 text-white dark:text-black rounded-lg shadow-md hover:bg-emerald-700 transition lg:hidden"
        >
          <Menu />
        </button>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-wide">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {mounted && (theme === "dark" ? <Sun /> : <Moon />)}
        </button>
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
          <Bell size={24} className="text-black" />
          {newTransaction && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsOpenProfil(!isOpenProfil)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
          >
            <Image
              src={administratorDark}
              alt="Profil"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm"
            />

            <div className="hidden sm:flex flex-col items-start">
              <h3 className="text-sm font-bold text-gray-800 leading-tight">
                Administrator
              </h3>
              <p className="text-xs opacity-50 font-sans">Super Admin</p>
            </div>

            <div className="text-black ml-1">
              {isOpenProfil ? (
                <ChevronUp size={24} />
              ) : (
                <ChevronDown size={24} />
              )}
            </div>
          </button>

          {isOpenProfil && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <p className="text-sm font-bold text-gray-900 truncate">
                  Administrator
                </p>
                <p className="text-xs text-gray-500 truncate">admin@dkm.com</p>
              </div>

              <div className="p-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition">
                  <User size={16} />
                  Profil Akun
                </button>

                <button
                  onClick={() => {
                    setIsOpenProfil(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 font-medium rounded-lg transition"
                >
                  <LogOut size={16} />
                  Keluar Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[999] w-[75%] sm:w-[40%] md:w-[30%] bg-emerald-800 text-white flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:hidden`}
      >
        <div className="p-6 border-b border-emerald-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={administratorDark}
              alt=""
              className="w-12 h-12 rounded-full border-2 border-emerald-600"
            />
            <div>
              <h2 className="font-bold text-lg leading-tight">Administrator</h2>
              <p className="text-xs opacity-70 font-sans">Zakat & Madrasah</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-emerald-300 hover:text-white transition"
          >
            <X />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-emerald-700 rounded-lg text-white font-medium"
          >
            <span className="text-xl">📊</span> Dashboard
          </a>
        </nav>

        <div className="p-4 border-t border-emerald-700 space-y-2">
          <button
            onClick={() => {
              setIsWithdrawModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-bold transition shadow-sm"
          >
            💸 Tarik Dana
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold transition shadow-sm"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
    </header>
  );
};

export default NavDashboard;
