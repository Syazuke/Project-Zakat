"use client";

import React, { useState } from "react";

const FormSpp = () => {
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisSpp, setJenisSpp] = useState("SPP");

  // ✨ STATE BARU: Sekarang menggunakan Array (Daftar) untuk menampung banyak bulan
  const [bulanTagihan, setBulanTagihan] = useState([]);

  const [nominal, setNominal] = useState(0);
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Daftar bulan untuk ditampilkan di checkbox
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

  // ✨ FUNGSI BARU: Untuk menambah/menghapus ceklis bulan
  const handleToggleBulan = (bulan) => {
    if (bulanTagihan.includes(bulan)) {
      // Jika sudah dicentang, maka hapus dari daftar (uncheck)
      setBulanTagihan(bulanTagihan.filter((b) => b !== bulan));
    } else {
      // Jika belum dicentang, tambahkan ke daftar
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

    // ✨ GABUNGKAN NAMA BULAN JADI SATU KALIMAT ✨
    // Contoh: ["Januari", "Februari"] diubah menjadi "Januari, Februari"
    const bulanFinal =
      jenisSpp === "SPP" ? bulanTagihan.join(", ") : "Bukan Tagihan Bulanan";

    const dataTransaksi = {
      nama: namaSiswa,
      pesan: pesan || "-",
      nominal: nominal,
      zakatType: jenisSpp,
      paymentMonth: bulanFinal,
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

      const { token } = await response.json();

      window.snap.pay(token, {
        onSuccess: function () {
          alert("Alhamdulillah, Pembayaran berhasil!");
          window.location.reload();
        },
        onPending: function () {
          alert("Menunggu pembayaran Anda.");
        },
        onError: function () {
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
    setNominal(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-6 space-y-5 text-left max-w-2xl mx-auto">
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

      {/* ✨ KOTAK CENTANG BULAN (Hanya Muncul Jika Jenisnya SPP) ✨ */}
      {jenisSpp === "SPP" && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Pilih Bulan Tagihan <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 font-normal mt-0.5">
              Bisa pilih lebih dari 1 bulan.
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {daftarBulan.map((bulan) => (
              <label
                key={bulan}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${
                  bulanTagihan.includes(bulan)
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <input
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

      {/* Input Nominal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            placeholder="Ketik total yang harus dibayar"
            className="w-full focus:outline-none bg-transparent text-black font-bold text-lg"
          />
        </div>
        {bulanTagihan.length > 1 && (
          <p className="text-xs text-blue-600 mt-1.5 italic">
            *Pastikan nominal di atas adalah total untuk {bulanTagihan.length}{" "}
            bulan.
          </p>
        )}
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
        className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-md mt-4 ${
          isLoading || nominal < 10000 || namaSiswa.trim() === ""
            ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5"
        }`}
      >
        {isLoading
          ? "Memproses..."
          : `Bayar Tagihan (Rp ${nominal.toLocaleString("id-ID")})`}
      </button>
    </div>
  );
};

export default FormSpp;
