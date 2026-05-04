"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/admin" || "/login")) {
    return null;
  }
  if (pathname.endsWith("/login")) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <h1 className="text-3xl">DKM</h1>
          <div className="hidden md:inline space-x-10">
            <a href="/" className="py-4 hover:text-hover">
              Home
            </a>
            <a href="/DKM" className="py-4 hover:text-hover">
              Zakat
            </a>
            <a href="/Madrasah" className="py-4 hover:text-hover">
              SPP
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
            <a href="/" className="py-4 hover:text-hover">
              Home
            </a>
            <a href="/DKM" className="py-4 hover:text-hover">
              Zakat
            </a>
            <a href="/Madrasah" className="py-4 hover:text-hover">
              SPP
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
