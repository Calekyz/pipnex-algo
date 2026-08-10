import { NextRequest, NextResponse } from 'next/server';
import { generateForexAnalysis } from '@/lib/ai-analysis';
import { getRealTimePrice, getTechnicalIndicators } from '@/lib/twelvedata';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
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

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account not active' }, { status: 403 });
    }

    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { symbol } = await req.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const [priceData, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getTechnicalIndicators(symbol),
    ]);

    if (!priceData) {
      return NextResponse.json({ error: 'Could not fetch market data' }, { status: 500 });
    }

    const analysis = await generateForexAnalysis(symbol, priceData, indicators);

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis. Please try again.' },
      { status: 500 }
    );
  }
}
