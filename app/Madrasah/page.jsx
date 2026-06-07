"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, ShieldCheck } from "lucide-react";
import Image from "next/image";
import madrasah from "@/app/assets/images/masjid.webp";
import Link from "next/link";

export default function SppModern() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <Link
        href="/"
        className="flex items-center text-blue-700 hover:text-blue-900 transition font-medium px-4 py-6"
      >
        <ArrowLeft />
        Kembali
      </Link>

      <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center gap-1">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" /> Pembayaran Terenkripsi & Aman
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Bayar SPP Kini <br />
            <span className="text-indigo-600">Lebih Mudah & Cepat</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-md">
            Portal resmi Administrasi Keuangan Paud Al-Fatah. Cek tagihan dan
            bayar SPP langsung dari HP dan laptop Anda tanpa perlu antre lagi.
          </p>
          <button
            className="p-4 rounded-2xl border bg-blue-500 text-white"
            onClick={() => router.push("/Madrasah/payment")}
          >
            <p>Bayar SPP disini</p>
          </button>
        </div>
        <div className="flex-1 w-full">
          <Image src={madrasah} alt="baslk" className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
