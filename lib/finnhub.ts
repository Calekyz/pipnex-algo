const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export async function getForexNews() {
  try {
    const url = `${BASE_URL}/news?category=forex&token=${API_KEY}`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Finnhub news error: ${res.status}`);
    const data = await res.json();
    return data.slice(0, 10).map((item: any) => ({
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      datetime: new Date(item.datetime * 1000).toISOString(),
      url: item.url,
      image: item.image,
    }));
  } catch (error) {
    console.error('Finnhub news error:', error);
    return [];
  }
}

export async function getEconomicCalendar() {
  try {
    const today = new Date();
    const fromDate = today.toISOString().split('T')[0];
    const toDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const url = `${BASE_URL}/calendar/economic?from=${fromDate}&to=${toDate}&token=${API_KEY}`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Finnhub calendar error: ${res.status}`);
    const data = await res.json();
    const events = (data.economicCalendar || [])
      .filter((event: any) => event.impact === 'High' || event.impact === 'Medium')
      .slice(0, 10)
      .map((event: any) => ({
        country: event.country,
        event: event.event,
        date: event.date,
        actual: event.actual,
        previous: event.previous,
        forecast: event.forecast,
        impact: event.impact,
      }));
    return events;
  } catch (error) {
    console.error('Finnhub calendar error:', error);
    return [];
  }
}

export async function getMarketNewsAndEvents() {
  const [news, events] = await Promise.all([
    getForexNews(),
    getEconomicCalendar(),
  ]);
  return { news, events };
}
