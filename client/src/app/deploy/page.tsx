"use client";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DeployForm from "../components/DeployForm";
import DeploymentsDashboard from "../components/DeploymentsDashboard";
import { useState } from "react";

export default function DeployPage() {
  const [activeDeployment, setActiveDeployment] = useState<string | null>(null);

  return (
    <div>
      <Header />
      <div className="pt-16">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Deploy Your Applications
              </h1>
              <p className="text-xl text-gray-600">
                Deploy and manage your applications with ease
              </p>
            </div>
            <DeploymentsDashboard />
            <DeployForm
              onDeploymentStart={setActiveDeployment}
              activeDeployment={activeDeployment}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
