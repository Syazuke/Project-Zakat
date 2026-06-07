"use client";

import Zakat from "@/app/components/atoms/Zakat";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PaymentZakat = () => {
  const [nominalZakat, setNominalZakat] = useState(0);

  return (
    <section id="bayar" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <Link
          href="/DKM"
          className="flex items-center text-emerald-700 hover:text-emerald-900 transition font-medium"
        >
          <ArrowLeft />
          Kembali
        </Link>
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
