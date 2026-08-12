const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// ============================================
// Helper: Calculate SMA (Simple Moving Average)
// ============================================
function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// ============================================
// Helper: Calculate RSI (Relative Strength Index)
// ============================================
function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i - 1] - prices[i];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i - 1] - prices[i];
    if (change >= 0) avgGain = (avgGain * (period - 1) + change) / period;
    else avgLoss = (avgLoss * (period - 1) - change) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// ============================================
// 1. Get Real-Time Quote (unchanged)
// ============================================
export async function getRealTimePrice(symbol: string) {
  try {
    if (!API_KEY) return null;
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

// ============================================
// 2. Get Historical Candles
// ============================================
export async function getHistoricalData(symbol: string, interval: string = '5min') {
  try {
    if (!API_KEY) return [];
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

// ============================================
// 3. Get Technical Indicators (with local fallback)
// ============================================
export async function getTechnicalIndicators(symbol: string) {
  try {
    if (!API_KEY) {
      // Fallback to local calculation if we can get history
      const history = await getHistoricalData(symbol);
      if (history.length > 0) {
        const closes = history.map((c: any) => parseFloat(c.close));
        const rsi = calculateRSI(closes, 14);
        const sma = calculateSMA(closes, 20);
        return { rsi: rsi?.toFixed(2) || null, sma: sma?.toFixed(5) || null, macd: null };
      }
      return { rsi: null, sma: null, macd: null };
    }

    // Try to fetch from Twelve Data API
    const [rsiData, smaData, macdData] = await Promise.all([
      fetch(`${BASE_URL}/rsi?symbol=${encodeURIComponent(symbol)}&time_period=14&apikey=${API_KEY}`).then(r => r.json()).catch(() => null),
      fetch(`${BASE_URL}/sma?symbol=${encodeURIComponent(symbol)}&time_period=20&apikey=${API_KEY}`).then(r => r.json()).catch(() => null),
      fetch(`${BASE_URL}/macd?symbol=${encodeURIComponent(symbol)}&fast=12&slow=26&apikey=${API_KEY}`).then(r => r.json()).catch(() => null),
    ]);

    let rsi = rsiData?.values?.[0]?.rsi || null;
    let sma = smaData?.values?.[0]?.sma || null;
    let macd = macdData?.values?.[0]?.macd || null;

    // If any indicator is null, calculate locally
    const history = await getHistoricalData(symbol);
    if (history.length > 0) {
      const closes = history.map((c: any) => parseFloat(c.close));
      if (!rsi) rsi = calculateRSI(closes, 14)?.toFixed(2) || null;
      if (!sma) sma = calculateSMA(closes, 20)?.toFixed(5) || null;
    }

    return { rsi, sma, macd };
  } catch (error) {
    console.error('Twelve Data indicators error:', error);
    return { rsi: null, sma: null, macd: null };
  }
}

// ============================================
// Complete Forex & Metals List (unchanged)
// ============================================
export const FOREX_PAIRS = [
  // Majors
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'NZD/USD', value: 'NZD/USD' },
  // Crosses
  { label: 'EUR/GBP', value: 'EUR/GBP' },
  { label: 'EUR/JPY', value: 'EUR/JPY' },
  { label: 'EUR/CHF', value: 'EUR/CHF' },
  { label: 'EUR/AUD', value: 'EUR/AUD' },
  { label: 'EUR/CAD', value: 'EUR/CAD' },
  { label: 'EUR/NZD', value: 'EUR/NZD' },
  { label: 'GBP/JPY', value: 'GBP/JPY' },
  { label: 'GBP/CHF', value: 'GBP/CHF' },
  { label: 'GBP/AUD', value: 'GBP/AUD' },
  { label: 'GBP/CAD', value: 'GBP/CAD' },
  { label: 'GBP/NZD', value: 'GBP/NZD' },
  { label: 'AUD/JPY', value: 'AUD/JPY' },
  { label: 'AUD/CHF', value: 'AUD/CHF' },
  { label: 'AUD/CAD', value: 'AUD/CAD' },
  { label: 'AUD/NZD', value: 'AUD/NZD' },
  { label: 'NZD/JPY', value: 'NZD/JPY' },
  { label: 'NZD/CHF', value: 'NZD/CHF' },
  { label: 'NZD/CAD', value: 'NZD/CAD' },
  { label: 'CHF/JPY', value: 'CHF/JPY' },
  { label: 'CAD/JPY', value: 'CAD/JPY' },
  // Exotics
  { label: 'USD/TRY', value: 'USD/TRY' },
  { label: 'USD/ZAR', value: 'USD/ZAR' },
  { label: 'USD/SGD', value: 'USD/SGD' },
  { label: 'USD/HKD', value: 'USD/HKD' },
  { label: 'USD/INR', value: 'USD/INR' },
  { label: 'USD/CNY', value: 'USD/CNY' },
  { label: 'USD/KRW', value: 'USD/KRW' },
  { label: 'USD/MXN', value: 'USD/MXN' },
  { label: 'USD/BRL', value: 'USD/BRL' },
  { label: 'USD/RUB', value: 'USD/RUB' },
  { label: 'USD/SEK', value: 'USD/SEK' },
  { label: 'USD/NOK', value: 'USD/NOK' },
  { label: 'USD/DKK', value: 'USD/DKK' },
  { label: 'USD/PLN', value: 'USD/PLN' },
  { label: 'USD/CZK', value: 'USD/CZK' },
  { label: 'USD/HUF', value: 'USD/HUF' },
  { label: 'USD/ILS', value: 'USD/ILS' },
  { label: 'USD/KES', value: 'USD/KES' },
  { label: 'USD/NGN', value: 'USD/NGN' },
  { label: 'USD/PHP', value: 'USD/PHP' },
  { label: 'USD/THB', value: 'USD/THB' },
  { label: 'USD/VND', value: 'USD/VND' },
  { label: 'USD/MYR', value: 'USD/MYR' },
  { label: 'USD/TWD', value: 'USD/TWD' },
  { label: 'USD/IDR', value: 'USD/IDR' },
  { label: 'USD/PKR', value: 'USD/PKR' },
  { label: 'USD/EGP', value: 'USD/EGP' },
  // Metals
  { label: 'Gold (XAU/USD)', value: 'XAU/USD' },
  { label: 'Silver (XAG/USD)', value: 'XAG/USD' },
  { label: 'Platinum (XPT/USD)', value: 'XPT/USD' },
  { label: 'Palladium (XPD/USD)', value: 'XPD/USD' },
  // Commodities
  { label: 'Brent Oil', value: 'BZ=F' },
  { label: 'WTI Oil', value: 'CL=F' },
  { label: 'Natural Gas', value: 'NG=F' },
  { label: 'Copper', value: 'HG=F' },
];

export const PULSE_PAIRS = FOREX_PAIRS.slice(0, 8);
export const METAL_PAIRS = FOREX_PAIRS.slice(52, 56);
export const MAJOR_PAIRS = FOREX_PAIRS.slice(0, 7);
