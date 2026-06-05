"use client";

import SPP from "@/app/components/atoms/SPP";

const PaymentSPP = () => {
  return (
    <section id="SPP" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Form Pembayaran SPP
        </h2>
        <div className="pt-6">
          <SPP />
        </div>
      </div>
    </section>
  );
};

export default PaymentSPP;
