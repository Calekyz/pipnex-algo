import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find running EA instance
    const instance = await prisma.eAInstance.findFirst({
      where: {
        userId: user.id,
        brokerAccountId: accountId,
        status: { in: ['RUNNING', 'ONLINE'] },
      },
      include: {
        bot: true,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'No running EA found on this account' },
        { status: 404 }
      );
    }

    // Update instance status
    await prisma.eAInstance.update({
      where: { id: instance.id },
      data: {
        status: 'STOPPED',
        stoppedAt: new Date(),
      },
    });

    // Update bot status
    await prisma.bot.update({
      where: { id: instance.botId },
      data: { isRunning: false },
    });

    // Here you would signal the trading engine to stop the EA

    return NextResponse.json({
      success: true,
      message: `${instance.bot.name} stopped successfully`,
    });
  } catch (error: any) {
    console.error('Stop EA error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop EA' },
      { status: 500 }
    );
  }
}
