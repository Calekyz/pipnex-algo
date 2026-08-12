import { NextRequest, NextResponse } from 'next/server';
import { generateForexAnalysis } from '@/lib/ai-analysis';
import { getRealTimePrice, getTechnicalIndicators } from '@/lib/twelvedata';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. User & Credits
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account not active' }, { status: 403 });
    }
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // 3. Symbol
    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // 4. Check API keys (early feedback)
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.' },
        { status: 503 }
      );
    }
    if (!process.env.TWELVE_DATA_API_KEY) {
      console.error('TWELVE_DATA_API_KEY is missing');
      return NextResponse.json(
        { error: 'Market data service not configured.' },
        { status: 503 }
      );
    }

    // 5. Fetch market data
    console.log(`Fetching market data for ${symbol}...`);
    const [priceData, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getTechnicalIndicators(symbol),
    ]);
    if (!priceData) {
      return NextResponse.json(
        { error: 'Could not fetch market data. Please check your Twelve Data API key.' },
        { status: 500 }
      );
    }

    // 6. Generate AI analysis
    console.log(`Generating AI analysis for ${symbol}...`);
    const analysis = await generateForexAnalysis(symbol, priceData, indicators);

    // 7. Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    // 8. Return result
    return NextResponse.json({
      ...analysis,
      creditsRemaining: user.credits - 1,
    });
  } catch (error: any) {
    console.error('Analysis API error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
