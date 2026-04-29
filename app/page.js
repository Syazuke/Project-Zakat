"use client";
import React, { useEffect } from "react";
import HomePage from "./pages/HomePage/Page.jsx";

const Page = () => {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("order_id=")
    ) {
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
