"use client";
import React, { useEffect } from "react";
import HomePage from "./pages/HomePage/Page.jsx";

const Page = () => {
  useEffect(() => {
    // Cek apakah di link ada sisa "struk" dari Midtrans
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("order_id=")
    ) {
      // Hapus buntutnya seketika tanpa loading ulang
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  return (
    <div>
      <HomePage />
    </div>
  );
};

export default Page;
