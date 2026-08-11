import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });

    if (!clerkRes.ok) {
      return NextResponse.json({ error: 'Could not verify admin status' }, { status: 500 });
    }

    const clerkUser = await clerkRes.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId: targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user and all related data
    await prisma.$transaction([
      // Delete UserLicense records
      prisma.userLicense.deleteMany({ where: { userId: targetUserId } }),
      // Finally delete the User
      prisma.user.delete({ where: { id: targetUserId } }),
    ]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
