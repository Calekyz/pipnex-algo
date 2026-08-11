import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from './DashboardClient';
import StatsCards from '@/components/dashboard/StatsCards';
import MarketPulse from '@/components/dashboard/MarketPulse';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (clerkRes.ok) {
      const data = await clerkRes.json();
      const email = data.email_addresses?.[0]?.email_address || '';
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User';
      user = await prisma.user.create({
        data: { clerkId: userId, email, name, status: 'ACTIVE', credits: 50 },
      });
    } else {
      redirect('/sign-up');
    }
  }

  if (user.status === 'PENDING' || user.status === 'EXPIRED') {
    redirect('/sign-up');
  }

  return (
    <div className="space-y-6 pb-24">
      {/* ========== HEADER with Animated Emoji ========== */}
      <div className="flex items-center gap-3">
        <div className="text-4xl animate-emoji-switch">
          <span className="emoji-wave">👋</span>
          <span className="emoji-ai">🤖</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              PipnexAi Algo
            </span>
          </h1>
          <p className="text-gray-500 text-sm">
            Your all-in-one AI trading intelligence platform
          </p>
        </div>
      </div>

      {/* ========== STATS CARDS ========== */}
      <StatsCards credits={user.credits || 0} />

      {/* ========== START AI TRADING BUTTON ========== */}
      <div className="flex justify-center">
        <Link href="/dashboard/ai-trading">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-7 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            🚀 Start AI Trading
          </Button>
        </Link>
      </div>

      {/* ========== MARKET PULSE ========== */}
      <MarketPulse pairs={FOREX_PAIRS.slice(0, 6)} />

      {/* ========== MAIN ANALYSIS CLIENT ========== */}
      <DashboardClient pairs={FOREX_PAIRS} initialCredits={user.credits || 0} />
    </div>
  );
}
