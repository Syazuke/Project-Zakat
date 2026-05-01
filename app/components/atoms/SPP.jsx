"use client";

import React, { useState, useEffect } from "react";

const FormSpp = () => {
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisSpp, setJenisSpp] = useState("SPP");
  const [bulanTagihan, setBulanTagihan] = useState([]);
  const [nominal, setNominal] = useState(0);
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✨ STATE METODE PEMBAYARAN
  const [metodeBayar, setMetodeBayar] = useState("online");
  const [pilihanBank, setPilihanBank] = useState("qris"); // STATE BARU

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

  useEffect(() => {
    if (jenisSpp === "SPP" && !snapToken) {
      setNominal(bulanTagihan.length * HARGA_SPP_PER_BULAN);
    }
  }, [bulanTagihan, jenisSpp, snapToken]);

  useEffect(() => {
    const savedData = localStorage.getItem("pending_trx_spp");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setSnapToken(parsedData.token);
        setNamaSiswa(parsedData.nama);
        setJenisSpp(parsedData.jenis);
        setBulanTagihan(parsedData.bulan);
        setNominal(parsedData.nominal);
        setPesan(parsedData.pesan);
        setMetodeBayar(parsedData.metode || "online");
        setPilihanBank(parsedData.pilihanBank || "qris"); // Muat pilihan bank
        setIsPending(true);
      } catch (error) {
        console.error("Gagal membaca memori:", error);
      }
    }

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
        localStorage.removeItem("pending_trx_spp");
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
        localStorage.removeItem("pending_trx_spp");
        setSnapToken(null);
        setIsPending(false);
        window.location.reload();
      },
      onPending: function () {
        setIsPending(true);
      },
      onError: function () {
        alert("Pembayaran gagal atau kadaluarsa!");
        localStorage.removeItem("pending_trx_spp");
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

    // ✨ TAMBAHKAN PILIHAN BANK KE PAYLOAD
    const dataTransaksi = {
      nama: namaSiswa,
      pesan: pesan || "-",
      nominal: nominal,
      zakatType: jenisSpp, // Tokenizer Anda membaca variabel ini juga untuk SPP
      paymentMonth: bulanFinal,
      metode: metodeBayar,
      pilihan_metode: metodeBayar === "online" ? pilihanBank : "", // 👈 Kunci utamanya
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

      const responseData = await response.json();

      // LOGIKA JIKA TUNAI
      if (responseData.isTunai) {
        alert(
          "✅ Pengajuan berhasil! Silakan serahkan uang tunai ke Admin / Tata Usaha.",
        );
        window.location.reload();
        return;
      }

      // LOGIKA JIKA ONLINE
      const { token, clientKey } = responseData;
      const scriptTag = document.querySelector('script[src*="snap.js"]');
      if (scriptTag && clientKey) {
        scriptTag.setAttribute("data-client-key", clientKey);
      }

      setSnapToken(token);

      const paketData = {
        token: token,
        nama: namaSiswa,
        jenis: jenisSpp,
        bulan: bulanTagihan,
        nominal: nominal,
        pesan: pesan,
        metode: metodeBayar,
        pilihanBank: pilihanBank, // Simpan juga pilihan banknya
      };
      localStorage.setItem("pending_trx_spp", JSON.stringify(paketData));

      triggerSnapPopup(token);
    } catch (error) {
      console.error("Error Checkout:", error);
      alert("Terjadi kesalahan sistem.");
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

      {/* ✨ METODE PEMBAYARAN BARU DENGAN TEMA BIRU ✨ */}
      <div className="bg-white p-4 rounded-lg border border-blue-100">
        <label className="block text-sm font-bold text-blue-800 mb-3">
          Pilih Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${metodeBayar === "online" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}
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
            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${metodeBayar === "tunai" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}
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

        {/* MUNCUL JIKA PILIH ONLINE SAJA */}
        {metodeBayar === "online" && (
          <div className="mt-4 pt-4 border-t border-blue-100 animate-fade-in">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Pembayaran Online:
            </label>
            <select
              value={pilihanBank}
              onChange={(e) => setPilihanBank(e.target.value)}
              disabled={snapToken !== null}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
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
          className={`mt-4 p-5 border rounded-lg text-center shadow-inner ${isPending ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}
        >
          <p
            className={`text-sm font-bold mb-1 ${isPending ? "text-blue-800" : "text-orange-800"}`}
          >
            {isPending
              ? "⏳ Menunggu Pembayaran"
              : "⚠️ Transaksi Belum Selesai"}
          </p>
          <p
            className={`text-sm mb-4 ${isPending ? "text-blue-600" : "text-orange-600"}`}
          >
            Anda sudah memilih metode bayar Online. Klik tombol di bawah untuk
            melanjutkan ke pembayaran.
          </p>
          <button
            type="button"
            onClick={() => triggerSnapPopup(snapToken)}
            className="w-full font-bold py-3.5 rounded-lg transition-all shadow-md text-white hover:-translate-y-0.5 bg-blue-600 hover:bg-blue-700"
          >
            Lanjutkan Pembayaran
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("pending_trx_spp");
              setSnapToken(null);
              setIsPending(false);
              window.location.reload();
            }}
            className="w-full mt-3 text-sm text-gray-500 font-medium hover:text-red-500 underline"
          >
            Batalkan Transaksi
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
              : metodeBayar === "tunai"
                ? "bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5"
          }`}
        >
          {isLoading
            ? "Memproses..."
            : metodeBayar === "tunai"
              ? "Catat Tagihan Tunai"
              : "Lanjut Pembayaran"}
        </button>
      )}
    </div>
  );
};

export default FormSpp;
