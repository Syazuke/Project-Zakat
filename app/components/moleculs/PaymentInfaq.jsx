"use client";

import { useEffect, useState } from "react";
import InfaqForm from "../atoms/Infaq";

const PaymentZakat = () => {
  useEffect(() => {
    // Memastikan script Midtrans terpasang di halaman ini
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    // Biarkan tetap pakai env ini jika client key Infaq dan Zakat sama
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_Zakat || "";

    // Cek apakah script sudah ada agar tidak ganda
    let script = document.querySelector('script[src="' + snapScript + '"]');

    if (!script) {
      script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // ✨ PERBAIKAN: Ubah nama state agar konsisten dengan Infaq
  const [nominalInfaq, setNominalInfaq] = useState(0);

  return (
    <section
      id="bayar"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center mb-10">
        {/* ✨ PERBAIKAN: Ubah Judul Halaman */}
        <h2 className="text-3xl font-bold text-gray-900">
          Form Pembayaran Infaq / Sedekah
        </h2>
        <div className="pt-6">
          {/* ✨ PERBAIKAN: Sesuaikan nama props dengan yang diminta oleh InfaqForm */}
          <InfaqForm nominalInfaq={nominalInfaq} />
        </div>
      </div>
    </section>
  );
};

export default PaymentZakat;
