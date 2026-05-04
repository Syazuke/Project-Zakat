"use client";

import Infaq from "../atoms/Infaq";
import { useEffect, useState } from "react";

const PaymentZakat = () => {
  useEffect(() => {
    // Memastikan script Midtrans terpasang di halaman ini
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    // ✨ PERBAIKAN: Sesuaikan nama variabel dengan file .env
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

  const [nominalZakat, setNominalZakat] = useState(0);

  return (
    <section
      id="bayar"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Form Pembayaran Zakat
        </h2>
        <div className="pt-6">
          <Infaq nominalZakat={nominalZakat} />
        </div>
      </div>
    </section>
  );
};

export default PaymentZakat;
