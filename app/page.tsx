import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function Home() {
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
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Features ↓
              </Button>
            </div>
          </div>
        </main>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">3K+</div>
              <div className="text-gray-400 mt-2">Traders Reached</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">Global</div>
              <div className="text-gray-400 mt-2">Market Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">Fast</div>
              <div className="text-gray-400 mt-2">Responsive AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why Choose <span className="text-blue-400">PipnexAi Algo</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon="📊"
              title="Advanced AI Analysis"
              description="Real-time market analysis with 90%+ accuracy on entry/exit signals."
            />
            <FeatureCard
              icon="⚡"
              title="Nova Edge EA Systems"
              description="Swing market scalps, hedges, and automated trading strategies."
            />
            <FeatureCard
              icon="📱"
              title="Mobile App Ready"
              description="Install the app on your phone and trade anywhere, anytime."
            />
            <FeatureCard
              icon="🔒"
              title="Secure & Reliable"
              description="Enterprise-grade security with 24/7 monitoring and support."
            />
            <FeatureCard
              icon="📈"
              title="Multi-Timeframe Analysis"
              description="Analyze trends across multiple timeframes for better decisions."
            />
            <FeatureCard
              icon="🤖"
              title="Cloud Bots"
              description="Run automated trading bots 24/7 without a PC. Free VPS included."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section with "Sign Up & Enter Code" */}
      <section className="py-20 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Choose Your <span className="text-blue-400">Plan</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Enter your activation code during sign-up to unlock your plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
              codePrefix="pro-"
              popular={false}
            />

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
              codePrefix="gold-"
              popular={true}
            />

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
              codePrefix="platinum-"
              popular={false}
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              Sign up now and enter your activation code to unlock your plan instantly.
              <br />
              Don't have a code? Contact us at <span className="text-blue-400">support@pipnexai.com</span>
            </p>
          </div>
        </div>
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

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-400 transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  description, 
  price, 
  period, 
  features, 
  codePrefix, 
  popular 
}: { 
  name: string; 
  description: string; 
  price: string; 
  period: string; 
  features: string[]; 
  codePrefix: string; 
  popular: boolean;
}) {
  return (
    <div className={`relative bg-gray-800/50 border ${popular ? 'border-blue-400' : 'border-gray-700'} rounded-2xl p-6 hover:border-blue-400 transition-all`}>
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

      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <Link href="/sign-up">
        <Button className={`w-full ${popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
          Sign Up & Enter Code
        </Button>
      </Link>
      <p className="text-xs text-gray-500 text-center mt-3">
        Code format: <span className="font-mono">{codePrefix}yourname</span>
      </p>
    </div>
  );
}
