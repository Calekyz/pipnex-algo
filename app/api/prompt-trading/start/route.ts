import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, accountId } = await req.json();

    if (!botId || !accountId) {
      return NextResponse.json(
        { error: 'botId and accountId are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify bot belongs to user or is global
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Verify account belongs to user
    const account = await prisma.brokerAccount.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if already running
    const existing = await prisma.eAInstance.findFirst({
      where: {
        userId: user.id,
        brokerAccountId: accountId,
        botId: botId,
        status: { in: ['RUNNING', 'ONLINE'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This EA is already running on this account' },
        { status: 400 }
      );
    }

    // Create EA instance
    const instance = await prisma.eAInstance.create({
      data: {
        userId: user.id,
        brokerAccountId: accountId,
        botId: botId,
        status: 'RUNNING',
        startedAt: new Date(),
        config: {
          // EA-specific settings, could be from bot config
        },
      },
    });

    // Update bot status
    await prisma.bot.update({
      where: { id: botId },
      data: { isRunning: true },
    });

    // Here you would trigger the trading engine to start the EA
    // This could be a webhook call to your VPS, or a message queue

    return NextResponse.json({
      success: true,
      instance,
      message: `${bot.name} started successfully on ${account.name}`,
    });
  } catch (error: any) {
    console.error('Start EA error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start EA' },
      { status: 500 }
    );
  }
}
