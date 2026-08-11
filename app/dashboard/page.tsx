import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from './DashboardClient';
import StatsCards from '@/components/dashboard/StatsCards';
import MarketPulse from '@/components/dashboard/MarketPulse';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // Create user with PENDING status (requires activation code)
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (clerkRes.ok) {
      const data = await clerkRes.json();
      const email = data.email_addresses?.[0]?.email_address || '';
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User';
      user = await prisma.user.create({
        data: { clerkId: userId, email, name, status: 'PENDING', credits: 0 },
      });
    } else {
      redirect('/sign-in');
    }
  }

  // ✅ CHECK STATUS – Redirect if not ACTIVE
  if (user.status !== 'ACTIVE') {
    console.log(`User ${user.email} is ${user.status}, redirecting to sign-up for code.`);
    redirect('/sign-up');
  }

  // ✅ User is ACTIVE – show dashboard
  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quick Access Tools</h1>
        <p className="text-gray-500 text-sm">
          Welcome to PipnexAi Algo — Your all-in-one AI trading intelligence platform
        </p>
      </div>
      <StatsCards credits={user.credits || 0} />
      <div className="flex justify-center">
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
          🚀 Start AI Trading
        </Button>
      </div>
      <MarketPulse pairs={FOREX_PAIRS.slice(0, 6)} />
      <DashboardClient pairs={FOREX_PAIRS} initialCredits={user.credits || 0} />
    </div>
  );
}
