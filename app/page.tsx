'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://i.postimg.cc/jqNxmpDF/Forex-Trading-and-Chart-Wallpapers-Collection.jpg"
            alt="Forex Trading Background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://i.postimg.cc/TYFKgV5s/Chat-GPT-Image-Aug-9-2026-05-52-20-PM.png"
              alt="PipnexAi Algo Logo"
              width={50}
              height={50}
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">
                PipnexAi <span className="text-blue-400">Algo</span>
              </span>
              <span className="block text-[10px] text-blue-300/70 tracking-widest uppercase">
                AI Trading Intelligence
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-up" className="text-blue-300 hover:text-blue-200 text-sm">
              Sign Up
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-blue-500 text-white hover:bg-blue-600 font-semibold px-6">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                    Dashboard
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </nav>

        <main className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6">
              <span className="text-sm text-blue-200 font-medium">🚀 Next-Gen Forex AI Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered Forex
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Trading Intelligence
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get real-time AI-driven market analysis, support/resistance levels, 
              and actionable trading signals for major currency pairs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-500 text-white hover:bg-blue-600 text-lg px-8 font-semibold shadow-xl hover:shadow-2xl transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10 text-lg px-8"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Features ↓
              </Button>
            </div>
          </div>
        </main>
      </section>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2026 PipnexAi Algo. Powered by AI. Not financial advice. Trade responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}
