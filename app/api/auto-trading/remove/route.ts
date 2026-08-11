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
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });
    }

    // Verify bot belongs to user
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        userId: userId,
      },
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found or unauthorized' }, { status: 404 });
    }

    await prisma.bot.delete({
      where: { id: botId },
    });

    return NextResponse.json({
      success: true,
      message: 'Bot removed successfully',
    });
  } catch (error: any) {
    console.error('Remove bot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove bot' },
      { status: 500 }
    );
  }
}
