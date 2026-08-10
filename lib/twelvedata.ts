const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export async function getRealTimePrice(symbol: string) {
  try {
    const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      price: data.price,
      change: data.percent_change,
      high: data.high,
      low: data.low,
      open: data.open,
      previous_close: data.previous_close,
      name: data.name,
    };
  } catch (error) {
    console.error('Twelve Data price error:', error);
    return null;
  }
}

export async function getHistoricalData(symbol: string, interval: string = '5min') {
  try {
    const url = `${BASE_URL}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=100&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.values || [];
  } catch (error) {
    console.error('Twelve Data history error:', error);
    return [];
  }
}

export async function getTechnicalIndicators(symbol: string) {
  try {
    const [rsiData, smaData, macdData] = await Promise.all([
      fetch(`${BASE_URL}/rsi?symbol=${encodeURIComponent(symbol)}&time_period=14&apikey=${API_KEY}`).then(r => r.json()).catch(() => null),
      fetch(`${BASE_URL}/sma?symbol=${encodeURIComponent(symbol)}&time_period=20&apikey=${API_KEY}`).then(r => r.json()).catch(() => null),
      fetch(`${BASE_URL}/macd?symbol=${encodeURIComponent(symbol)}&fast=12&slow=26&apikey=${API_KEY}`).then(r => r.json()).catch(() => null),
    ]);

    const rsi = rsiData?.values?.[0]?.rsi || null;
    const sma = smaData?.values?.[0]?.sma || null;
    const macd = macdData?.values?.[0]?.macd || null;

    return { rsi, sma, macd };
  } catch (error) {
    console.error('Twelve Data indicators error:', error);
    return { rsi: null, sma: null, macd: null };
  }
}

export const FOREX_PAIRS = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'NZD/USD', value: 'NZD/USD' },
  { label: 'EUR/GBP', value: 'EUR/GBP' },
  { label: 'EUR/JPY', value: 'EUR/JPY' },
  { label: 'GBP/JPY', value: 'GBP/JPY' },
];
