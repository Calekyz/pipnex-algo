import { NextResponse } from 'next/server';
import { getMarketNewsAndEvents } from '@/lib/finnhub';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.FINNHUB_API_KEY) {
      console.warn('FINNHUB_API_KEY is missing. Serving fallback data.');
      // Fallback data is already handled inside getMarketNewsAndEvents
    }
    const data = await getMarketNewsAndEvents();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('News API error:', error);
    // Return fallback data instead of error
    return NextResponse.json({
      news: [
        {
          headline: '📊 Market Data Update',
          summary: 'The news service is temporarily unavailable. Please refresh or try again later.',
          source: 'PipnexAi Algo',
          datetime: new Date().toISOString(),
          url: '#',
          image: null,
        },
      ],
      events: [
        {
          country: 'US',
          event: 'CPI Data Coming Soon',
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          actual: null,
          previous: '3.2%',
          forecast: '3.1%',
          impact: 'High',
        },
      ],
    });
  }
}
