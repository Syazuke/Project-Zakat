"use client";

import React, { useState, useEffect } from "react";

const FormSpp = () => {
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisSpp, setJenisSpp] = useState("SPP");
  const [bulanTagihan, setBulanTagihan] = useState([]);
  const [nominal, setNominal] = useState(0);
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [snapToken, setSnapToken] = useState(null);
  const [isPending, setIsPending] = useState(false);

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

  // Kalkulator Otomatis (hanya jalan jika sedang tidak ada token pending)
  useEffect(() => {
    if (jenisSpp === "SPP" && !snapToken) {
      setNominal(bulanTagihan.length * HARGA_SPP_PER_BULAN);
    }
  }, [bulanTagihan, jenisSpp, snapToken]);

  // ✨ PENANGKAP URL & INGATAN MEMORI SUPER (SIMPAN SEMUA DATA)
  useEffect(() => {
    // 1. Ambil paket data dari memori browser
    const savedData = localStorage.getItem("pending_trx_spp");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Kembalikan semua data ke form
        setSnapToken(parsedData.token);
        setNamaSiswa(parsedData.nama);
        setJenisSpp(parsedData.jenis);
        setBulanTagihan(parsedData.bulan);
        setNominal(parsedData.nominal);
        setPesan(parsedData.pesan);
        setIsPending(true);
      } catch (error) {
        console.error("Gagal membaca memori:", error);
      }
    }

    // 2. Sapu bersih buntut URL dari Midtrans
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const statusTransaksi = urlParams.get("transaction_status");

      if (statusTransaksi === "pending") {
        window.history.replaceState(null, "", window.location.pathname);
      } else if (
        statusTransaksi === "settlement" ||
        statusTransaksi === "capture"
      ) {
        alert("✅ Alhamdulillah, Pembayaran Tagihan berhasil!");
        localStorage.removeItem("pending_trx_spp"); // Hapus memori jika sukses
        setSnapToken(null);
        setIsPending(false);
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  const handleToggleBulan = (bulan) => {
    if (bulanTagihan.includes(bulan)) {
      setBulanTagihan(bulanTagihan.filter((b) => b !== bulan));
    } else {
      setBulanTagihan([...bulanTagihan, bulan]);
    }
  };

  const triggerSnapPopup = (tokenToUse) => {
    window.snap.pay(tokenToUse, {
      onSuccess: function () {
        alert("Alhamdulillah, Pembayaran berhasil!");
        localStorage.removeItem("pending_trx_spp"); // ✨ HAPUS MEMORI
        setSnapToken(null);
        setIsPending(false);
        window.location.reload();
      },
      onPending: function () {
        setIsPending(true);
      },
      onError: function () {
        alert("Pembayaran gagal atau kadaluarsa!");
        localStorage.removeItem("pending_trx_spp"); // ✨ HAPUS MEMORI
        setSnapToken(null);
        setIsPending(false);
        setIsLoading(false);
      },
      onClose: function () {
        setIsLoading(false);
      },
    });
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

      const { token, clientKey } = await response.json();

      const scriptTag = document.querySelector('script[src*="snap.js"]');
      if (scriptTag && clientKey) {
        scriptTag.setAttribute("data-client-key", clientKey);
      }

      setSnapToken(token);

      // ✨ SIMPAN SEMUA DATA FORM KE DALAM MEMORI
      const paketData = {
        token: token,
        nama: namaSiswa,
        jenis: jenisSpp,
        bulan: bulanTagihan,
        nominal: nominal,
        pesan: pesan,
      };
      localStorage.setItem("pending_trx_spp", JSON.stringify(paketData));

      triggerSnapPopup(token);
    } catch (error) {
      console.error("Error Checkout:", error);
      alert("Terjadi kesalahan sistem pembayaran.");
      setIsLoading(false);
    }
  };

  const handleFormatRupiah = (e) => {
    if (jenisSpp === "SPP") return;
    let rawValue = e.target.value.replace(/\D/g, "");
    setNominal(rawValue === "" ? 0 : Number(rawValue));
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-6 space-y-5 text-left max-w-2xl mx-auto">
      <h3 className="font-bold text-blue-800 text-lg border-b border-blue-200 pb-2">
        Formulir Pembayaran Sekolah
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap Siswa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={namaSiswa}
          onChange={(e) => setNamaSiswa(e.target.value)}
          disabled={snapToken !== null}
          placeholder="Masukkan nama siswa"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jenis Tagihan
        </label>
        <select
          value={jenisSpp}
          onChange={(e) => {
            const pilihanBaru = e.target.value;
            setJenisSpp(pilihanBaru);
            if (pilihanBaru !== "SPP") {
              setNominal(0);
              setBulanTagihan([]);
            }
          }}
          disabled={snapToken !== null}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="SPP">Bulanan (SPP)</option>
          <option value="Biaya Sekolah">
            Biaya Tahunan / Bangunan / Lainnya
          </option>
        </select>
      </div>

      {jenisSpp === "SPP" && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Pilih Bulan Tagihan <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 font-normal mt-0.5">
              Tarif: Rp {HARGA_SPP_PER_BULAN.toLocaleString("id-ID")} / bulan
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {daftarBulan.map((bulan) => (
              <label
                key={bulan}
                className={`flex items-center gap-2 p-2 rounded border transition ${
                  snapToken ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${
                  bulanTagihan.includes(bulan)
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={bulanTagihan.includes(bulan)}
                  onChange={() => handleToggleBulan(bulan)}
                  disabled={snapToken !== null}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <span className="text-sm">{bulan}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
        </label>
        <div
          className={`flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white ${
            jenisSpp === "SPP" || snapToken ? "bg-gray-100" : ""
          }`}
        >
          <span className="text-gray-500 font-semibold mr-2">Rp.</span>
          <input
            type="text"
            value={nominal === 0 ? "" : nominal.toLocaleString("id-ID")}
            onChange={handleFormatRupiah}
            readOnly={jenisSpp === "SPP" || snapToken !== null}
            placeholder={
              jenisSpp === "SPP"
                ? "Pilih bulan tagihan di atas"
                : "Ketik total yang harus dibayar"
            }
            className={`w-full focus:outline-none bg-transparent text-black font-bold text-lg ${
              jenisSpp === "SPP" || snapToken
                ? "cursor-not-allowed opacity-70"
                : ""
            }`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan Tambahan (Opsional)
        </label>
        <textarea
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          disabled={snapToken !== null}
          placeholder="Misal: Pembayaran SPP bulan lalu yang tertunda..."
          rows="2"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
        ></textarea>
      </div>

      {snapToken ? (
        <div
          className={`mt-4 p-5 border rounded-lg text-center shadow-inner ${
            isPending
              ? "bg-blue-50 border-blue-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
          <p
            className={`text-sm font-bold mb-1 ${
              isPending ? "text-blue-800" : "text-orange-800"
            }`}
          >
            {isPending
              ? "⏳ Menunggu Pembayaran"
              : "⚠️ Transaksi Belum Selesai"}
          </p>
          <p
            className={`text-sm mb-4 ${
              isPending ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {isPending
              ? "Anda sudah memilih metode bayar. Klik tombol di bawah untuk melihat instruksi atau Nomor Virtual Account (VA)."
              : "Anda memiliki transaksi yang belum diselesaikan."}
          </p>
          <button
            type="button"
            onClick={() => triggerSnapPopup(snapToken)}
            className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-md text-white hover:-translate-y-0.5 ${
              isPending
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPending ? "Lihat Kode Pembayaran (VA)" : "Lanjutkan Pembayaran"}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("pending_trx_spp"); // ✨ HAPUS MEMORI
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
      )}
    </div>
  );
};

export default FormSpp;
