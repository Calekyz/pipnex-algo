'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ========== HERO SECTION ========== */}
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
            <Link href="#pricing" className="text-blue-300 hover:text-blue-200 text-sm hidden md:inline">
              Pricing
            </Link>
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
              <span className="text-sm text-blue-200 font-medium">
                🚀 Next-Gen Forex AI Platform
              </span>
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
                onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Features ↓
              </Button>
            </div>
          </div>
        </main>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section id="stats" className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400">3K+</div>
              <div className="text-gray-400 mt-2">Traders Reached</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400">Global</div>
              <div className="text-gray-400 mt-2">Market Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400">Fast</div>
              <div className="text-gray-400 mt-2">Responsive AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE PIPNEX AI ALGO ========== */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Why Choose <span className="text-blue-400">PipnexAi Algo</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Advanced AI technology combined with professional trading strategies to give you the edge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon="📊"
              title="Advanced AI Analysis"
              description="Real-time market analysis with 90%+ accuracy on entry/exit signals using cutting-edge AI models."
            />
            <FeatureCard
              icon="⚡"
              title="Nova Edge EA Systems"
              description="Advanced algorithmic trading systems designed for swing market scalps, hedges, and automated strategies."
            />
            <FeatureCard
              icon="📱"
              title="Mobile App Ready"
              description="Install the app on your phone and trade anywhere, anytime with full platform functionality."
            />
            <FeatureCard
              icon="🔒"
              title="Enterprise Security"
              description="Bank-grade encryption and 24/7 monitoring to keep your data and funds secure."
            />
            <FeatureCard
              icon="📈"
              title="Multi-Timeframe Analysis"
              description="Analyze trends across multiple timeframes simultaneously for better decision making."
            />
            <FeatureCard
              icon="🤖"
              title="Cloud Bots"
              description="Run automated trading bots 24/7 without a PC. Free VPS included with select plans."
            />
          </div>
        </div>
      </section>

      {/* ========== WHY TRADERS CHOOSE ========== */}
      <section className="py-20 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Why Traders Choose <span className="text-blue-400">PipnexAi Algo</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Join thousands of traders who trust our AI-powered platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AdvantageCard
              icon="🎯"
              title="90%+ Signal Accuracy"
              description="Our AI models deliver highly accurate entry and exit signals validated by real market data."
            />
            <AdvantageCard
              icon="⚡"
              title="Real-Time Analysis"
              description="Get instant market insights powered by Twelve Data and OpenAI's latest models."
            />
            <AdvantageCard
              icon="🔧"
              title="Nova Edge EA Integration"
              description="Professional algorithmic trading systems for scalping, hedging, and swing trading."
            />
            <AdvantageCard
              icon="📱"
              title="Mobile & Web Access"
              description="Access your account from any device with our responsive web platform and mobile app."
            />
            <AdvantageCard
              icon="📊"
              title="Multi-Asset Coverage"
              description="Analyze major currency pairs, commodities, and indices from a single platform."
            />
            <AdvantageCard
              icon="🛡️"
              title="Risk Management Tools"
              description="Position size calculator, stop-loss recommendations, and risk analysis built-in."
            />
            <AdvantageCard
              icon="📰"
              title="News & Economic Calendar"
              description="Stay ahead of market-moving events with real-time news and economic data."
            />
            <AdvantageCard
              icon="🤝"
              title="24/7 Priority Support"
              description="Get dedicated support from our team whenever you need assistance."
            />
          </div>
        </div>
      </section>

      {/* ========== REVIEWS SECTION ========== */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            What Traders Say About <span className="text-blue-400">PipnexAi Algo</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Real reviews from real traders who use our platform every day.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <TestimonialCard
              name="John M."
              role="Forex Trader"
              text="PipnexAi Algo transformed my trading. The AI signals are incredibly accurate and the cloud bots run flawlessly. I've doubled my profits in 3 months."
              rating={5}
            />
            <TestimonialCard
              name="Sarah K."
              role="Professional Trader"
              text="The Nova Edge EA system is a game-changer. I've been using it for 6 months and my consistency has never been better. Highly recommended!"
              rating={5}
            />
            <TestimonialCard
              name="David R."
              role="Swing Trader"
              text="Finally a platform that combines AI analysis with automated execution. The VPS included is a huge bonus. Best investment I've made."
              rating={5}
            />
          </div>

          {/* Review Submission */}
          <div className="max-w-2xl mx-auto mt-12 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Share Your Experience</h3>
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section id="pricing" className="py-20 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Choose Your <span className="text-blue-400">Plan</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Start with our free trial or choose a plan that fits your trading style.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pro Plan */}
            <PricingCard
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
              planKey="pro"
              popular={false}
            />

            {/* Gold Plan - Most Popular */}
            <PricingCard
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
              planKey="gold"
              popular={true}
            />

            {/* Platinum Plan */}
            <PricingCard
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
              planKey="platinum"
              popular={false}
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              All plans include a 7-day free trial. No credit card required.
              <br />
              Need help choosing? <span className="text-blue-400">Contact our team</span>
            </p>
          </div>
        </div>
      </section>

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
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-400 transition-all group">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function AdvantageCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 bg-gray-900/50 border border-gray-700 rounded-xl p-4 hover:border-blue-400 transition-all">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        <p className="text-gray-400 text-xs">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, text, rating }: { name: string; role: string; text: string; rating: number }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-400 transition-all">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
      </div>
      <p className="text-gray-300 text-sm mb-4">"{text}"</p>
      <div>
        <p className="text-white font-semibold">{name}</p>
        <p className="text-gray-400 text-xs">{role}</p>
      </div>
    </div>
  );
}

function ReviewForm() {
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the review to your API
    console.log('Review submitted:', { name, review, rating });
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setReview('');
      setRating(5);
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-center">
        <p className="text-green-400 font-medium">✅ Thank you for your review!</p>
        <p className="text-gray-400 text-sm">Your feedback helps us improve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Your Name</label>
          <Input
            type="text"
            placeholder="e.g., John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value={5}>⭐⭐⭐⭐⭐</option>
            <option value={4}>⭐⭐⭐⭐</option>
            <option value={3}>⭐⭐⭐</option>
            <option value={2}>⭐⭐</option>
            <option value={1}>⭐</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Your Review</label>
        <textarea
          rows={3}
          placeholder="Write your experience with PipnexAi Algo..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
        Submit Review
      </Button>
    </form>
  );
}

function PricingCard({
  name,
  description,
  price,
  period,
  features,
  planKey,
  popular,
}: {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  planKey: string;
  popular: boolean;
}) {
  return (
    <div
      className={`relative bg-gray-900/50 border ${
        popular ? 'border-blue-400' : 'border-gray-700'
      } rounded-2xl p-6 hover:border-blue-400 transition-all flex flex-col`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-gray-400 text-sm ml-1">{period}</span>
        </div>
      </div>

      <div className="space-y-2 mb-6 flex-grow">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <Link href="/sign-up">
        <Button
          className={`w-full ${
            popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          Get Started
        </Button>
      </Link>
      <p className="text-xs text-gray-500 text-center mt-3">
        7-day free trial · No credit card required
      </p>
    </div>
  );
}
