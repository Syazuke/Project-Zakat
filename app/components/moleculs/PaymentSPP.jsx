"use client";

import SPP from "@/app/components/atoms/SPP";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PaymentSPP = () => {
  return (
    <section id="SPP" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="">
        <Link
          href="/Madrasah"
          className="flex items-center text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <ArrowLeft />
          Kembali
        </Link>
        <SPP />
      </div>
    </section>
  );
};

export default PaymentSPP;
