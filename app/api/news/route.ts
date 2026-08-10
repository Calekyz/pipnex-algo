import { NextResponse } from 'next/server';
import { getMarketNewsAndEvents } from '@/lib/finnhub';

export async function GET() {
  try {
    const data = await getMarketNewsAndEvents();
    return NextResponse.json(data);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news and events' },
      { status: 500 }
    );
  }
}
