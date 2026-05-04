"use client";

import React, { useState, useEffect } from "react";

const Zakat = ({ nominalZakat, Type }) => {
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nominal, setZakat] = useState(nominalZakat || 0);
  const [jenisZakat, setJenisZakat] = useState(Type || "penghasilan");

  const [metodeBayar, setMetodeBayar] = useState("online");
  const [pilihanBank, setPilihanBank] = useState("qris");

  const [snapToken, setSnapToken] = useState(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (Type) setJenisZakat(Type);
    if (nominalZakat > 0) setZakat(nominalZakat);
  }, [Type, nominalZakat]);

  const triggerSnapPopup = (tokenToUse) => {
    window.snap.pay(tokenToUse, {
      onSuccess: function () {
        alert("Alhamdulillah, Zakat berhasil ditunaikan!");
        setSnapToken(null);
        setIsPending(false);
        window.location.reload();
      },
      onPending: function () {
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

    // ✨ TAMBAHKAN PILIHAN_METODE KE DALAM DATA TRANSAKSI
    const dataTransaksi = {
      nama: namaValid,
      pesan: pesan,
      nominal: nominal,
      Type: jenisZakat,
      metode: metodeBayar,
      pilihan_metode: metodeBayar === "online" ? pilihanBank : "", // 👈 Dikirim ke Tokenizer
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

      if (!response.ok) throw new Error("Gagal memanggil API");

      const result = await response.json();

      // LOGIKA JIKA TUNAI
      if (result.isTunai) {
        alert("Pencatatan Tunai Berhasil! Silakan serahkan zakat ke admin.");
        window.location.reload();
        return;
      }

      // LOGIKA JIKA ONLINE
      const { token, clientKey } = result;
      const scriptTag = document.querySelector('script[src*="snap.js"]');
      if (scriptTag && clientKey) {
        scriptTag.setAttribute("data-client-key", clientKey);
      }

      setSnapToken(token);
      triggerSnapPopup(token);
    } catch (error) {
      console.error("Error Checkout:", error);
      alert("Terjadi kesalahan sistem.");
      setIsLoading(false);
    }
  };

  const handleFormatRupiah = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    setZakat(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-6 space-y-4 text-left">
      <h3 className="font-bold text-emerald-800 text-lg border-b border-emerald-200 pb-2">
        Lengkapi Data Muzakki
      </h3>

      {/* Input Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          disabled={snapToken !== null}
          placeholder="Kosongkan untuk Hamba Allah"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white disabled:bg-gray-100"
        />
      </div>

      {/* Pilihan Jenis Zakat */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Zakat
        </label>
        <select
          value={jenisZakat}
          onChange={(e) => setJenisZakat(e.target.value)}
          disabled={snapToken !== null}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white disabled:bg-gray-100"
        >
          <option value="sedekah">Sedekah / Infaq</option>
        </select>
      </div>

      {/* METODE PEMBAYARAN */}
      <div className="bg-white p-4 rounded-lg border border-emerald-100">
        <label className="block text-sm font-bold text-emerald-800 mb-3">
          Pilih Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${metodeBayar === "online" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 hover:bg-gray-50"}`}
          >
            <input
              type="radio"
              className="hidden"
              name="payment"
              value="online"
              checked={metodeBayar === "online"}
              onChange={() => setMetodeBayar("online")}
            />
            <span className="text-sm font-bold">💳 Online</span>
          </label>
          <label
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${metodeBayar === "tunai" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 hover:bg-gray-50"}`}
          >
            <input
              type="radio"
              className="hidden"
              name="payment"
              value="tunai"
              checked={metodeBayar === "tunai"}
              onChange={() => setMetodeBayar("tunai")}
            />
            <span className="text-sm font-bold">💵 Tunai</span>
          </label>
        </div>

        {/* ✨ MUNCUL JIKA PILIH ONLINE SAJA ✨ */}
        {metodeBayar === "online" && (
          <div className="mt-4 pt-4 border-t border-emerald-100 animate-fade-in">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Pembayaran Online:
            </label>
            <select
              value={pilihanBank}
              onChange={(e) => setPilihanBank(e.target.value)}
              disabled={snapToken !== null}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            >
              <option value="qris">QRIS (Biaya 0.7%)</option>
              <option value="gopay">GoPay (Biaya 2%)</option>
              <option value="dana">DANA (Biaya 1.5%)</option>
              <option value="bca_va">
                Virtual Account BCA (Biaya Rp 4.000)
              </option>
              <option value="bni_va">
                Virtual Account BNI (Biaya Rp 4.000)
              </option>
              <option value="bri_va">
                Virtual Account BRI (Biaya Rp 4.000)
              </option>
              <option value="mandiri_va">
                Virtual Account Mandiri (Biaya Rp 4.000)
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              *Biaya layanan gateway akan ditambahkan secara otomatis pada total
              tagihan.
            </p>
          </div>
        )}
      </div>

      {/* Input Nominal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nominal Zakat (Rp)
        </label>
        <div
          className={`flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500 ${snapToken ? "bg-gray-100" : ""}`}
        >
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            readOnly={snapToken !== null}
            placeholder="Minimal Rp 10.000"
            className="w-full focus:outline-none bg-transparent text-black font-medium"
          />
        </div>
      </div>

      {/* Pesan Doa */}
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
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white disabled:bg-gray-100"
        ></textarea>
      </div>

      {/* Logika Tombol */}
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
          <button
            type="button"
            onClick={() => triggerSnapPopup(snapToken)}
            className={`w-full font-bold py-3.5 rounded-lg text-white ${isPending ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-500 hover:bg-orange-600"}`}
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
            className="w-full mt-3 text-sm text-gray-500 underline"
          >
            Batalkan dan Buat Baru
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={checkoutZakat}
          disabled={isLoading || nominal < 10000}
          className={`w-full font-bold py-3.5 rounded-lg transition-all mt-4 ${isLoading || nominal < 10000 ? "bg-gray-400 text-gray-100 cursor-not-allowed" : "bg-[#10B981] text-white hover:bg-emerald-600"}`}
        >
          {isLoading
            ? "Memproses..."
            : metodeBayar === "tunai"
              ? "Catat Pembayaran Tunai"
              : `Lanjut Pembayaran`}
        </button>
      )}
    </div>
  );
};

export default Zakat;
