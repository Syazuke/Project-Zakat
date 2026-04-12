import React from "react";

const Footer = () => {
  return (
    <footer className="bg-emerald-900 text-emerald-100 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-900 font-bold text-xl">
            Z
          </div>
          <span className="font-bold text-xl text-white">ZakatKu</span>
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} ZakatKu. Lembaga Amil Zakat Terpercaya.
        </p>
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
