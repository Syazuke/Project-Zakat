"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dkm from "@/app/assets/images/dkm.png";
import Image from "next/image";
import Link from "next/link";

const Navigation = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/admin" || pathname.startsWith("/login"))) {
    return null;
  }
  if (pathname.endsWith("/login")) {
    return null;
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Zakat", href: "/DKM" },
    { name: "Sekolah", href: "/Madrasah" },
  ];
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <Image src={dkm} alt="dkm" className="w-12 h-12 rounded-full" />
            <div className="flex flex-col">
              <h1 className="text-2xl leading-5">DKM</h1>
              <p className="text-xs opacity-70">Ayatul Muthmainnah</p>
            </div>
          </div>
          <div className="hidden md:inline space-x-10">
            {navLinks.map((i) => {
              const isActive =
                pathname === i.href ||
                (i.href !== "/" && pathname.startsWith(i.href));
              return (
                <Link
                  key={i.name}
                  href={i.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-semibold transition-all duration-200 py-2 relative group ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  {i.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 transform origin-left transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  ></span>
                </Link>
              );
            })}
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
            className={`absolute top-full left-0 w-full bg-white flex flex-col px-4 shadow-lg z-50 ${isOpen ? "border-b border-(--divider)" : ""}`}
          >
            <a href="/" className="py-2 hover:text-hover">
              Home
            </a>
            <a href="/DKM" className="py-2 hover:text-hover">
              Zakat
            </a>
            <a href="/Madrasah" className="py-2 hover:text-hover">
              SPP
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
