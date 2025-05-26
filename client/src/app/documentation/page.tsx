"use client";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Documentation from "../components/Documentation";
import Architecture from "../components/Architecture";

export default function DocumentationPage() {
  return (
    <div>
      <Header />
      <div className="pt-16">
        <Architecture />
        <Documentation />
      </div>
      <Footer />
    </div>
  );
}
