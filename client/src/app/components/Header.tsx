"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Github,
  LogIn,
  User,
  LogOut,
  Home,
  FileText,
  Monitor,
  Sparkles,
  Zap,
  Star,
  Rocket,
  Settings,
  Code,
  Book,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Dock, DockIcon } from "./ui/dock";
import { ScrollProgress } from "./ui/scroll-progress";
import { ShimmerButton } from "./ui/shimmer-button";
import { motion } from "motion/react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return (
    <div className="pb-20">
      {/* Scroll Progress Indicator */}
      <ScrollProgress className="top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />{" "}
      {/* Magic UI Dock Navigation - Replaces traditional navbar */}
      <motion.div
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <Dock
          direction="middle"
          className="bg-white/95 border border-gray-200/60 shadow-2xl shadow-black/10 backdrop-blur-2xl min-w-max px-8 py-4"
          iconSize={80}
          iconMagnification={100}
          iconDistance={200}
        >
          {/* Home */}
          <DockIcon>
            <Link
              href="/"
              className="flex items-center justify-center w-full h-full text-gray-600 hover:text-blue-500 transition-colors duration-200 px-4 group"
              title="Home"
            >
              <Home className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-base font-semibold text-gray-700 group-hover:text-blue-500 transition-colors duration-200 whitespace-nowrap">
                Home
              </span>
            </Link>
          </DockIcon>
          {/* Features */}
          <DockIcon>
            <Link
              href="#features"
              className="flex items-center justify-center w-full h-full text-gray-600 hover:text-emerald-500 transition-colors duration-200 px-4 group"
              title="Features"
            >
              <Zap className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-base font-semibold text-gray-700 group-hover:text-emerald-500 transition-colors duration-200 whitespace-nowrap">
                Features
              </span>
            </Link>
          </DockIcon>
          {/* Documentation */}
          <DockIcon>
            <Link
              href="/documentation"
              className="flex items-center justify-center w-full h-full text-gray-600 hover:text-orange-500 transition-colors duration-200 px-4 group"
              title="Documentation"
            >
              <Book className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-base font-semibold text-gray-700 group-hover:text-orange-500 transition-colors duration-200 whitespace-nowrap">
                Docs
              </span>
            </Link>
          </DockIcon>
          {/* Dashboard - Only show if authenticated */}
          {session && (
            <DockIcon>
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full h-full text-gray-600 hover:text-green-500 transition-colors duration-200 px-4 group"
                title="Dashboard"
              >
                <Activity className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base font-semibold text-gray-700 group-hover:text-green-500 transition-colors duration-200 whitespace-nowrap">
                  Dashboard
                </span>
              </Link>
            </DockIcon>
          )}
          {/* GitHub */}
          <DockIcon>
            <a
              href="https://github.com/some1uknow/ezdeploy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-full text-gray-600 hover:text-purple-500 transition-colors duration-200 group px-4"
              title="GitHub Repository"
            >
              <Github className="w-8 h-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 mr-3" />
              <span className="text-base font-semibold text-gray-700 group-hover:text-purple-500 transition-colors duration-200 whitespace-nowrap">
                GitHub
              </span>
            </a>
          </DockIcon>
        </Dock>
      </motion.div>{" "}
      {/* Brand Logo - Fixed top left */}
      <motion.div
        className="fixed top-6 left-6 z-50 flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        <Link
          href="/"
          className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg px-4 py-3 hover:shadow-xl transition-all duration-200"
        >
          <Rocket className="w-6 h-6 text-indigo-600" />
          <span className="text-lg font-bold text-gray-800">EzDeploy</span>
        </Link>
      </motion.div>{" "}
      {/* Authentication Buttons - Fixed top right */}
      <motion.div
        className="fixed top-6 right-6 z-50 flex items-center space-x-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        {isPending ? (
          <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg px-4 py-3">
            <div className="w-6 h-6 animate-pulse bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium text-gray-400">
              Loading...
            </span>
          </div>
        ) : session ? (
          <div className="flex items-center space-x-3">
            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg px-4 py-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                {
                  (session.user.name || session.user.email || "User").split(
                    " "
                  )[0]
                }
              </span>
            </div>
            {/* Sign Out Button */}
            <ShimmerButton
              onClick={handleSignOut}
              className="px-4 py-3 text-sm font-medium"
              background="linear-gradient(135deg, #ef4444, #dc2626)"
              shimmerColor="#ffffff"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </ShimmerButton>
          </div>
        ) : (
          <ShimmerButton
            onClick={() => router.push("/signin")}
            className="px-4 py-3 text-sm font-medium"
            background="linear-gradient(135deg, #6366f1, #8b5cf6)"
            shimmerColor="#ffffff"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </ShimmerButton>
        )}
      </motion.div>
      {/* Mobile Navigation Fallback */}
      <div className="md:hidden">
        {" "}
        <motion.div
          className="fixed top-6 left-24 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </motion.div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="absolute top-20 left-4 right-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-6"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="space-y-4">
                <Link
                  href="/"
                  className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>{" "}
                <Link
                  href="#features"
                  className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Features</span>
                </Link>
                <Link
                  href="/documentation"
                  className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Book className="w-5 h-5" />
                  <span className="font-medium">Documentation</span>
                </Link>
                {session && (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}
                <a
                  href="https://github.com/some1uknow/ezdeploy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                >
                  <Github className="w-5 h-5" />
                  <span className="font-medium">GitHub</span>
                </a>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {session ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {session.user.name || session.user.email}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 p-3 w-full text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/signin"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>{" "}
          </motion.div>
        )}
      </div>
    </div>
  );
}
