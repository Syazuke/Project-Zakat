"use client";

import React, { useState, useEffect } from "react";

const Zakat = ({ nominalZakat, Type }) => {
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [nominal, setZakat] = useState(nominalZakat || 0);
  const [jenisZakat, setJenisZakat] = useState(Type || "penghasilan");

  // ✨ STATE BARU: Untuk melacak token dan status pending (Sama seperti SPP)
  const [snapToken, setSnapToken] = useState(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (Type) setJenisZakat(Type);
    if (nominalZakat > 0) setZakat(nominalZakat);
  }, [Type, nominalZakat]);

  // ✨ FUNGSI BARU: Pembungkus Snap Popup yang rapi
  const triggerSnapPopup = (tokenToUse) => {
    window.snap.pay(tokenToUse, {
      onSuccess: function () {
        alert("Alhamdulillah, Zakat berhasil ditunaikan!");
        setSnapToken(null);
        setIsPending(false);
        window.location.reload();
      },
      onPending: function () {
        // Jangan reload jika user sudah dapat kode VA, ubah state saja
        setIsPending(true);
      },
      onError: function () {
        alert("Pembayaran gagal atau kadaluarsa!");
        setSnapToken(null);
        setIsPending(false);
        setIsLoading(false);
      },
      onClose: function () {
        setIsLoading(false);
      },
    });
  };

  const checkoutZakat = async () => {
    if (nominal < 10000) {
      alert("Minimal pembayaran zakat adalah Rp 10.000.");
      return;
    }

    setIsLoading(true);
    const namaValid = nama.trim() === "" ? "Hamba Allah" : nama;

    const dataTransaksi = {
      nama: namaValid,
      pesan: pesan,
      nominal: nominal,
      Type: jenisZakat,
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

      if (!response.ok) throw new Error("Gagal memanggil API Midtrans");

      const { token, clientKey } = await response.json();

      // ✨ SUNTIKKAN CLIENT KEY SECARA DINAMIS
      const scriptTag = document.querySelector('script[src*="snap.js"]');
      if (scriptTag && clientKey) {
        scriptTag.setAttribute("data-client-key", clientKey);
      }

      setSnapToken(token);
      triggerSnapPopup(token);
    } catch (error) {
      console.error("Error Checkout:", error);
      alert("Terjadi kesalahan sistem pembayaran.");
      setIsLoading(false);
    }
  };

  const handleFormatRupiah = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setZakat(0);
    } else {
      setZakat(Number(rawValue));
    }
  };

  return (
    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-6 space-y-4 text-left">
      <h3 className="font-bold text-emerald-800 text-lg border-b border-emerald-200 pb-2">
        Lengkapi Data Muzakki
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap (Opsional)
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          disabled={snapToken !== null}
          placeholder="Kosongkan untuk Hamba Allah"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Zakat
        </label>
        <select
          value={jenisZakat}
          onChange={(e) => setJenisZakat(e.target.value)}
          disabled={snapToken !== null}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          <option value="penghasilan">Zakat Penghasilan</option>
          <option value="maal">Zakat Maal</option>
          <option value="fitrah">Zakat Fitrah</option>
          <option value="fidyah">Fidyah</option>
          <option value="sedekah">Sedekah / Infaq</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nominal Zakat (Rp)
        </label>
        <div
          className={`flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-[#10B981] focus-within:border-transparent bg-white ${snapToken ? "bg-gray-100" : ""}`}
        >
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            readOnly={snapToken !== null}
            placeholder="Minimal Rp 10.000"
            className={`w-full focus:outline-none bg-transparent text-black font-medium ${snapToken ? "cursor-not-allowed opacity-70" : ""}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pesan / Doa (Opsional)
        </label>
        <textarea
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          disabled={snapToken !== null}
          placeholder="Tuliskan doa atau niat zakat Anda di sini..."
          rows="3"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
        ></textarea>
      </div>

      {/* ✨ LOGIKA TOMBOL PINTAR SEPERTI SPP ✨ */}
      {snapToken ? (
        <div
          className={`mt-4 p-5 border rounded-lg text-center shadow-inner ${isPending ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}
        >
          <p
            className={`text-sm font-bold mb-1 ${isPending ? "text-emerald-800" : "text-orange-800"}`}
          >
            {isPending
              ? "⏳ Menunggu Pembayaran"
              : "⚠️ Transaksi Belum Selesai"}
          </p>
          <p
            className={`text-sm mb-4 ${isPending ? "text-emerald-600" : "text-orange-600"}`}
          >
            {isPending
              ? "Anda sudah memilih metode bayar. Klik tombol di bawah untuk melihat instruksi (VA/QRIS)."
              : "Anda memiliki transaksi yang belum diselesaikan."}
          </p>
          <button
            type="button"
            onClick={() => triggerSnapPopup(snapToken)}
            className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-md text-white hover:-translate-y-0.5 ${
              isPending
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPending ? "Lihat Kode Pembayaran" : "Lanjutkan Pembayaran"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSnapToken(null);
              setIsPending(false);
              window.location.reload();
            }}
            className="w-full mt-3 text-sm text-gray-500 font-medium hover:text-red-500 underline"
          >
            Batalkan dan Buat Transaksi Baru
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={checkoutZakat}
          disabled={isLoading || nominal < 10000}
          className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-md mt-4 ${
            isLoading || nominal < 10000
              ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
              : "bg-[#10B981] text-white hover:bg-emerald-600 hover:-translate-y-0.5"
          }`}
        >
          {isLoading
            ? "Memproses..."
            : `Tunaikan Zakat (Rp ${nominal.toLocaleString("id-ID")})`}
        </button>
      )}
    </div>
  );
};

export default Zakat;
