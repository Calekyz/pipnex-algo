import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

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
