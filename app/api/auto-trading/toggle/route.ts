import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, action } = await req.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });
    }

    // Verify bot belongs to user or is global
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        OR: [
          { userId: null },
          { userId: userId },
        ],
      },
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Update bot status
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: { isRunning: action === 'start' },
    });

    return NextResponse.json({
      success: true,
      bot: updatedBot,
      message: `Bot ${action === 'start' ? 'started' : 'stopped'} successfully`,
    });
  } catch (error: any) {
    console.error('Toggle bot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle bot' },
      { status: 500 }
    );
  }
}
