import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============================================
// TYPES
// ============================================

interface AnalysisResult {
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  support_level: string;
  resistance_level: string;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  confidence: number;
  rationale: string;
}

export interface PulseSignal {
  direction: 'BUY' | 'SELL';
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  pips: number;
  confidence: number;
  rationale: string;
  pair?: string;
  symbol?: string;
  currentPrice?: string;
  change?: string;
  error?: string;
}

// ============================================
// 1. FOREX ANALYSIS (Original)
// ============================================

export async function generateForexAnalysis(
  symbol: string,
  priceData: any,
  indicators: any
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const prompt = `
    You are PipnexAi Algo, a senior Forex analyst with 20 years of experience.
    Analyze the following real market data for ${symbol}:

    Current Price: ${priceData?.price || 'N/A'}
    Change: ${priceData?.change || 'N/A'}%
    RSI (14): ${indicators?.rsi || 'N/A'}
    SMA (20): ${indicators?.sma || 'N/A'}
    MACD: ${indicators?.macd || 'N/A'}

    Provide a professional trading analysis. Be conservative, highlight risks, and give clear entry/exit levels.

    Return the response strictly as a JSON object with these exact keys:
    {
      "trend": "Bullish" or "Bearish" or "Neutral",
      "support_level": "string (e.g., 1.0845)",
      "resistance_level": "string (e.g., 1.0920)",
      "entry_price": "string (e.g., 1.0880)",
      "stop_loss": "string (e.g., 1.0840)",
      "take_profit": "string (e.g., 1.0940)",
      "confidence": number (0-100),
      "rationale": "string (short reasoning)"
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText) as AnalysisResult;
  } catch (error) {
    console.error('Failed to parse Gemini response:', responseText);
    return {
      trend: 'Neutral',
      support_level: 'N/A',
      resistance_level: 'N/A',
      entry_price: 'N/A',
      stop_loss: 'N/A',
      take_profit: 'N/A',
      confidence: 50,
      rationale: 'Analysis failed to parse correctly.',
    };
  }
}

// ============================================
// 2. PULSE SIGNAL (Single Pair)
// ============================================

export async function generatePulseSignal(
  symbol: string,
  priceData: any,
  indicators: any
): Promise<PulseSignal> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const prompt = `
    You are PipnexAi Algo, a senior Forex analyst. Generate a trading signal for ${symbol}.

    Current Price: ${priceData?.price || 'N/A'}
    RSI: ${indicators?.rsi || 'N/A'}
    SMA: ${indicators?.sma || 'N/A'}
    MACD: ${indicators?.macd || 'N/A'}

    Provide:
    - Direction (BUY or SELL)
    - Entry Price (specific number)
    - Stop Loss (specific number)
    - Take Profit (specific number)
    - Pips (calculate the pip difference between entry and stop loss)
    - Confidence (1-100)
    - Brief rationale (1 sentence)

    Return the response strictly as a JSON object with these exact keys:
    {
      "direction": "BUY" or "SELL",
      "entry_price": "string (e.g., 1.0880)",
      "stop_loss": "string (e.g., 1.0840)",
      "take_profit": "string (e.g., 1.0940)",
      "pips": number,
      "confidence": number (0-100),
      "rationale": "string (short reasoning)"
    }

    Be conservative and realistic.
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText) as PulseSignal;
  } catch (error) {
    console.error('Failed to parse pulse signal response:', responseText);
    return {
      direction: 'BUY',
      entry_price: 'N/A',
      stop_loss: 'N/A',
      take_profit: 'N/A',
      pips: 0,
      confidence: 50,
      rationale: 'Signal generation failed.',
    };
  }
}

// ============================================
// 3. BATCH PULSE SIGNALS (Multiple Pairs)
// ============================================

export async function generatePulseSignals(
  pairs: { label: string; value: string }[],
  priceDataMap: Record<string, any>,
  indicatorsMap: Record<string, any>
): Promise<PulseSignal[]> {
  const signals: PulseSignal[] = [];

  for (const pair of pairs) {
    const priceData = priceDataMap[pair.value];
    const indicators = indicatorsMap[pair.value];

    if (!priceData || !indicators) {
      signals.push({
        direction: 'BUY',
        entry_price: 'N/A',
        stop_loss: 'N/A',
        take_profit: 'N/A',
        pips: 0,
        confidence: 0,
        rationale: 'No market data available',
        pair: pair.label,
        symbol: pair.value,
        error: 'No data available',
      });
      continue;
    }

    try {
      const signal = await generatePulseSignal(pair.value, priceData, indicators);
      signals.push({
        ...signal,
        pair: pair.label,
        symbol: pair.value,
        currentPrice: priceData.price,
        change: priceData.change,
      });
    } catch (error) {
      console.error(`Failed to generate signal for ${pair.value}:`, error);
      signals.push({
        direction: 'BUY',
        entry_price: 'N/A',
        stop_loss: 'N/A',
        take_profit: 'N/A',
        pips: 0,
        confidence: 0,
        rationale: 'Signal generation failed',
        pair: pair.label,
        symbol: pair.value,
        error: 'Failed to generate signal',
      });
    }
  }

  return signals;
}

// ============================================
// 4. HELPERS (Optional)
// ============================================

export function calculatePips(symbol: string, entry: number, stopLoss: number): number {
  const pipSize = symbol.includes('JPY') ? 0.01 : 0.0001;
  const diff = Math.abs(entry - stopLoss);
  return Math.round(diff / pipSize);
}

export function formatPrice(symbol: string, price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'N/A';
  const decimals = symbol.includes('JPY') ? 3 : 5;
  return num.toFixed(decimals);
}
