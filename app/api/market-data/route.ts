import { NextRequest, NextResponse } from 'next/server';
import { getRealTimePrice, getHistoricalData, getTechnicalIndicators } from '@/lib/twelvedata';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get('symbol') || 'EUR/USD';

    if (!process.env.TWELVE_DATA_API_KEY) {
      console.error('TWELVE_DATA_API_KEY is missing');
      return NextResponse.json(
        { error: 'Market data service not configured' },
        { status: 503 }
      );
    }

    const [price, history, indicators] = await Promise.all([
      getRealTimePrice(symbol),
      getHistoricalData(symbol),
      getTechnicalIndicators(symbol),
    ]);

    if (!price) {
      return NextResponse.json(
        { error: `No data returned for ${symbol}. Please check the symbol or your API key.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      price,
      history: history?.slice(0, 20) || [],
      indicators,
    });
  } catch (error: any) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
