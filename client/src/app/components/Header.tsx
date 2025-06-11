'use client';

import { useState } from 'react';
import { Menu, X, Github, ArrowUpRight, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-black tracking-tight cursor-pointer">
                  Ez<span className="text-gray-600">Deploy</span>
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-gray-600 hover:text-black transition-colors duration-200 font-medium"
            >
              Features
            </Link>
            <Link 
              href="/documentation" 
              className="text-gray-600 hover:text-black transition-colors duration-200 font-medium"
            >
              Documentation
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
              <span className="font-medium">GitHub</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <Link
              href="/signin"
              className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </nav>          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-100">
              <Link
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/documentation"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="/deploy"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Deploy
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-black transition-colors duration-200"
              >
                <Github className="w-4 h-4" />
                <span className="font-medium">GitHub</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <Link
                href="/signin"
                className="flex items-center space-x-2 mx-3 my-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
