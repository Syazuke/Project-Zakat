"use client";

import About from "@/app/components/moleculs/About";
import HeroSection from "@/app/components/moleculs/HeroSection";
import Calculator from "../Calculator/page";
import Footer from "@/app/components/moleculs/Footer/page";
import Navigation from "@/app/components/moleculs/Navbar/page";

export default function ZakatHomePage() {
  return (
    <div className="">
      <Navigation />
      <HeroSection />
      <About />
      <Calculator />
      <Footer />
    </div>
  );
}
