"use client";

import formConfig from "@/app/libs/form";
import { useState } from "react";

const Kalkulator = () => {
  const [zakatType, setZakatType] = useState("penghasilan");
  const [zakatToPay, setZakatToPay] = useState(0);
  const [nominalZakat, setNominalZakat] = useState(0);
  const [formValues, setFormValues] = useState({});

  // ✨ STATE BARU: Untuk menampilkan pesan jika belum mencapai Nisab
  const [pesanError, setPesanError] = useState("");

  const handleInputChange = (id, value) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleTabChange = (type) => {
    setZakatType(type);
    setFormValues({});
    setZakatToPay(0);
    setPesanError(""); // Kosongkan pesan error saat ganti tab
  };

  const nisab = (totalHarta, totalZakat) => {
    const HARGA_EMAS_PER_GRAM = 1200000; // Harga emas saat ini (Bisa disesuaikan)
    const NISAB_MAAL = 85 * HARGA_EMAS_PER_GRAM; // Batas minimal 85 gram emas

    if (totalHarta === 0) {
      totalZakat = 0;
    } else if (totalHarta >= NISAB_MAAL) {
      // Jika mencapai atau lebih dari nisab, hitung 2.5%
      totalZakat = totalHarta * 0.025;
    } else {
      // Jika belum mencapai nisab
      totalZakat = 0;
      setPesanError(
        `Total harta Anda (Rp ${totalHarta.toLocaleString("id-ID")}) belum mencapai Nisab Zakat Maal sebesar Rp ${NISAB_MAAL.toLocaleString("id-ID")} (setara 85 gram emas). Anda belum diwajibkan berzakat.`,
      );
    }
    setZakatToPay(totalZakat);
    setNominalZakat(totalZakat);
  };

  const handleCalculate = () => {
    let totalZakat = 0;
    setPesanError(""); // Reset pesan error setiap kali tombol di-klik

    if (zakatType === "fidyah") {
      const hari = parseFloat(formValues["hari"]) || 0;
      totalZakat = hari * 65000;
    } else if (zakatType === "penghasilan") {
      const pendapatan = parseFloat(formValues["pendapatan"]) || 0;
      const bonus = parseFloat(formValues["bonus"]) || 0;
      totalZakat = (pendapatan + bonus) * 0.025;
    } else if (zakatType === "maal") {
      const tabungan = parseFloat(formValues["tabungan"]) || 0;
      const emas = parseFloat(formValues["emas"]) || 0;
      const aset = parseFloat(formValues["aset"]) || 0;
      const totalHarta = tabungan + emas + aset;
      return nisab(totalHarta, totalZakat);
    }
  };

  return (
    <>
      <section id="kalkulator" className="bg-white text-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Kalkulator Zakat
            </h2>
            <p className="text-gray-600 mt-3">
              Hitung kewajiban zakat Anda berdasarkan nisab dan ketentuan
              syariat Islam.
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 md:p-10 shadow-sm border border-emerald-100">
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-1 rounded-lg border border-gray-200 w-fit mx-auto">
              {["penghasilan", "maal", "fidyah"].map((type) => (
                <div
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={`px-6 py-2 rounded-md font-medium capitalize transition-all cursor-pointer ${
                    zakatType === type
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  zakat {type}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              {formConfig[zakatType].map((item) => (
                <div key={item.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label}
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent bg-white transition">
                    {item.id !== "hari" && (
                      <span className="text-gray-500 font-semibold mr-2">
                        Rp.
                      </span>
                    )}
                    <input
                      type="text"
                      value={
                        formValues[item.id]
                          ? formValues[item.id].toLocaleString("id-ID")
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        let numericValue = rawValue ? Number(rawValue) : "";
                        if (item.id === "hari" && numericValue > 30) {
                          numericValue = 30;
                        }
                        handleInputChange(item.id, numericValue);
                      }}
                      placeholder={item.placeholder}
                      className="w-full focus:outline-none bg-transparent text-black"
                    />
                    {item.id === "hari" && (
                      <span className="text-gray-500 font-medium ml-2">
                        Hari
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleCalculate}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition mt-2"
              >
                Hitung Zakat
              </button>

              {/* TAMPILAN JIKA BELUM MENCAPAI NISAB */}
              {pesanError && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-orange-700 font-medium">{pesanError}</p>
                </div>
              )}

              {/* TAMPILAN JIKA SUDAH MENCAPAI NISAB & WAJIB BAYAR */}
              {zakatToPay > 0 && (
                <div className="mt-4 p-6 bg-white border border-emerald-200 rounded-xl text-center">
                  <p className="text-gray-600 font-medium mb-2">
                    Total zakat yang harus ditunaikan:
                  </p>
                  <p className="text-4xl font-bold text-emerald-600">
                    Rp {zakatToPay.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {zakatType === "fidyah"
                      ? "*Perhitungan menggunakan estimasi fidyah Rp 65.000/hari"
                      : "*Perhitungan ini menggunakan standar 2.5%"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Kalkulator;
