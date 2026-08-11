import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, type, strategy, riskLevel, performance, icon, color } = await req.json();

    // Validate required fields
    if (!name || !description || !type || !strategy || !riskLevel) {
      return NextResponse.json(
        { error: 'Name, description, type, strategy, and risk level are required' },
        { status: 400 }
      );
    }

    // Check if bot name already exists for this user
    const existingBot = await prisma.bot.findFirst({
      where: {
        name,
        userId: userId,
      },
    });

    if (existingBot) {
      return NextResponse.json(
        { error: 'You already have a bot with this name' },
        { status: 400 }
      );
    }

    const bot = await prisma.bot.create({
      data: {
        name,
        description,
        type,
        strategy,
        riskLevel,
        performance: performance || 'N/A',
        icon: icon || '🤖',
        color: color || 'blue',
        isActive: true,
        isRunning: false,
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      bot,
      message: 'Bot added successfully',
    });
  } catch (error: any) {
    console.error('Add bot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add bot' },
      { status: 500 }
    );
  }
}
