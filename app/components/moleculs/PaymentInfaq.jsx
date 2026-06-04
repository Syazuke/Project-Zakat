"use client";

import { useEffect, useState } from "react";
import InfaqForm from "../atoms/Infaq";

const PaymentZakat = () => {
  const [nominalInfaq, setNominalInfaq] = useState(0);

  return (
    <section
      id="bayar"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Form Pembayaran Infaq / Sedekah
        </h2>
        <div className="pt-6">
          <InfaqForm nominalInfaq={nominalInfaq} />
        </div>
      </div>
    </section>
  );
};

export default PaymentZakat;
