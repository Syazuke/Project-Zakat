import React from "react";

export default function TarikDana({
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
  handleWithdraw,
  withdrawForm,
  setWithdrawForm,
  isWithdrawing,
}) {
  if (!isWithdrawModalOpen) return null;

  const handleFormatRupiah = (e) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    setWithdrawForm({ ...withdrawForm, amount: rawValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="bg-red-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            Catat Pengeluaran Kas
          </h3>
          <p className="text-red-100 text-xs mt-1">
            Gunakan form ini HANYA jika uang kas dibelanjakan atau disalurkan.
          </p>
        </div>

        {/* Body Modal */}
        <form onSubmit={handleWithdraw} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Sumber Dana
            </label>
            <select
              value={withdrawForm.source}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, source: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              required
            >
              <option value="ZAKAT">🟢 Kas Zakat (Untuk Mustahik)</option>
              <option value="SPP">🔵 Kas SPP (Untuk Operasional)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nominal Pengeluaran (Rp)
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-red-500 bg-white">
              <span className="text-gray-500 font-bold mr-2">Rp</span>
              <input
                type="text"
                value={
                  withdrawForm.amount
                    ? Number(withdrawForm.amount).toLocaleString("id-ID")
                    : ""
                }
                onChange={handleFormatRupiah}
                placeholder="Contoh: 500.000"
                className="w-full py-2 focus:outline-none text-gray-900 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Keterangan / Tujuan Pengeluaran
            </label>
            <textarea
              value={withdrawForm.note}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, note: e.target.value })
              }
              placeholder={
                withdrawForm.source === "ZAKAT"
                  ? "Contoh: Disalurkan ke Panti Asuhan Al-Ikhlas..."
                  : "Contoh: Membeli ATK dan Token Listrik..."
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 resize-none h-24 text-sm"
              required
            ></textarea>
          </div>

          {/* Footer / Tombol */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-600 bg-gray-100 font-bold hover:bg-gray-200 transition"
              disabled={isWithdrawing}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isWithdrawing || !withdrawForm.amount}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-bold transition flex justify-center items-center ${
                isWithdrawing || !withdrawForm.amount
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isWithdrawing ? "Mencatat..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
