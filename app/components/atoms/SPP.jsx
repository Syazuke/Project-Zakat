"use client";

import React, { useState, useEffect } from "react";
import PopUp from "./Popup";

const FormSpp = () => {
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisSpp, setJenisSpp] = useState("SPP");
  const [bulanTagihan, setBulanTagihan] = useState([]);
  const [nominal, setNominal] = useState(0);
  const [pesan, setPesan] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("online");
  const [isPopup, setIsPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const HARGA_SPP_PER_BULAN = 300000;

  const daftarBulan = [
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
  ];

  useEffect(() => {
    if (jenisSpp === "SPP") {
      setNominal(bulanTagihan.length * HARGA_SPP_PER_BULAN);
    }
  }, [bulanTagihan, jenisSpp]);

  const handleToggleBulan = (bulan) => {
    if (bulanTagihan.includes(bulan)) {
      setBulanTagihan(bulanTagihan.filter((b) => b !== bulan));
    } else {
      setBulanTagihan([...bulanTagihan, bulan]);
    }
  };

  const checkoutSPP = async () => {
    if (nominal < 10000) {
      alert("Minimal pembayaran adalah Rp 10.000");
      return;
    }
    if (namaSiswa.trim() === "") {
      alert("Mohon isi Nama Lengkap Siswa.");
      return;
    }
    if (jenisSpp === "SPP" && bulanTagihan.length === 0) {
      alert("Mohon centang minimal 1 bulan tagihan.");
      return;
    }

    setIsLoading(true);

    const bulanFinal = jenisSpp === "SPP" ? bulanTagihan.join(", ") : "-";

    const dataTransaksi = {
      nama: namaSiswa,
      pesan: pesan,
      nominal: nominal,
      Type: jenisSpp,
      paymentMonth: bulanFinal,
      metode: metodeBayar,
      pilihan_metode: metodeBayar === "online" ? "Transfer Online" : "",
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataTransaksi),
      });
      if (metodeBayar === "tunai") {
        setIsPopup(true);
        return;
      }
      const nomorWA = "6281234567890";
      let teksWA = `Assalamu'alaikum, saya ingin melakukan konfirmasi pembayaran.\n\n`;
      teksWA += `*Nama Siswa:* ${namaSiswa}\n`;
      teksWA += `*Jenis Tagihan:* ${jenisSpp}\n`;
      if (jenisSpp === "SPP") {
        teksWA += `*Bulan Tagihan:* ${bulanFinal}\n`;
      }
      teksWA += `*Total Nominal:* Rp ${nominal.toLocaleString("id-ID")}\n`;
      if (pesan.trim() !== "") {
        teksWA += `*Keterangan:* ${pesan}\n`;
      }
      teksWA += `\nBerikut saya lampirkan bukti transfer pembayarannya. Terima kasih.`;
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
    if (jenisSpp === "SPP") return;
    let rawValue = e.target.value.replace(/\D/g, "");
    setNominal(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <div className="bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 space-y-4 mt-6 text-left w-full mx-auto">
      <h3 className="font-bold text-blue-800 text-4xl text-center font-serif border-b border-gray-200 py-4">
        Formulir Pembayaran Sekolah
      </h3>

      <div>
        <label
          htmlFor="namaLengkap"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nama Lengkap Siswa <span className="text-red-500">*</span>
        </label>
        <input
          id="namaLengkap"
          type="text"
          value={namaSiswa}
          onChange={(e) => setNamaSiswa(e.target.value)}
          placeholder="Masukkan nama siswa"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
        />
      </div>

      <div>
        <label
          htmlFor="jenisTagihan"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Jenis Tagihan
        </label>
        <select
          id="jenisTagihan"
          value={jenisSpp}
          onChange={(e) => {
            const pilihanBaru = e.target.value;
            setJenisSpp(pilihanBaru);
            if (pilihanBaru !== "SPP") {
              setNominal(0);
              setBulanTagihan([]);
            }
          }}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white cursor-pointer"
        >
          <option value="SPP">Bulanan (SPP)</option>
          <option value="Biaya Sekolah">
            Biaya Tahunan / Bangunan / Lainnya
          </option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-lg border border-blue-100">
        <label
          htmlFor="metodePembayaran"
          className="block text-sm font-bold text-blue-800 mb-3"
        >
          Pilih Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            htmlFor="metodeOnline"
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${metodeBayar === "online" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}
          >
            <input
              id="metodeOnline"
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
            htmlFor="metodeTunai"
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${metodeBayar === "tunai" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}
          >
            <input
              id="metodeTunai"
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

      {jenisSpp === "SPP" && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label
            htmlFor="jenisSPP"
            className="block text-sm font-bold text-gray-800 mb-3"
          >
            Pilih Bulan Tagihan <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 font-normal mt-0.5">
              Tarif: Rp {HARGA_SPP_PER_BULAN.toLocaleString("id-ID")} / bulan
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {daftarBulan.map((bulan) => (
              <label
                htmlFor={`spp-${bulan}`}
                key={bulan}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${
                  bulanTagihan.includes(bulan)
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <input
                  id={`spp-${bulan}`}
                  type="checkbox"
                  checked={bulanTagihan.includes(bulan)}
                  onChange={() => handleToggleBulan(bulan)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm">{bulan}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="nominalPembayaran"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Total Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
        </label>
        <div
          className={`flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white ${
            jenisSpp === "SPP" ? "bg-gray-100" : ""
          }`}
        >
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            id="nominalPembayaran"
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            readOnly={jenisSpp === "SPP"}
            placeholder={
              jenisSpp === "SPP"
                ? "Pilih bulan tagihan di atas"
                : "Ketik total yang harus dibayar"
            }
            className={`w-full focus:outline-none bg-transparent text-black font-bold text-lg ${
              jenisSpp === "SPP" ? "cursor-not-allowed opacity-70" : ""
            }`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pesan"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Keterangan Tambahan (Opsional)
        </label>
        <textarea
          id="pesan"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          placeholder="Misal: Pembayaran SPP bulan lalu yang tertunda..."
          rows="2"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition bg-white"
        ></textarea>
      </div>

      <button
        type="button"
        onClick={checkoutSPP}
        disabled={nominal < 10000 || namaSiswa.trim() === "" || isLoading}
        className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-md mt-4 flex items-center justify-center gap-2 ${
          nominal < 10000 || namaSiswa.trim() === "" || isLoading
            ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none "
            : metodeBayar === "tunai"
              ? "bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5"
              : "bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5"
        }`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin text-xl">⏳</span> Memproses...
          </>
        ) : metodeBayar === "tunai" ? (
          "Catat Pembayaran Tunai"
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
        title="Alhamdulillah, pembayaran uang sekolah sudah di catat!"
        pesan={
          metodeBayar === "tunai"
            ? "Silahkan serahkan uang sekolah ke admin"
            : "Silahkan lanjutkan konfirmasi pembayaran melalui WhatsApp"
        }
      />
    </div>
  );
};

export default FormSpp;
