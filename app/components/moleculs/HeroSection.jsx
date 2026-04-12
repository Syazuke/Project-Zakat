"use client";

import React from "react";
import Image from "next/image";
import Masjid from "@/app/assets/images/masjid.jpg";

const HeroSection = () => {
  return (
    <section
      id="beranda"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12"
    >
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        <p className="bg-emerald-100 p-3 rounded-full w-fit">
          🌙 Ramadan Kareem - Bersedekahlah dengan ikhlas
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Tunaikan <span className="text-emerald-600">Zakat</span> Anda dengan
          Mudah
        </h1>
        <p className="text-lg text-gray-600">
          Hitung dan bayar zakat Anda secara online. Bantu mereka yang
          membutuhkan dan sucikan harta Anda sesuai syariat Islam.
        </p>
        <div className="flex gap-2">
          <a
            href="#bayar"
            className="bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition self-center p-3 shadow-lg shadow-emerald-200"
          >
            Bayar Zakat Sekarang
          </a>
          <a
            href="#kalkulator"
            className="bg-white border-2 border-emerald-600 text-emerald-600 self-center py-3 px-6 rounded-lg font-semibold hover:bg-emerald-50 transition"
          >
            Kalkulator Zakat
          </a>
        </div>
        <div className="flex flex-row item-center gap-4 pt-10">
          <div className="flex flex-col w-full items-center">
            <i className="fa-regular fa-heart mb-2 text-3xl"></i>
            <p>Kasih Sayang</p>
          </div>
          <div className="flex flex-col w-full items-center">
            <i className="fa-solid fa-people-group mb-2 text-3xl"></i>
            <p>Kebersamaan</p>
          </div>
        </div>
        <div className="flex flex-row item-center gap-4">
          <div className="flex flex-col w-full items-center">
            <i className="fa-solid fa-arrow-trend-up mb-2 text-3xl"></i>
            <p>Pertumbuhan</p>
          </div>
          <div className="flex flex-col w-full items-center">
            <i className="fa-solid fa-shield mb-2 text-3xl"></i>
            <p>Amanah</p>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 relative">
        <div className="absolute inset-0 bg-emerald-200 rounded-2xl w-full h-80 shadow-inner -rotate-3 z-0"></div>
        <div className="relative z-10 w-full h-80 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={Masjid}
            alt="Gambar Masjid"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
