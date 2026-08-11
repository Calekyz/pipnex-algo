import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure Zillionaire EA exists in bot list
    const existingBot = await prisma.bot.findFirst({
      where: { name: 'Zillionaire EA' },
    });

    if (!existingBot) {
      await prisma.bot.create({
        data: {
          name: 'Zillionaire EA',
          description: 'Advanced Martingale EA with sequence trading, recovery mode, and trailing stops. Trades in sequences of 3 trades with martingale progression.',
          type: 'EA',
          strategy: 'Martingale Sequence',
          riskLevel: 'HIGH',
          performance: '+156% in 2024 (Backtested)',
          icon: '💰',
          color: 'gold',
          isActive: true,
          isRunning: false,
        },
      });
    }

    // Get all bots (global and user-specific)
    const bots = await prisma.bot.findMany({
      where: {
        OR: [
          { userId: null },
          { userId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ bots });
  } catch (error: any) {
    console.error('Get bots error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}
