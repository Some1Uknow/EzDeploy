"use client";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DeployForm from "../components/DeployForm";
import DeploymentsDashboard from "../components/DeploymentsDashboard";
import { useState } from "react";
import { Plus, LogIn } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ShimmerButton } from "../components/ui/shimmer-button";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const [activeDeployment, setActiveDeployment] = useState<string | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [newDeployment, setNewDeployment] = useState<{
    projectSlug: string;
    gitUrl: string;
    url: string;
  } | null>(null);
  const { data: session, isPending } = useSession();

  const handleDeploymentStart = (deployment: {
    projectSlug: string;
    gitUrl: string;
    url: string;
  }) => {
    setNewDeployment(deployment);
    setActiveDeployment(deployment.projectSlug);
    setShowDeployModal(false);
  };
  if (isPending) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (!session?.user) {
    redirect("/"); // Redirect to login or show an error
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {" "}
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {session?.user.name || session?.user.email}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor your application deployments
              </p>
            </div>
            <button
              onClick={() => setShowDeployModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Deployment
            </button>
          </div>{" "}
          {/* Deployments Dashboard */}
          <DeploymentsDashboard
            onNewDeployment={() => setShowDeployModal(true)}
            newDeployment={newDeployment}
            userId={session.user.id}
          />
        </main>
      </div>
      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Deployment
                </h2>{" "}
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>{" "}
            <div className="p-6">
              <DeployForm
                onDeploymentStart={handleDeploymentStart}
                activeDeployment={activeDeployment}
                onClose={() => setShowDeployModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
