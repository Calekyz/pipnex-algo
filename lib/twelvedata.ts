const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// ============================================
// CORE API FUNCTIONS
// ============================================

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

// ============================================
// COMPLETE FOREX PAIRS (Majors, Minors, Exotics)
// ============================================

export const FOREX_PAIRS = [
  // ===== MAJORS =====
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'NZD/USD', value: 'NZD/USD' },

  // ===== MINORS (Crosses) =====
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

  // ===== EXOTICS (Emerging Markets) =====
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

  // ===== METALS (Precious Metals) =====
  { label: 'Gold (XAU/USD)', value: 'XAU/USD' },
  { label: 'Silver (XAG/USD)', value: 'XAG/USD' },
  { label: 'Platinum (XPT/USD)', value: 'XPT/USD' },
  { label: 'Palladium (XPD/USD)', value: 'XPD/USD' },

  // ===== COMMODITIES (CFDs – optional) =====
  { label: 'Brent Oil', value: 'BZ=F' },
  { label: 'WTI Oil', value: 'CL=F' },
  { label: 'Natural Gas', value: 'NG=F' },
  { label: 'Copper', value: 'HG=F' },
];

// ============================================
// SPECIAL LISTS FOR DIFFERENT FEATURES
// ============================================

export const PULSE_PAIRS = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
  { label: 'NZD/USD', value: 'NZD/USD' },
  { label: 'EUR/GBP', value: 'EUR/GBP' },
];

export const METAL_PAIRS = [
  { label: 'Gold (XAU/USD)', value: 'XAU/USD' },
  { label: 'Silver (XAG/USD)', value: 'XAG/USD' },
  { label: 'Platinum (XPT/USD)', value: 'XPT/USD' },
  { label: 'Palladium (XPD/USD)', value: 'XPD/USD' },
];

export const MAJOR_PAIRS = FOREX_PAIRS.slice(0, 7);
export const MINOR_PAIRS = FOREX_PAIRS.slice(7, 27);
export const EXOTIC_PAIRS = FOREX_PAIRS.slice(27, 52);
