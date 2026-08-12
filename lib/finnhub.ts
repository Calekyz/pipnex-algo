const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// ============================================
// 1. Get Forex News
// ============================================
export async function getForexNews() {
  try {
    if (!API_KEY) {
      console.warn('FINNHUB_API_KEY is missing, returning fallback news');
      return getFallbackNews();
    }
    const url = `${BASE_URL}/news?category=forex&token=${API_KEY}`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Finnhub news error: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 20).map((item: any) => ({
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      datetime: new Date(item.datetime * 1000).toISOString(),
      url: item.url,
      image: item.image,
    }));
  } catch (error) {
    console.error('Finnhub news error:', error);
    return getFallbackNews();
  }
}

// ============================================
// 2. Get Economic Calendar
// ============================================
export async function getEconomicCalendar() {
  try {
    if (!API_KEY) {
      console.warn('FINNHUB_API_KEY is missing, returning fallback events');
      return getFallbackEvents();
    }
    const today = new Date();
    const fromDate = today.toISOString().split('T')[0];
    const toDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const url = `${BASE_URL}/calendar/economic?from=${fromDate}&to=${toDate}&token=${API_KEY}`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Finnhub calendar error: ${res.status}`);
    const data = await res.json();
    const events = (data.economicCalendar || [])
      .filter((event: any) => event.impact === 'High' || event.impact === 'Medium')
      .slice(0, 20)
      .map((event: any) => ({
        country: event.country,
        event: event.event,
        date: event.date,
        actual: event.actual || null,
        previous: event.previous || null,
        forecast: event.forecast || null,
        impact: event.impact,
      }));
    return events;
  } catch (error) {
    console.error('Finnhub calendar error:', error);
    return getFallbackEvents();
  }
}

// ============================================
// 3. Combined Function
// ============================================
export async function getMarketNewsAndEvents() {
  const [news, events] = await Promise.all([
    getForexNews(),
    getEconomicCalendar(),
  ]);
  return { news, events };
}

// ============================================
// 4. Fallback Data (when API key missing or fails)
// ============================================
function getFallbackNews() {
  return [
    {
      headline: '📊 Forex Market Update',
      summary: 'Markets are consolidating ahead of key economic data releases. Stay tuned for updates.',
      source: 'PipnexAi Algo',
      datetime: new Date().toISOString(),
      url: '#',
      image: null,
    },
    {
      headline: '📈 USD Strengthens on Hawkish Fed Comments',
      summary: 'The US dollar gained against major peers after Federal Reserve officials signaled a cautious approach to rate cuts.',
      source: 'PipnexAi Algo',
      datetime: new Date(Date.now() - 3600000).toISOString(),
      url: '#',
      image: null,
    },
  ];
}

function getFallbackEvents() {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return [
    {
      country: 'US',
      event: 'CPI (Consumer Price Index)',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual: null,
      previous: '3.2%',
      forecast: '3.1%',
      impact: 'High',
    },
    {
      country: 'US',
      event: 'FOMC Meeting Minutes',
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual: null,
      previous: null,
      forecast: null,
      impact: 'High',
    },
    {
      country: 'EU',
      event: 'ECB Interest Rate Decision',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual: null,
      previous: '4.50%',
      forecast: '4.25%',
      impact: 'High',
    },
  ];
}
