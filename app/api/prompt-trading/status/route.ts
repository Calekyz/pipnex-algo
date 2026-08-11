import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const runningInstances = await prisma.eAInstance.findMany({
      where: {
        userId: user.id,
        status: { in: ['RUNNING', 'ONLINE'] },
      },
      include: {
        bot: true,
        brokerAccount: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({ instances: runningInstances });
  } catch (error: any) {
    console.error('EA status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
