import { NextRequest, NextResponse } from 'next/server';
import { generateForexAnalysis } from '@/lib/ai-analysis';
import { getRealTimePrice, getTechnicalIndicators } from '@/lib/twelvedata';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
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

  if (user.credits <= 0) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  const { symbol } = await req.json();

  try {
    const [priceData, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getTechnicalIndicators(symbol),
    ]);

    const analysis = await generateForexAnalysis(symbol, priceData, indicators);

    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
