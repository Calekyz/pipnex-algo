'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Image with MORE visibility */}
        <div className="absolute inset-0">
          <Image
            src="https://i.postimg.cc/jqNxmpDF/Forex-Trading-and-Chart-Wallpapers-Collection.jpg"
            alt="Forex Trading Background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-gray-800/75 to-gray-900/85"></div>
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Navigation */}
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

        {/* Hero Content */}
        <main className="relative z-10 container mx-auto px-4 py-16 md:py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6">
              <span className="text-sm text-blue-200 font-medium">
                🚀 Next-Gen Forex AI Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered Forex
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Trading Intelligence
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Get real-time AI-driven market analysis, support/resistance levels, 
              and actionable trading signals for major currency pairs.
            </p>

            {/* Stats - Horizontal after title */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400">3K+</div>
                <div className="text-xs md:text-sm text-gray-400">Traders Reached</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400">Global</div>
                <div className="text-xs md:text-sm text-gray-400">Market Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400">Fast</div>
                <div className="text-xs md:text-sm text-gray-400">Responsive AI</div>
              </div>
            </div>

            {/* Start Trading Button - Yellow/Orange Gradient */}
            <Link href="/sign-up">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 hover:from-yellow-500 hover:via-orange-600 hover:to-yellow-700 text-white font-bold text-lg px-10 py-7 rounded-full shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
              >
                🚀 Start Trading Today
              </Button>
            </Link>
          </div>
        </main>
      </section>

      {/* ========== WHY CHOOSE PIPNEX - DROPDOWN ========== */}
      <section className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <button
            onClick={() => setFaqOpen(!faqOpen)}
            className="w-full max-w-2xl mx-auto flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl px-6 py-4 hover:border-blue-400 transition-colors"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Why Choose <span className="text-blue-400">PipnexAi Algo</span>
            </h2>
            {faqOpen ? <ChevronUp className="text-blue-400" size={24} /> : <ChevronDown className="text-blue-400" size={24} />}
          </button>

          {faqOpen && (
            <div className="max-w-2xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon="📊"
                title="Advanced AI Analysis"
                description="Real-time market analysis with 90%+ accuracy on entry/exit signals."
              />
              <FeatureCard
                icon="⚡"
                title="Nova Edge EA Systems"
                description="Swing market scalps, hedges, and automated strategies."
              />
              <FeatureCard
                icon="📱"
                title="Mobile App Ready"
                description="Install the app on your phone and trade anywhere, anytime."
              />
              <FeatureCard
                icon="🔒"
                title="Enterprise Security"
                description="Bank-grade encryption and 24/7 monitoring."
              />
              <FeatureCard
                icon="📈"
                title="Multi-Timeframe Analysis"
                description="Analyze trends across multiple timeframes simultaneously."
              />
              <FeatureCard
                icon="🤖"
                title="Cloud Bots"
                description="Run automated trading bots 24/7 without a PC."
              />
            </div>
          )}
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section id="pricing" className="py-16 md:py-20 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Choose Your <span className="text-blue-400">Plan</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Start with our free trial or choose a plan that fits your trading style.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pro Plan - Blue/Silver */}
            <PricingCardPro
              name="Pro"
              description="For serious traders who need more power"
              price="$30"
              period="/ ½ month"
              features={[
                "15 Chart Uploads per day",
                "Advanced Chart Analysis",
                "Multi-Timeframe Analysis",
                "PipNex Pulse Signals (2/day, in-app)",
                "AI News Trading Analysis (NFP/CPI)",
                "Position Size Calculator",
                "2 Custom AI Setups per day",
                "Smart Chart Analyzer",
                "Trading Journal",
                "24/7 Priority Support",
              ]}
              popular={false}
            />

            {/* Gold Plan - Gold/Yellow */}
            <PricingCardGold
              name="Gold"
              description="Maximum performance and unlimited features"
              price="$99.99"
              period="/ month"
              features={[
                "24 Chart Uploads per day",
                "Multi-Timeframe Analysis",
                "Signal of the Day (90%+ accurate AI signal daily)",
                "PipNex Pulse Signals (2/day, in-app)",
                "AI News Trading Analysis (NFP/CPI)",
                "AI Strategy Builder",
                "PipNex PropPass",
                "Smart Chart Analyzer",
                "Unlimited Custom Setups",
                "24/7 Priority Support",
              ]}
              popular={true}
            />

            {/* Platinum Plan - Purple/Platinum */}
            <PricingCardPlatinum
              name="Platinum"
              description="Run bots 24/7 without PC • Free VPS included"
              price="$299.99"
              period="/ month"
              features={[
                "Unlimited PipNex Pulse Signals (in-app)",
                "Direct AI Chart Analysis (no uploads)",
                "Prompt Trading UI",
                "MT5 Account Connection",
                "🤖 Run Bots Without PC (Cloud Bots)",
                "🚀 Auto Trading (2000 AI credits included)",
                "☁️ FREE VPS Included ($50/mo value)",
                "Voice-based AI Interaction",
                "AI reads account for journaling",
                "AI generates & executes strategies",
                "Unlimited MT5 accounts (10)",
                "24/7 Bot Monitoring & Alerts",
                "Priority AI processing",
                "White-glove support",
              ]}
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* ========== FLOATING WHATSAPP BUTTON ========== */}
      <a
        href="https://wa.me/254101606189?text=Hello%2C%20I%20want%20to%20subscribe%20to%20PipnexAi%20Algo.%20Please%20send%20me%20payment%20details%20for%20the%20following%20plan%3A"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-full shadow-xl shadow-green-500/40 hover:shadow-2xl hover:shadow-green-500/60 transition-all duration-300 hover:scale-105"
      >
        <MessageCircle size={22} />
        <span className="text-sm hidden sm:inline">Make Payment</span>
        <span className="text-sm sm:hidden">Pay</span>
      </a>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2026 PipnexAi Algo. Powered by AI. Not financial advice. Trade responsibly.
          </p>
          <div className="mt-2 text-xs text-gray-600">
            <span>M-Pesa Till: 3722030</span> · <span>Binance ID: 1067841957</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-400 transition-all">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <p className="text-gray-400 text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRICING CARDS WITH DIFFERENT COLORS
// ============================================

function PricingCardPro({ name, description, price, period, features, popular }: any) {
  return (
    <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 border ${popular ? 'border-blue-400' : 'border-gray-600'} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-blue-400">{price}</span>
          <span className="text-gray-400 text-sm ml-1">{period}</span>
        </div>
      </div>
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
      <Link href="/sign-up">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

function PricingCardGold({ name, description, price, period, features, popular }: any) {
  return (
    <div className={`relative bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border ${popular ? 'border-yellow-400' : 'border-yellow-600/30'} rounded-2xl p-6 shadow-xl shadow-yellow-500/10 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-1`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">
          ⭐ MOST POPULAR
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-yellow-300">{name}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-yellow-400">{price}</span>
          <span className="text-gray-400 text-sm ml-1">{period}</span>
        </div>
      </div>
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-yellow-400 mt-0.5">✓</span>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
      <Link href="/sign-up">
        <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-gray-900 font-bold transition-all">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

function PricingCardPlatinum({ name, description, price, period, features, popular }: any) {
  return (
    <div className={`relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border ${popular ? 'border-purple-400' : 'border-purple-600/30'} rounded-2xl p-6 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full">
          ELITE
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-purple-300">{name}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-purple-400">{price}</span>
          <span className="text-gray-400 text-sm ml-1">{period}</span>
        </div>
      </div>
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-purple-400 mt-0.5">✓</span>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
      <Link href="/sign-up">
        <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold transition-all">
          Get Started
        </Button>
      </Link>
    </div>
  );
}
