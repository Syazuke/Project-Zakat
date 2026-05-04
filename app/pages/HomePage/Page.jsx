"use client";

import {
  Building2,
  GraduationCap,
  ArrowRight,
  HandHeart,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter(); // ✨ Perbaikan di sini

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Selamat Datang di Portal Layanan Terpadu
          </h1>
          <p className="text-xl text-gray-600">
            Silakan pilih layanan yang ingin Anda tuju.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Card Zakat */}
          <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500"
            onClick={() => router.push("/DKM")} // ✨ Perbaikan di sini
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 p-6 rounded-full">
                  <Building2 className="w-16 h-16" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-center mb-2">
                Baitul Mal
              </h2>
              <h3 className="text-xl text-center text-green-100">
                Lembaga Amil Zakat
              </h3>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <HandHeart className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700 leading-relaxed">
                  Tunaikan kewajiban zakat Anda dengan mudah dan transparan.
                  Kami menyalurkan dana zakat kepada yang berhak menerimanya.
                </p>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group font-medium">
                <span>Masuk ke Portal Zakat</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card SPP */}
          <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
            onClick={() => router.push("/Madrasah")} // ✨ Perbaikan di sini
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 p-6 rounded-full">
                  <GraduationCap className="w-16 h-16" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-center mb-2">
                Administrasi Sekolah
              </h2>
              <h3 className="text-xl text-center text-blue-100">
                Pembayaran SPP
              </h3>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700 leading-relaxed">
                  Kelola pembayaran SPP bulanan dengan sistem yang mudah dan
                  aman. Cek tagihan dan lakukan pembayaran secara online.
                </p>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group font-medium">
                <span>Masuk ke Portal Sekolah</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
