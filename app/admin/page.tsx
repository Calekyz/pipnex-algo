import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import AdminClient from './AdminClient';

// ✅ Force dynamic rendering – admin page uses auth()
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect('/sign-in');
    }

    // Check if user is admin
    const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!clerkResponse.ok) {
      console.error('Clerk API error:', await clerkResponse.text());
      throw new Error('Could not verify admin status');
    }

    const clerkUser = await clerkResponse.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(userEmail)) {
      console.log(`User ${userEmail} is not admin. Redirecting to dashboard.`);
      redirect('/dashboard');
    }

    // Get all users (for admin overview)
    const allUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">PipnexAi Algo - Admin Panel</h1>
            <div className="flex gap-4">
              <a href="/admin/generate-codes" className="text-blue-600 hover:text-blue-800">
                Generate Codes
              </a>
              <form action="/api/auth/sign-out" method="POST">
                <Button variant="ghost" size="sm">Sign Out</Button>
              </form>
            </div>
          </div>

          <AdminClient users={allUsers} />
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Admin page error:', error);
    // Fallback – show error with details (remove after debugging)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl w-full text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">Admin Panel Error</h1>
          <p className="text-gray-700 mb-4">There was an error loading the admin panel.</p>
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
