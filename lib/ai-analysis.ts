import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define the expected structure (matching your old Zod schema)
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

export async function generateForexAnalysis(
  symbol: string,
  priceData: any,
  indicators: any
): Promise<AnalysisResult> {
  // 1. Use the Flash model (fast and cheap) or Pro for higher quality
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash', // or 'gemini-1.5-pro'
    generationConfig: {
      responseMimeType: 'application/json', // Forces Gemini to output valid JSON
      temperature: 0.2, // Lower temperature for more deterministic trading logic
    },
  });

  // 2. Build the prompt
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

  // 3. Generate content
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // 4. Parse the JSON (Gemini guarantees valid JSON due to the config)
  try {
    return JSON.parse(responseText) as AnalysisResult;
  } catch (error) {
    console.error('Failed to parse Gemini response:', responseText);
    // Fallback in case of malformed response
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
