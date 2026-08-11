import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import SubscriptionClient from './SubscriptionClient';

export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Calculate days left
  let daysLeft = 0;
  let expiryDate = null;
  let plan = user.plan || 'Free';
  let credits = user.credits || 0;

  if (user.planExpiry) {
    const now = new Date();
    const expiry = new Date(user.planExpiry);
    const diff = expiry.getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    expiryDate = expiry;
  }

  // Plan details
  const planDetails = {
    'PRO': {
      name: 'Pro',
      price: '$30',
      period: '½ month',
      color: 'blue',
      features: [
        '15 Chart Uploads per day',
        'Advanced Chart Analysis',
        'Multi-Timeframe Analysis',
        'PipNex Pulse Signals (2/day, in-app)',
        'AI News Trading Analysis (NFP/CPI)',
        'Position Size Calculator',
        '2 Custom AI Setups per day',
        'Smart Chart Analyzer',
        'Trading Journal',
        '24/7 Priority Support',
      ],
    },
    'GOLD': {
      name: 'Gold',
      price: '$99.99',
      period: 'month',
      color: 'yellow',
      features: [
        '24 Chart Uploads per day',
        'Multi-Timeframe Analysis',
        'Signal of the Day (90%+ accurate AI signal daily)',
        'PipNex Pulse Signals (2/day, in-app)',
        'AI News Trading Analysis (NFP/CPI)',
        'AI Strategy Builder',
        'PipNex PropPass',
        'Smart Chart Analyzer',
        'Unlimited Custom Setups',
        '24/7 Priority Support',
      ],
    },
    'PLATINUM': {
      name: 'Platinum',
      price: '$299.99',
      period: 'month',
      color: 'purple',
      features: [
        'Unlimited PipNex Pulse Signals (in-app)',
        'Direct AI Chart Analysis (no uploads)',
        'Prompt Trading UI',
        'MT5 Account Connection',
        '🤖 Run Bots Without PC (Cloud Bots)',
        '🚀 Auto Trading (2000 AI credits included)',
        '☁️ FREE VPS Included ($50/mo value)',
        'Voice-based AI Interaction',
        'AI reads account for journaling',
        'AI generates & executes strategies',
        'Unlimited MT5 accounts (10)',
        '24/7 Bot Monitoring & Alerts',
        'Priority AI processing',
        'White-glove support',
      ],
    },
  };

  const currentPlan = user.plan ? planDetails[user.plan as keyof typeof planDetails] : null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Subscription</h1>
        <p className="text-gray-500 text-sm">Manage your plan and payment details</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Account Holder</p>
              <p className="font-semibold text-gray-800">{user.name || 'User'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="font-semibold text-gray-800">
                {currentPlan ? (
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    currentPlan.color === 'yellow' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : currentPlan.color === 'purple'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentPlan.name}
                  </span>
                ) : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits Remaining</p>
              <p className="font-semibold text-gray-800">{credits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Countdown / Expiry Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⏳ Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          {user.planExpiry && daysLeft > 0 ? (
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-blue-600">{daysLeft}</div>
              <p className="text-gray-500 text-sm">Days Remaining</p>
              <p className="text-xs text-gray-400 mt-1">
                Expires: {new Date(user.planExpiry).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 max-w-md mx-auto">
                <div 
                  className={`h-2.5 rounded-full ${
                    daysLeft > 30 ? 'bg-green-500' :
                    daysLeft > 15 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                />
              </div>
            </div>
          ) : user.planExpiry && daysLeft === 0 ? (
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-red-500">Expired</div>
              <p className="text-gray-500 text-sm">Your subscription has expired. Please renew.</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-400">No Active Plan</div>
              <p className="text-gray-500 text-sm">Subscribe to a plan to unlock full features.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Plan Details */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Your Plan: {currentPlan.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UpgradeCard
            name="Pro"
            price="$30"
            period="½ month"
            color="blue"
            plan="pro"
            features={['15 Chart Uploads/day', 'Advanced Chart Analysis', 'Multi-Timeframe Analysis', '24/7 Priority Support']}
          />
          <UpgradeCard
            name="Gold"
            price="$99.99"
            period="month"
            color="yellow"
            plan="gold"
            features={['24 Chart Uploads/day', 'Signal of the Day (90%+ accurate)', 'AI Strategy Builder', 'Unlimited Custom Setups']}
            popular={true}
          />
          <UpgradeCard
            name="Platinum"
            price="$299.99"
            period="month"
            color="purple"
            plan="platinum"
            features={['Cloud Bots', 'Auto Trading (2000 AI credits)', 'FREE VPS Included', 'Voice-based AI Interaction']}
          />
        </div>
      </div>

      {/* Payment Instructions */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">💳</span> Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* M-Pesa */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-700 flex items-center gap-2">
                <span className="text-xl">🇰🇪</span> M-Pesa
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="text-gray-600">Till Number:</span> <span className="font-mono font-bold text-lg text-green-700">3722030</span></p>
                <p><span className="text-gray-600">Amount:</span> <span className="font-bold">KES 2,500</span> (Pro) / <span className="font-bold">KES 12,000</span> (Gold) / <span className="font-bold">KES 35,000</span> (Platinum)</p>
                <p className="text-xs text-gray-500">Reference: Your email or full name</p>
              </div>
            </div>

            {/* Binance */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-700 flex items-center gap-2">
                <span className="text-xl">₿</span> Binance Pay
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="text-gray-600">Binance ID:</span> <span className="font-mono font-bold text-lg text-yellow-700">1067841957</span></p>
                <p><span className="text-gray-600">Amount:</span> <span className="font-bold">$30 USDT</span> (Pro) / <span className="font-bold">$99.99 USDT</span> (Gold) / <span className="font-bold">$299.99 USDT</span> (Platinum)</p>
                <p className="text-xs text-gray-500">Reference: Your email or full name</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📌 After payment, send your confirmation code or screenshot to <strong>support@pipnexai.com</strong> 
              or click the WhatsApp button below. Your account will be activated within 24 hours.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/254101606189?text=Hello%2C%20I%20want%20to%20subscribe%20to%20PipnexAi%20Algo.%20I%20have%20sent%20payment%20via%20M-Pesa%20%2F%20Binance.%20Please%20activate%20my%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              📱 Contact on WhatsApp
            </a>
            <a
              href="mailto:support@pipnexai.com?subject=Payment%20Confirmation&body=Hello%2C%20I%20have%20sent%20payment%20for%20PipnexAi%20Algo%20subscription.%0A%0AEmail%3A%20%0APlan%3A%20%0APayment%20Method%3A%20%0ATransaction%20Reference%3A%20"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              ✉️ Email Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Upgrade Card Component
// ============================================

function UpgradeCard({ 
  name, 
  price, 
  period, 
  color, 
  plan, 
  features, 
  popular 
}: { 
  name: string; 
  price: string; 
  period: string; 
  color: string; 
  plan: string; 
  features: string[]; 
  popular?: boolean;
}) {
  const colorClasses = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    yellow: {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      button: 'bg-yellow-500 hover:bg-yellow-600',
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Card className={`border-2 ${popular ? 'border-yellow-400 shadow-lg' : colors.border}`}>
      {popular && (
        <div className="bg-yellow-400 text-gray-900 text-xs font-bold text-center py-1 rounded-t-lg">
          ⭐ MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg text-center">{name}</CardTitle>
        <div className="text-center">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-gray-500 text-sm">/{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 mb-4">
          {features.map((feature, idx) => (
            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-green-500">✓</span> {feature}
            </li>
          ))}
        </ul>
        <Link href={`/payment?plan=${plan}`}>
          <Button className={`w-full ${colors.button} text-white`}>
            Upgrade to {name}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
