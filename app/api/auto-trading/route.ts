import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all bots (global and user-specific)
    const bots = await prisma.bot.findMany({
      where: {
        OR: [
          { userId: null }, // Global bots
          { userId: userId }, // User's own bots
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
