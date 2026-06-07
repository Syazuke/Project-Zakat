"use client";

import { Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import PopUp from "./Popup";

const Zakat = ({ nominalZakat, Type }) => {
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [nominal, setZakat] = useState(nominalZakat || 0);
  const [jenisZakat, setJenisZakat] = useState(Type || "zakat penghasilan");
  const [metodeBayar, setMetodeBayar] = useState("online");
  const [isPopup, setIsPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Type) setJenisZakat(Type);
    if (nominalZakat > 0) setZakat(nominalZakat);
  }, [Type, nominalZakat]);

  const checkoutZakat = async (e) => {
    e.preventDefault();

    if (nominal < 10000) {
      alert("Minimal pembayaran adalah Rp 10.000");
      return;
    }

    setIsLoading(true);

    const namaMuzaki = nama.trim() === "" ? "Hamba Allah" : nama;

    const dataTransaksi = {
      nama: namaMuzaki,
      pesan: pesan,
      nominal: nominal,
      zakatType: jenisZakat,
      metode: metodeBayar,
      pilihan_metode: metodeBayar === "online" ? "Transfer Online" : "",
    };

    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataTransaksi),
      });
      if (metodeBayar === "tunai") {
        setIsPopup(true);
        return;
      }

      const nomorWA = "+6281211325663";
      const namaMuzakki = nama.trim() === "" ? "Hamba Allah" : nama;

      let teksWA = `Assalamu'alaikum, saya ingin melakukan konfirmasi pembayaran *Zakat*.\n\n`;
      teksWA += `*Nama Muzakki:* ${namaMuzakki}\n`;
      teksWA += `*Jenis Zakat:* ${jenisZakat}\n`;
      teksWA += `*Total Nominal:* Rp ${nominal.toLocaleString("id-ID")}\n`;
      if (pesan.trim() !== "") {
        teksWA += `*Doa / Niat:* _"${pesan}"_\n`;
      }
      teksWA += `\nBerikut saya lampirkan bukti transfer pembayaran zakat saya. Terima kasih.`;

      const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teksWA)}`;
      window.open(urlWA, "_blank");
      setIsPopup(true);
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatRupiah = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    setZakat(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <div className="bg-emerald-50 px-6 py-4 rounded-xl border border-emerald-100 space-y-4">
      <h1 className="text-center text-4xl text-emerald-800 font-bold font-serif border-gray-200 border-b py-4">
        Form Pembayaran Zakat
      </h1>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Kosongkan untuk Hamba Allah"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
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
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer"
        >
          <option value="Zakat penghasilan">Zakat Penghasilan</option>
          <option value="Zakat maal">Zakat Maal</option>
          <option value="Zakat fidyah">Fidyah</option>
        </select>
      </div>

      {/* METODE PEMBAYARAN */}
      <div className="bg-white p-4 rounded-lg border border-emerald-100">
        <label className="block text-sm font-bold text-emerald-800 mb-3">
          Pilih Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
              metodeBayar === "online"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              className="hidden"
              name="payment"
              value="online"
              checked={metodeBayar === "online"}
              onChange={() => setMetodeBayar("online")}
            />
            <span className="text-sm font-bold">💳 Transfer Online</span>
          </label>
          <label
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
              metodeBayar === "tunai"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
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
      </div>

      {/* Input Nominal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nominal Zakat (Rp)
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
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
          placeholder="Tuliskan doa atau niat zakat Anda di sini..."
          rows="3"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white"
        ></textarea>
      </div>

      {/* Logika Tombol */}
      <button
        type="button"
        onClick={checkoutZakat}
        disabled={nominal < 10000 || isLoading}
        className={`w-full font-bold py-3.5 rounded-lg transition-all mt-4 shadow-md ${
          nominal < 10000 || isLoading
            ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
            : metodeBayar === "tunai"
              ? "bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5"
              : "bg-[#10B981] text-white hover:bg-emerald-600 hover:-translate-y-0.5"
        }`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin text-xl">⏳</span> Memproses...
          </>
        ) : metodeBayar === "tunai" ? (
          "Catat Zakat Tunai"
        ) : (
          "Kirim Konfirmasi via WhatsApp"
        )}
      </button>
      <PopUp
        isOpen={isPopup}
        onClose={() => {
          setIsPopup(false);
          window.location.reload();
        }}
        title="Alhamdulillah, pembayaran zakat berhasil di catat!"
        pesan={
          metodeBayar === "tunai"
            ? "Silahkan serahkan uang zakat kepada admin / DKM"
            : "Silahkan lanjutkan konfirmasi transfer melalu WhatsApp"
        }
      />
    </div>
  );
};

export default Zakat;
