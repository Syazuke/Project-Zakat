import PaymentZakat from "@/app/components/moleculs/Payment";
import PaymentSPP from "@/app/components/moleculs/PaymentSPP";
import React from "react";

const Payments = () => {
  return (
    <div>
      <PaymentZakat />
      <PaymentSPP />
    </div>
  );
};

export default Payments;
