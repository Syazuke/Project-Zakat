"use client";

import React from "react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  if (pathname.endsWith("/login")) {
    return null;
  }

  return (
    <footer className="bg-emerald-900 text-emerald-100 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm">
            © {new Date().getFullYear()} DKM Ayatul Muthmainnah
          </p>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-white transition">
            Tentang Kami
          </a>
          <a href="#" className="hover:text-white transition">
            Syarat & Ketentuan
          </a>
          <a href="#" className="hover:text-white transition">
            Privasi
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
