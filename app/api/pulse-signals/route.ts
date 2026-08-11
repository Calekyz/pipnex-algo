import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { getRealTimePrice, getTechnicalIndicators } from '@/lib/twelvedata';
import { generatePulseSignals } from '@/lib/ai-analysis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for all pairs

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account not active' }, { status: 403 });
    }

    // Check credits (costs 2 credits for all pairs)
    if (user.credits < 2) {
      return NextResponse.json(
        { error: 'Insufficient credits. Requires 2 credits for all pairs.' },
        { status: 402 }
      );
    }

    const { pairs } = await req.json();

    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json({ error: 'Pairs are required' }, { status: 400 });
    }

    // Fetch market data for all pairs in parallel
    const priceDataMap: any = {};
    const indicatorsMap: any = {};

    await Promise.all(
      pairs.map(async (pair: any) => {
        try {
          const [price, indicators] = await Promise.all([
            getRealTimePrice(pair.value),
            getTechnicalIndicators(pair.value),
          ]);
          priceDataMap[pair.value] = price;
          indicatorsMap[pair.value] = indicators;
        } catch (err) {
          console.error(`Failed to fetch data for ${pair.value}:`, err);
          priceDataMap[pair.value] = null;
          indicatorsMap[pair.value] = null;
        }
      })
    );

    // Generate signals
    const signals = await generatePulseSignals(pairs, priceDataMap, indicatorsMap);

    // Deduct 2 credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 2 } },
    });

    return NextResponse.json({
      success: true,
      signals,
      creditsRemaining: user.credits - 2,
    });
  } catch (error: any) {
    console.error('Pulse signals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signals' },
      { status: 500 }
    );
  }
}
