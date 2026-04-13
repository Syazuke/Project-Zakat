"use client";

import formConfig from "@/app/libs/form";
import { useState } from "react";

const Kalkulator = () => {
  const [zakatType, setZakatType] = useState("penghasilan");
  const [zakatToPay, setZakatToPay] = useState(0);
  const [nominalZakat, setNominalZakat] = useState(0);
  const [formValues, setFormValues] = useState({});
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
  };

  const handleCalculate = () => {
    let totalZakat = 0;

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
      totalZakat = (tabungan + emas) * 0.025;
    }
    setZakatToPay(totalZakat);
    setNominalZakat(totalZakat);
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

                  {/* Container Input dengan style border dan focus */}
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
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                Hitung Zakat
              </button>
              {zakatToPay > 0 && (
                <div className="mt-6 p-6 bg-white border border-emerald-200 rounded-xl text-center">
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
