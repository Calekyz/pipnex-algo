import { NextRequest, NextResponse } from 'next/server';
import { generateForexAnalysis } from '@/lib/ai-analysis';
import { getRealTimePrice, getTechnicalIndicators } from '@/lib/twelvedata';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Analysis API called');

    const { userId } = await auth();

    if (!userId) {
      console.log('❌ No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ userId:', userId);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found, status:', user.status, 'credits:', user.credits);

    if (user.status !== 'ACTIVE') {
      console.log('❌ User not active');
      return NextResponse.json({ error: 'Account not active' }, { status: 403 });
    }

    if (user.credits <= 0) {
      console.log('❌ Insufficient credits');
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { symbol } = await req.json();

    if (!symbol) {
      console.log('❌ No symbol provided');
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    console.log('📊 Fetching market data for:', symbol);

    // Check if Twelve Data API key exists
    if (!process.env.TWELVE_DATA_API_KEY) {
      console.error('❌ TWELVE_DATA_API_KEY is missing!');
      return NextResponse.json(
        { error: 'Twelve Data API key is not configured' },
        { status: 500 }
      );
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is missing!');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const [priceData, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getTechnicalIndicators(symbol),
    ]);

    console.log('💰 Price data:', priceData ? 'Received' : 'Failed');
    console.log('📈 Indicators:', indicators ? 'Received' : 'Failed');

    if (!priceData) {
      console.error('❌ Failed to fetch price data');
      return NextResponse.json(
        { error: 'Could not fetch market data. Please check your Twelve Data API key.' },
        { status: 500 }
      );
    }

    console.log('🤖 Generating AI analysis...');
    const analysis = await generateForexAnalysis(symbol, priceData, indicators);

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    console.log('✅ Analysis generated successfully!');
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('❌ Analysis API error:', error.message);
    console.error('❌ Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to generate analysis. Please try again.' },
      { status: 500 }
    );
  }
}
