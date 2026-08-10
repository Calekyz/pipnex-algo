import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // Fetch from Clerk and create
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
      redirect('/sign-up');
    }
  }

  // ---- Redirect based on status ----
  // PENDING → show sign-up (code entry)
  if (user.status === 'PENDING' || user.status === 'EXPIRED') {
    redirect('/sign-up');
  }
  // PENDING_VERIFICATION → show payment page (if using pipnex-algo1)
  if (user.status === 'PENDING_VERIFICATION') {
    redirect('/payment');
  }

  // ---- ONLY ACTIVE USERS SEE THE DASHBOARD ----
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-700">PipnexAi Algo</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Credits: {user.credits || 0}</span>
            <form action="/api/auth/sign-out" method="POST">
              <Button variant="ghost" size="sm">Sign Out</Button>
            </form>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">AI Trading Analysis</h1>
        <p className="text-gray-600 mb-6">Select a currency pair to get real-time AI-powered analysis.</p>
        <DashboardClient pairs={FOREX_PAIRS} initialCredits={user.credits || 0} />
      </div>
    </div>
  );
}
