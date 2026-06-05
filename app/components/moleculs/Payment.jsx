"use client";

import Zakat from "@/app/components/atoms/Zakat";
import { useState } from "react";

const PaymentZakat = () => {
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
          <Zakat
            nominalZakat={nominalZakat}
            setNominalZakat={setNominalZakat}
          />
        </div>
      </div>
    </section>
  );
};

export default PaymentZakat;
