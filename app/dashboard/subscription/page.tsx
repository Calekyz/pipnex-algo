import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Check, Crown, Sparkles, Zap, Calendar, Clock, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return redirect('/sign-in');
  }

  // Calculate days left
  let daysLeft = 0;
  let expiryDate = null;
  let isActive = false;

  if (user.planExpiry) {
    const now = new Date();
    const expiry = new Date(user.planExpiry);
    const diff = expiry.getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    expiryDate = expiry;
    isActive = daysLeft > 0;
  }

  // Plan details with new pricing
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$45',
      period: '½ month',
      days: 15,
      description: 'Perfect for testing the platform',
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
      features: [
        '15 Chart Uploads per day',
        'Advanced Chart Analysis',
        'Multi-Timeframe Analysis',
        'PipNex Pulse Signals (2/day)',
        'AI News Trading Analysis',
        'Position Size Calculator',
        '2 Custom AI Setups per day',
        'Smart Chart Analyzer',
        'Trading Journal',
        '24/7 Priority Support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$95',
      period: '1 month',
      days: 30,
      description: 'For serious traders',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'gold',
      popular: true,
      features: [
        '24 Chart Uploads per day',
        'Multi-Timeframe Analysis',
        'Signal of the Day (90%+ accurate)',
        'PipNex Pulse Signals (2/day)',
        'AI News Trading Analysis (NFP/CPI)',
        'AI Strategy Builder',
        'PipNex PropPass',
        'Smart Chart Analyzer',
        'Unlimited Custom Setups',
        '24/7 Priority Support',
      ],
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$195',
      period: '3 months',
      days: 90,
      description: 'Maximum performance',
      icon: <Crown className="w-6 h-6" />,
      color: 'purple',
      features: [
        'Unlimited PipNex Pulse Signals',
        'Direct AI Chart Analysis (no uploads)',
        'Prompt Trading UI',
        'MT5 Account Connection',
        '🤖 Run Bots Without PC (Cloud Bots)',
        '🚀 Auto Trading (2000 AI credits)',
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
  ];

  // Build the support message (URL-encoded)
  const getSupportMessage = (planName: string, price: string, period: string) => {
    const message = `Hello PipnexAi Algo Support,%0A%0AI would like to upgrade my subscription to the **${planName}** plan.%0A%0APlan Details:%0A• Plan: ${planName}%0A• Price: ${price}%0A• Duration: ${period}%0A%0APlease let me know how to proceed with the payment and activation.%0A%0AThank you!%0A%0A-- %0A${user.name || 'Trader'}%0A${user.email}`;
    return `/dashboard/contact-support?message=${message}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">💎 Subscription</h1>
        <p className="text-gray-500 text-sm">
          Choose the plan that fits your trading style
        </p>
      </div>

      {/* Current Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-2xl font-bold text-gray-800">
                {user.plan || 'Free'}
              </p>
              {isActive && expiryDate && (
                <p className="text-sm text-gray-600 mt-1">
                  <Clock className="inline w-4 h-4 mr-1" />
                  {daysLeft} days remaining
                </p>
              )}
              {!isActive && user.plan && (
                <p className="text-sm text-red-500 mt-1">Your plan has expired</p>
              )}
              {!user.plan && (
                <p className="text-sm text-gray-500 mt-1">No active subscription</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Credits</p>
              <p className="text-2xl font-bold text-blue-600">{user.credits}</p>
              <p className="text-xs text-gray-400">Available for analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            supportMessage={getSupportMessage(plan.name, plan.price, plan.period)}
            isCurrentPlan={user.plan === plan.name}
          />
        ))}
      </div>

      {/* Custom Plan Request */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-gray-700">Need a custom plan?</h3>
          <p className="text-sm text-gray-500 mt-1">
            Contact our support team for tailored solutions
          </p>
          <Link href="/dashboard/contact-support">
            <Button variant="outline" className="mt-3 border-blue-300 text-blue-600 hover:bg-blue-50">
              Contact Support
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold">⚠️ Important</p>
        <p>
          After clicking "Get Plan", you will be redirected to the support chat.
          Send the pre‑filled message to our team, and they will guide you through
          the payment process and activate your plan.
        </p>
      </div>
    </div>
  );
}

// ============================================
// Pricing Card Component
// ============================================

function PricingCard({
  plan,
  supportMessage,
  isCurrentPlan,
}: {
  plan: any;
  supportMessage: string;
  isCurrentPlan: boolean;
}) {
  const colorMap = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-100 text-blue-700',
    },
    gold: {
      border: 'border-yellow-400',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      button: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
      badge: 'bg-yellow-100 text-yellow-700',
    },
    purple: {
      border: 'border-purple-300',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-100 text-purple-700',
    },
  };

  const colors = colorMap[plan.color as keyof typeof colorMap] || colorMap.blue;

  return (
    <Card
      className={`relative border-2 ${colors.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        plan.popular ? 'shadow-lg' : ''
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
          ⭐ MOST POPULAR
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className={`w-12 h-12 mx-auto rounded-full ${colors.bg} flex items-center justify-center mb-3`}>
          <div className={colors.text}>{plan.icon}</div>
        </div>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <p className="text-sm text-gray-500">{plan.description}</p>
        <div className="mt-2">
          <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
          <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{plan.days} days access</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {plan.features.slice(0, 8).map((feature: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
          {plan.features.length > 8 && (
            <li className="text-xs text-gray-400 text-center pt-1">
              +{plan.features.length - 8} more features
            </li>
          )}
        </ul>

        {isCurrentPlan ? (
          <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
            ✓ Current Plan
          </Button>
        ) : (
          <Link href={supportMessage}>
            <Button className={`w-full ${colors.button} text-white font-semibold py-2 rounded-lg transition`}>
              Get Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}

        <p className="text-xs text-gray-400 text-center">
          {isCurrentPlan
            ? 'You are already on this plan'
            : 'Click to request this plan via support'}
        </p>
      </CardContent>
    </Card>
  );
}
