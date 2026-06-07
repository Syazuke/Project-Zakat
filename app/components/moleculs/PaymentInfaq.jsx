"use client";

import { useState } from "react";
import InfaqForm from "../atoms/Infaq";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PaymentZakat = () => {
  const [nominalInfaq, setNominalInfaq] = useState(0);

  return (
    <section id="bayar" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="">
        <Link
          href="/DKM"
          className="flex items-center text-emerald-700 hover:text-emerald-900 transition font-medium"
        >
          <ArrowLeft />
          Kembali
        </Link>
        <InfaqForm nominalInfaq={nominalInfaq} />
      </div>
    </section>
  );
};

export default PaymentZakat;
