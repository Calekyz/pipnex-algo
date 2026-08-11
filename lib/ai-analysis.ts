import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Existing Analysis Schema (for single pair)
const AnalysisSchema = z.object({
  trend: z.enum(['Bullish', 'Bearish', 'Neutral']),
  support_level: z.string(),
  resistance_level: z.string(),
  entry_price: z.string(),
  stop_loss: z.string(),
  take_profit: z.string(),
  confidence: z.number().min(0).max(100),
  rationale: z.string(),
});

// NEW: Signal Schema for Pulse Signals
const SignalSchema = z.object({
  direction: z.enum(['BUY', 'SELL']),
  entry_price: z.string(),
  stop_loss: z.string(),
  take_profit: z.string(),
  pips: z.number(),
  confidence: z.number().min(0).max(100),
  rationale: z.string(),
});

export async function generateForexAnalysis(symbol: string, priceData: any, indicators: any) {
  const prompt = `
    You are PipnexAi Algo, a senior Forex analyst with 20 years of experience.
    Analyze the following real market data for ${symbol}:

    Current Price: ${priceData?.price || 'N/A'}
    Change: ${priceData?.change || 'N/A'}%
    RSI (14): ${indicators?.rsi || 'N/A'}
    SMA (20): ${indicators?.sma || 'N/A'}
    MACD: ${indicators?.macd || 'N/A'}

    Provide a professional trading analysis. Be conservative, highlight risks, and give clear entry/exit levels.
  `;

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: AnalysisSchema,
    prompt: prompt,
  });

  return object;
}

// NEW: Generate Pulse Signal for a single pair (with pip calculation)
export async function generatePulseSignal(symbol: string, priceData: any, indicators: any) {
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

    Be conservative and realistic.
  `;

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: SignalSchema,
    prompt: prompt,
  });

  return object;
}

// NEW: Generate signals for multiple pairs
export async function generatePulseSignals(pairs: { label: string; value: string }[], priceDataMap: any, indicatorsMap: any) {
  const signals: any[] = [];

  for (const pair of pairs) {
    const priceData = priceDataMap[pair.value];
    const indicators = indicatorsMap[pair.value];

    if (!priceData || !indicators) {
      signals.push({
        pair: pair.label,
        symbol: pair.value,
        error: 'No data available',
      });
      continue;
    }

    try {
      const signal = await generatePulseSignal(pair.value, priceData, indicators);
      signals.push({
        pair: pair.label,
        symbol: pair.value,
        ...signal,
        currentPrice: priceData.price,
        change: priceData.change,
      });
    } catch (error) {
      console.error(`Failed to generate signal for ${pair.value}:`, error);
      signals.push({
        pair: pair.label,
        symbol: pair.value,
        error: 'Failed to generate signal',
      });
    }
  }

  return signals;
}

// Helper: Calculate pips manually (fallback if AI doesn't calculate)
export function calculatePips(symbol: string, entry: number, stopLoss: number): number {
  const pipSize = symbol.includes('JPY') ? 0.01 : 0.0001;
  const diff = Math.abs(entry - stopLoss);
  return Math.round(diff / pipSize);
}

// Helper: Format price based on pair
export function formatPrice(symbol: string, price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'N/A';
  
  const decimals = symbol.includes('JPY') ? 3 : 5;
  return num.toFixed(decimals);
}
