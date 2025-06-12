"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Github } from "lucide-react";
import { signIn, useSession } from "@/lib/auth-client";

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { data: session, isPending } = useSession();

  // Use redirect instead of useEffect for navigation
  if (session && !isPending) {
    redirect(redirectTo);
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signIn.social({
        provider: "github", 
        callbackURL: redirectTo,
      });
    } catch (error) {
      console.error("GitHub sign in error:", error);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to EzDeploy
            </h2>
            <p className="text-gray-600">
              Choose your preferred sign-in method
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Google className="w-5 h-5 mr-3" />
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>

            {/* GitHub Sign In Button */}
            <button
              onClick={handleGithubSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              <Github className="w-5 h-5 mr-3 text-white" />
              <span className="text-white font-medium">
                Continue with GitHub
              </span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </div>        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

interface GoogleIconProps {
  className?: string;
}

const Google = ({ className }: GoogleIconProps) => {
  return (
    <svg
      className={className}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
};
