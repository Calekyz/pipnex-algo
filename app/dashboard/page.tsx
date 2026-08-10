import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { FOREX_PAIRS } from '@/lib/twelvedata';
import { Button } from '@/components/ui/button';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return redirect('/sign-in');
    }

    // Try to find the user in your database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user doesn't exist, create them automatically
    if (!user) {
      // Fetch user details from Clerk
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

      // Create user in your database
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          status: 'PENDING', // They haven't paid yet
        },
      });
    }

    // Check user status
    if (user.status === 'PENDING' || user.status === 'EXPIRED') {
      return redirect('/sign-up');
    }

    // If active, show dashboard
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
    console.error('Dashboard page error:', error);
    // Fallback: show error but don't crash the whole app
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">⚠️ Dashboard Error</h1>
          <p className="text-gray-700">We couldn't load your dashboard. Please try refreshing the page.</p>
          <p className="text-sm text-gray-500 mt-2">If the problem persists, contact support.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh
          </Button>
        </div>
      </div>
    );
  }
}
