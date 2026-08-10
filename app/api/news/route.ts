import { NextResponse } from 'next/server';
import { getMarketNewsAndEvents } from '@/lib/finnhub';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('📰 News API called');

    // Check if Finnhub API key exists
    if (!process.env.FINNHUB_API_KEY) {
      console.warn('⚠️ FINNHUB_API_KEY is missing! Returning fallback data.');
      return NextResponse.json({
        news: [
          {
            headline: '📊 CPI Data Coming Soon',
            summary: 'CPI data will be available on August 12th. Check back for updates.',
            source: 'PipnexAi Algo',
            datetime: new Date().toISOString(),
            url: '#',
            image: null,
          },
          {
            headline: '📈 Forex Markets Update',
            summary: 'Markets are awaiting key economic data this week.',
            source: 'PipnexAi Algo',
            datetime: new Date().toISOString(),
            url: '#',
            image: null,
          },
        ],
        events: [
          {
            country: 'US',
            event: 'CPI (Consumer Price Index)',
            date: new Date('2026-08-12').toISOString(),
            actual: null,
            previous: '3.2%',
            forecast: '3.1%',
            impact: 'High',
          },
          {
            country: 'US',
            event: 'FOMC Meeting Minutes',
            date: new Date('2026-08-14').toISOString(),
            actual: null,
            previous: null,
            forecast: null,
            impact: 'High',
          },
        ],
      });
    }

    const data = await getMarketNewsAndEvents();
    console.log('📰 News received:', data.news?.length || 0, 'items');
    console.log('📅 Events received:', data.events?.length || 0, 'items');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ News API error:', error.message);
    // Return fallback data instead of error
    return NextResponse.json({
      news: [
        {
          headline: '📊 Market Data Update',
          summary: 'Economic data is currently being refreshed. Please check back later.',
          source: 'PipnexAi Algo',
          datetime: new Date().toISOString(),
          url: '#',
          image: null,
        },
      ],
      events: [
        {
          country: 'US',
          event: 'CPI (Consumer Price Index) - August 12',
          date: new Date('2026-08-12').toISOString(),
          actual: null,
          previous: '3.2%',
          forecast: '3.1%',
          impact: 'High',
        },
      ],
    });
  }
}
