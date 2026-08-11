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

    // Find the archived bot – ensure it belongs to the user
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        userId: user.id,
        isArchived: true,
      },
    });

    if (!bot) {
      return NextResponse.json(
        { error: 'Archived bot not found or you do not have permission' },
        { status: 404 }
      );
    }

    // Restore the bot
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: { isArchived: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Bot restored successfully',
      bot: updatedBot,
    });
  } catch (error: any) {
    console.error('Restore bot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore bot' },
      { status: 500 }
    );
  }
}
