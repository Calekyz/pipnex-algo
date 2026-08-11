import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all related data
    await prisma.$transaction([
      prisma.supportMessage.deleteMany({
        where: { ticket: { userId: user.id } },
      }),
      prisma.supportTicket.deleteMany({
        where: { userId: user.id },
      }),
      prisma.userLicense.deleteMany({
        where: { userId: user.id },
      }),
      prisma.paymentProof.deleteMany({
        where: { userId: user.id },
      }),
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    // Note: Clerk user is not deleted automatically.
    // Users must delete their Clerk account separately or admin can delete it.

    return NextResponse.json({
      success: true,
      message: 'Account deleted from database. Please delete your Clerk account separately.',
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
