import { NextRequest, NextResponse } from 'next/server';
import { getRealTimePrice, getHistoricalData, getTechnicalIndicators } from '@/lib/twelvedata';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') || 'EUR/USD';

  try {
    const [price, history, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getHistoricalData(symbol),
      getTechnicalIndicators(symbol),
    ]);

    return NextResponse.json({
      price,
      history: history.slice(0, 20),
      indicators,
    });
  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
