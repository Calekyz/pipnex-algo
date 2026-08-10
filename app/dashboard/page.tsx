import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from './DashboardClient';

// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // STEP 1: Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  // STEP 2: Find or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // STEP 3: If user doesn't exist, create them
  if (!user) {
    const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (clerkResponse.ok) {
      const clerkUserData = await clerkResponse.json();
      const email = clerkUserData.email_addresses?.[0]?.email_address || '';
      const name = `${clerkUserData.first_name || ''} ${clerkUserData.last_name || ''}`.trim() || 'User';

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          status: 'PENDING',
          credits: 0,
        },
      });
    } else {
      // If Clerk API fails, redirect to sign-up
      return redirect('/sign-up');
    }
  }

  // STEP 4: Check user status - REDIRECT (outside try-catch)
  if (user.status === 'PENDING' || user.status === 'EXPIRED') {
    return redirect('/sign-up');
  }

  // STEP 5: Show dashboard (only for ACTIVE users)
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-700">PipnexAi Algo</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Credits: {user.credits || 0}
            </span>
            <form action="/api/auth/sign-out" method="POST">
              <Button variant="ghost" size="sm">Sign Out</Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">AI Trading Analysis</h1>
        <p className="text-gray-600 mb-6">
          Select a currency pair to get real-time AI-powered analysis.
        </p>

        <DashboardClient pairs={FOREX_PAIRS} initialCredits={user.credits || 0} />
      </div>
    </div>
  );
}
