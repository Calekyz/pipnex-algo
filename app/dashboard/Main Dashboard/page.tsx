import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from '../DashboardClient';
import StatsCards from '@/components/dashboard/StatsCards';
import MarketPulse from '@/components/dashboard/MarketPulse';

export const dynamic = 'force-dynamic';

export default async function MainDashboardPage() {
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Main Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome to PipnexAi Algo — Your all-in-one AI trading intelligence platform
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards credits={user.credits || 0} />

      {/* Start AI Trading Button */}
      <div className="flex justify-center">
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
          🚀 Start AI Trading
        </Button>
      </div>

      {/* Market Pulse */}
      <MarketPulse pairs={FOREX_PAIRS.slice(0, 6)} />

      {/* Main Analysis Client */}
      <DashboardClient pairs={FOREX_PAIRS} initialCredits={user.credits || 0} />
    </div>
  );
}
