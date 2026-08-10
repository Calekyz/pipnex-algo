import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from './DashboardClient';

// ✅ Force dynamic rendering – this page uses auth() which relies on headers
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect('/sign-in');
    }

    // Find user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user doesn't exist, create them
    if (!user) {
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (!clerkUser.ok) {
        console.error('Failed to fetch Clerk user:', await clerkUser.text());
        throw new Error('Could not retrieve user from Clerk');
      }

      const clerkUserData = await clerkUser.json();
      const email = clerkUserData.email_addresses?.[0]?.email_address || '';
      const name = `${clerkUserData.first_name || ''} ${clerkUserData.last_name || ''}`.trim() || 'User';

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          status: 'PENDING',
        },
      });
    }

    // Check status
    if (user.status === 'PENDING' || user.status === 'EXPIRED') {
      redirect('/sign-up');
    }

    // Dashboard
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
  } catch (error) {
    console.error('Dashboard error:', error);
    // Fallback – show error but don't crash
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">Unable to Load Dashboard</h1>
          <p className="text-gray-700">There was an error loading your dashboard. Please refresh or try again later.</p>
          <a href="/" className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Go to Home
          </a>
        </div>
      </div>
    );
  }
}
