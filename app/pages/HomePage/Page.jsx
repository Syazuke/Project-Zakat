"use client";

import About from "@/app/components/moleculs/About";
import HeroSection from "@/app/components/moleculs/HeroSection";
import Calculator from "../Calculator/page";
import Footer from "@/app/components/moleculs/Footer/page";
import Navigation from "@/app/components/moleculs/Navbar/page";
import Payments from "../Payment/page";

export default function ZakatHomePage() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <About />
      <Calculator />
      <Payments />
      <Footer />
    </main>
  );
}
