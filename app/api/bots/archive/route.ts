import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId } = await req.json();

    if (!botId) {
      return NextResponse.json({ error: 'botId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the bot – ensure it belongs to the user (or is global, but we only allow archive of user-owned bots)
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        OR: [
          { userId: user.id }, // only user-owned bots can be archived
        ],
      },
    });

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found or you do not have permission to archive it' },
        { status: 404 }
      );
    }

    // Archive the bot
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: { isArchived: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Bot archived successfully',
      bot: updatedBot,
    });
  } catch (error: any) {
    console.error('Archive bot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to archive bot' },
      { status: 500 }
    );
  }
}
