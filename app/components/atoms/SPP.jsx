"use client";

import React, { useState } from "react";

// Kita menerima nominalZakat dan zakatType dari Kalkulator.jsx
const Zakat = ({ nominalZakat, zakatType }) => {
  // State untuk menyimpan ketikan user
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nominal, setZakat] = useState(0);
  const [jenisZakat, setJenisZakat] = useState("");

  const checkoutZakat = async () => {
    if (nominal <= 0) {
      alert("Silakan hitung nominal zakat terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    // Jika nama kosong, otomatis jadi Hamba Allah
    const namaValid = nama.trim() === "" ? "Hamba Allah" : nama;

    // DATA INI YANG DIKIRIM KE BACKEND (Harus sama persis namanya)
    const dataTransaksi = {
      nama: namaValid,
      pesan: pesan,
      nominal: nominal,
      zakatType: jenisZakat || "Zakat",
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
          alert("Alhamdulillah, Zakat berhasil ditunaikan!");
          window.location.reload(); // Refresh halaman agar form kembali bersih
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
    // Hapus semua karakter yang bukan angka
    let rawValue = e.target.value.replace(/\D/g, "");

    // Jika input kosong (dihapus semua), kembalikan ke 0
    if (rawValue === "") {
      setZakat(0);
    } else {
      // Ubah kembali menjadi angka utuh (Number)
      setZakat(Number(rawValue));
    }
  };

  return (
    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-6 space-y-4 text-left">
      <h3 className="font-bold text-emerald-800 text-lg border-b border-emerald-200 pb-2">
        Lengkapi Data Muzakki
      </h3>

      {/* Input Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap (Opsional)
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Kosongkan untuk Hamba Allah"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nominal Zakat (Rp)
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-[#10B981] focus-within:border-transparent bg-white">
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            placeholder="Minimal Rp 10.000"
            className="w-full focus:outline-none bg-transparent text-black"
          />
        </div>
      </div>

      {/* Input Pesan / Doa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pesan / Doa (Opsional)
        </label>
        <textarea
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          placeholder="Tuliskan doa atau niat zakat Anda di sini..."
          rows="3"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition bg-white"
        ></textarea>
      </div>

      {/* Tombol Bayar */}
      <button
        type="button"
        onClick={checkoutZakat}
        disabled={isLoading || nominal <= 0}
        className={`w-full font-bold py-3 rounded-lg transition-all shadow-md mt-2 ${
          isLoading || nominal <= 0
            ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
            : "bg-[#10B981] text-white hover:bg-emerald-600 hover:-translate-y-0.5"
        }`}
      >
        {isLoading
          ? "Memproses..."
          : `Tunaikan Zakat (Rp ${nominal.toLocaleString("id-ID")})`}
      </button>
    </div>
  );
};

export default Zakat;
