"use client";

import About from "@/app/components/moleculs/About";
import HeroSection from "@/app/components/moleculs/HeroSection";
import Calculator from "../Calculator/page";
import Payments from "../Payment/page";

export default function ZakatHomePage() {
  return (
    <main>
      <HeroSection />
      <About />
      <Calculator />
      <Payments />
    </main>
  );
}
