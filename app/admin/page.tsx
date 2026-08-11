import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect('/sign-in');
    }

    // Check admin
    const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });

    if (!clerkResponse.ok) {
      console.error('Clerk API error:', await clerkResponse.text());
      throw new Error('Could not verify admin status');
    }

    const clerkUser = await clerkResponse.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(userEmail)) {
      redirect('/dashboard');
    }

    // Get all data
    const [allUsers, openTickets] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          supportTickets: {
            where: { status: 'OPEN' },
            include: {
              messages: {
                where: { isRead: false, sender: 'USER' },
              },
            },
          },
        },
      }),
      prisma.supportTicket.findMany({
        where: { status: 'OPEN' },
        include: {
          user: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
    ]);

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">PipnexAi Algo - Admin Panel</h1>
            <div className="flex gap-4">
              <a href="/admin/generate-codes" className="text-blue-600 hover:text-blue-800">
                Generate Codes
              </a>
              <a href="/admin/chat" className="text-green-600 hover:text-green-800">
                Support Chat ({openTickets.length})
              </a>
              <form action="/api/auth/sign-out" method="POST">
                <Button variant="ghost" size="sm">Sign Out</Button>
              </form>
            </div>
          </div>

          <AdminClient users={allUsers} openTickets={openTickets} />
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Admin page error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl w-full text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">Admin Panel Error</h1>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <a href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Go to Home
          </a>
        </div>
      </div>
    );
  }
}
