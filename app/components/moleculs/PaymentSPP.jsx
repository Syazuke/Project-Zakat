"use client";

import SPP from "@/app/components/atoms/SPP";
import { useEffect, useState } from "react";

const PaymentSPP = () => {
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
