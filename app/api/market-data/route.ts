import { NextRequest, NextResponse } from 'next/server';
import { getRealTimePrice, getHistoricalData, getTechnicalIndicators } from '@/lib/twelvedata';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get('symbol') || 'EUR/USD';

    console.log('📊 Market Data API called for:', symbol);

    // Check if Twelve Data API key exists
    if (!process.env.TWELVE_DATA_API_KEY) {
      console.error('❌ TWELVE_DATA_API_KEY is missing!');
      return NextResponse.json(
        { error: 'Twelve Data API key is not configured' },
        { status: 500 }
      );
    }

    const [price, history, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getHistoricalData(symbol),
      getTechnicalIndicators(symbol),
    ]);

    console.log('💰 Price:', price ? 'Received' : 'Failed');

    return NextResponse.json({
      price,
      history: history?.slice(0, 20) || [],
      indicators,
    });
  } catch (error: any) {
    console.error('❌ Market data error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch market data: ' + error.message },
      { status: 500 }
    );
  }
}
