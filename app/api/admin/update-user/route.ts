import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });

    if (!clerkRes.ok) {
      return NextResponse.json({ error: 'Could not verify admin' }, { status: 500 });
    }

    const clerkUser = await clerkRes.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUserId, credits, plan, daysToAdd } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Update user
    const updateData: any = {};

    if (credits !== undefined) {
      updateData.credits = parseInt(credits);
    }

    if (plan) {
      updateData.plan = plan;
    }

    if (daysToAdd && daysToAdd > 0) {
      const currentExpiry = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { planExpiry: true },
      });

      const expiry = currentExpiry?.planExpiry || new Date();
      expiry.setDate(expiry.getDate() + parseInt(daysToAdd));
      updateData.planExpiry = expiry;
      updateData.status = 'ACTIVE';
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
