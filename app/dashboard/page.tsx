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
    // STEP 1: Get authenticated user
    const { userId } = await auth();
    console.log('Step 1: userId =', userId);

    if (!userId) {
      console.log('No userId, redirecting to sign-in');
      redirect('/sign-in');
    }

    // STEP 2: Try to find user in database
    console.log('Step 2: Looking up user in database...');
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    console.log('Step 2: User found =', user ? 'YES' : 'NO');

    // STEP 3: If user doesn't exist, create them
    if (!user) {
      console.log('Step 3: User not found, creating from Clerk...');
      
      // Fetch user details from Clerk
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (!clerkResponse.ok) {
        const errorText = await clerkResponse.text();
        console.error('Step 3: Clerk API error:', clerkResponse.status, errorText);
        throw new Error(`Clerk API error: ${clerkResponse.status}`);
      }

      const clerkUserData = await clerkResponse.json();
      console.log('Step 3: Clerk user data:', clerkUserData.email_addresses?.[0]?.email_address);

      const email = clerkUserData.email_addresses?.[0]?.email_address || '';
      const name = `${clerkUserData.first_name || ''} ${clerkUserData.last_name || ''}`.trim() || 'User';

      console.log('Step 3: Creating user with email:', email);
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          status: 'PENDING',
        },
      });
      console.log('Step 3: User created successfully!');
    }

    // STEP 4: Check user status
    console.log('Step 4: User status =', user.status);
    if (user.status === 'PENDING' || user.status === 'EXPIRED') {
      console.log('Step 4: Redirecting to sign-up (status =', user.status, ')');
      redirect('/sign-up');
    }

    // STEP 5: Show the dashboard
    console.log('Step 5: Rendering dashboard');
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
  } catch (error: any) {
    console.error('❌ DASHBOARD ERROR:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    // Fallback – show error with details (remove this after debugging)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl w-full text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">Unable to Load Dashboard</h1>
          <p className="text-gray-700 mb-4">There was an error loading your dashboard.</p>
          
          {/* ✅ Shows the actual error – remove after debugging */}
          <details className="text-left bg-gray-100 p-4 rounded-lg mb-4">
            <summary className="font-semibold cursor-pointer">Error Details</summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap overflow-x-auto">
              {error.message || 'Unknown error'}
            </pre>
          </details>

          <a href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Go to Home
          </a>
        </div>
      </div>
    );
  }
}
