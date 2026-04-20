"use client";

import SPP from "@/app/components/atoms/SPP";
import { useEffect, useState } from "react";

const PaymentSPP = () => {
  useEffect(() => {
    const snapScipt = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_CLIENT;
    const script = document.createElement("script");
    script.src = snapScipt;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const [nominalZakat, setNominalZakat] = useState(0);
  const [namaMuzaki, setNamaMuzakki] = useState("");

  return (
    <section id="SPP" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Form Pembayaran SPP
        </h2>
        <div className="pt-6">
          <SPP nominalZakat={nominalZakat} nama={namaMuzaki} />
        </div>
      </div>
    </section>
  );
};

export default PaymentSPP;
