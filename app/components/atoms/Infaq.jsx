"use client";

import React, { useState, useEffect } from "react";
import PopUp from "./Popup";

const InfaqForm = ({ nominalInfaq, Type }) => {
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [nominal, setNominal] = useState(nominalInfaq || 0);
  const [jenisTransaksi, setJenisTransaksi] = useState(Type || "sedekah");
  const [metodeBayar, setMetodeBayar] = useState("online");
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    if (Type) setJenisTransaksi(Type);
    if (nominalInfaq > 0) setNominal(nominalInfaq);
  }, [Type, nominalInfaq]);

  const checkoutInfaq = async (e) => {
    e.preventDefault();

    if (nominal < 10000) {
      alert("Minimal pembayaran Infaq/Sedekah adalah Rp 10.000.");
      return;
    }

    const namaDonatur = nama.trim() === "" ? "Hamba Allah" : nama;

    const dataTransaksi = {
      nama: namaDonatur,
      pesan: pesan,
      nominal: nominal,
      Type: "sedekah",
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
      const namaDonatur = nama.trim() === "" ? "Hamba Allah" : nama;

      let teksWA = `Assalamu'alaikum, saya ingin melakukan konfirmasi pembayaran *Infaq / Sedekah*.\n\n`;
      teksWA += `*Nama Donatur:* ${namaDonatur}\n`;
      teksWA += `*Total Infaq:* Rp ${nominal.toLocaleString("id-ID")}\n`;
      if (pesan.trim() !== "") {
        teksWA += `*Pesan / Doa:* _"${pesan}"_\n`;
      }
      teksWA += `\nBerikut saya lampirkan bukti transfernya. Semoga berkah dan bermanfaat. Terima kasih.`;

      const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teksWA)}`;
      window.open(urlWA, "_blank");
      setIsPopup(true);
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleFormatRupiah = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    setNominal(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-6 space-y-4 text-left">
      <h3 className="font-bold text-emerald-800 text-lg border-b border-emerald-200 pb-2">
        Formulir Infaq / Sedekah
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
          placeholder="Kosongkan untuk Hamba Allah"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
        />
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
          Nominal Infaq / Sedekah (Rp)
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
          placeholder="Tuliskan doa atau niat sedekah Anda di sini..."
          rows="3"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white"
        ></textarea>
      </div>

      {/* Logika Tombol */}
      <button
        type="button"
        onClick={checkoutInfaq}
        disabled={nominal < 10000}
        className={`w-full font-bold py-3.5 rounded-lg transition-all mt-4 shadow-md ${
          nominal < 10000
            ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
            : metodeBayar === "tunai"
              ? "bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5"
              : "bg-[#10B981] text-white hover:bg-emerald-600 hover:-translate-y-0.5"
        }`}
      >
        {metodeBayar === "tunai"
          ? "Catat Infaq Tunai"
          : "Kirim Konfirmasi via WhatsApp"}
      </button>
      <PopUp
        isOpen={isPopup}
        onClose={() => {
          setIsPopup(false);
          window.location.reload();
        }}
        title="Alhamdulillah, pembayaran infaq berhasil di catat!"
        pesan={
          metodeBayar === "tunai"
            ? "Silahkan serahkan uang infaq ke admin"
            : "Silahkan lanjutkan konfirmasi melalui WhatsApp "
        }
      />
    </div>
  );
};

export default InfaqForm;
