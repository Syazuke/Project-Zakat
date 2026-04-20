"use client";

import React, { useState } from "react";

const FormSpp = () => {
  // State untuk menyimpan ketikan wali murid
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisSpp, setJenisSpp] = useState("SPP"); // Default ke SPP
  const [bulanTagihan, setBulanTagihan] = useState("Januari"); // State Baru untuk SPP
  const [nominal, setNominal] = useState(0);
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkoutSPP = async () => {
    if (nominal < 10000) {
      alert("Minimal pembayaran adalah Rp 10.000");
      return;
    }
    if (namaSiswa.trim() === "") {
      alert("Mohon isi Nama Lengkap Siswa.");
      return;
    }

    setIsLoading(true);

    // ✨ DATA INI YANG DIKIRIM KE BACKEND ✨
    // Kuncinya harus sama dengan yang diminta Zod di file tokenizer
    const dataTransaksi = {
      nama: namaSiswa,
      pesan: pesan || "-",
      nominal: nominal,
      zakatType: jenisSpp, // Tetap pakai nama kunci 'zakatType' agar Zod tidak bingung
      paymentMonth: bulanTagihan, // Mengirimkan Bulan Tagihan
    };

    try {
      const response = await fetch("/api/tokenizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(dataTransaksi),
      });

      if (!response.ok) {
        throw new Error("Gagal memanggil API Midtrans");
      }

      const { token } = await response.json();

      // Panggil popup Midtrans Snap
      window.snap.pay(token, {
        onSuccess: function (result) {
          alert("Alhamdulillah, Pembayaran berhasil!");
          window.location.reload();
        },
        onPending: function (result) {
          alert("Menunggu pembayaran Anda.");
        },
        onError: function (result) {
          alert("Pembayaran gagal!");
        },
        onClose: function () {
          alert("Anda menutup layar pembayaran sebelum menyelesaikan.");
        },
      });
    } catch (error) {
      console.error("Error Checkout:", error);
      alert("Terjadi kesalahan sistem pembayaran.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatRupiah = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setNominal(0);
    } else {
      setNominal(Number(rawValue));
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-6 space-y-4 text-left">
      <h3 className="font-bold text-blue-800 text-lg border-b border-blue-200 pb-2">
        Formulir Pembayaran Sekolah
      </h3>

      {/* Input Nama Siswa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap Siswa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={namaSiswa}
          onChange={(e) => setNamaSiswa(e.target.value)}
          placeholder="Masukkan nama siswa"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
        />
      </div>

      {/* Grid untuk Jenis Pembayaran & Bulan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Jenis Tagihan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Tagihan
          </label>
          <select
            value={jenisSpp}
            onChange={(e) => setJenisSpp(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white cursor-pointer"
          >
            <option value="SPP">Bulanan (SPP)</option>
            <option value="Biaya Sekolah">
              Biaya Tahunan / Bangunan / Lainnya
            </option>
          </select>
        </div>

        {/* Bulan Tagihan (Hanya relevan jika jenisnya SPP, tapi dibiarkan ada juga tidak apa-apa) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Untuk Bulan Tagihan
          </label>
          <select
            value={bulanTagihan}
            onChange={(e) => setBulanTagihan(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white cursor-pointer"
          >
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((bulan) => (
              <option key={bulan} value={bulan}>
                {bulan}
              </option>
            ))}
            <option value="Bukan Tagihan Bulanan">Bukan Tagihan Bulanan</option>
          </select>
        </div>
      </div>

      {/* Input Nominal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            placeholder="Minimal Rp 10.000"
            className="w-full focus:outline-none bg-transparent text-black font-semibold"
          />
        </div>
      </div>

      {/* Input Pesan / Keterangan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan Tambahan (Opsional)
        </label>
        <textarea
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          placeholder="Misal: Pembayaran SPP sekaligus Uang Seragam..."
          rows="2"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition bg-white"
        ></textarea>
      </div>

      {/* Tombol Bayar */}
      <button
        type="button"
        onClick={checkoutSPP}
        disabled={isLoading || nominal < 10000 || namaSiswa.trim() === ""}
        className={`w-full font-bold py-3 rounded-lg transition-all shadow-md mt-2 ${
          isLoading || nominal < 10000 || namaSiswa.trim() === ""
            ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5"
        }`}
      >
        {isLoading
          ? "Memproses..."
          : `Bayar Sekarang (Rp ${nominal.toLocaleString("id-ID")})`}
      </button>
    </div>
  );
};

export default FormSpp;
