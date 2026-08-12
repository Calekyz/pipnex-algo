import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Zod schema moved here since we removed the ai package
import { z } from 'zod';

const ChartAnalysisSchema = z.object({
  pattern: z.string().describe('The detected chart pattern (e.g., Head and Shoulders, Double Top, Flag)'),
  trend: z.enum(['Uptrend', 'Downtrend', 'Ranging']).describe('The overall trend direction'),
  support: z.string().describe('Key support level price'),
  resistance: z.string().describe('Key resistance level price'),
  entry: z.string().describe('Suggested entry price'),
  stopLoss: z.string().describe('Suggested stop loss price'),
  takeProfit: z.string().describe('Suggested take profit price'),
  confidence: z.number().min(0).max(100).describe('Confidence score for this analysis'),
  summary: z.string().describe('Brief summary of the analysis'),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD']).describe('Trading recommendation'),
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account not active' }, { status: 403 });
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Requires 1 credit per chart analysis.' },
        { status: 402 }
      );
    }

    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const symbol = (formData.get('symbol') as string) || 'EUR/USD';
    const timeframe = (formData.get('timeframe') as string) || '1h';

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // 1. Convert image to base64 for inline upload
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type || 'image/png';

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    // 3. Build the prompt
    const prompt = `
      You are PipnexAi Algo, a senior Forex chart analyst with 20 years of experience.

      Analyze the attached trading chart image for ${symbol} on the ${timeframe} timeframe.

      Please identify:
      1. The current chart pattern (e.g., Head and Shoulders, Double Top, Double Bottom, Flag, Triangle, Wedge, etc.)
      2. The overall trend direction (Uptrend, Downtrend, or Ranging)
      3. Key support and resistance levels (specific prices)
      4. Suggested entry price
      5. Suggested stop loss price (with proper risk management)
      6. Suggested take profit price (with proper risk-reward ratio)
      7. Confidence score (0-100) for your analysis
      8. A brief summary of your reasoning
      9. Trading recommendation (BUY, SELL, or HOLD)

      Return the response strictly as a JSON object with these exact keys:
      {
        "pattern": "string",
        "trend": "Uptrend" or "Downtrend" or "Ranging",
        "support": "string (e.g., 1.0845)",
        "resistance": "string (e.g., 1.0920)",
        "entry": "string (e.g., 1.0880)",
        "stopLoss": "string (e.g., 1.0840)",
        "takeProfit": "string (e.g., 1.0940)",
        "confidence": number,
        "summary": "string",
        "recommendation": "BUY" or "SELL" or "HOLD"
      }

      Be realistic and conservative. Always consider proper risk management.
    `;

    // 4. Send image + prompt to Gemini
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ]);

    const responseText = result.response.text();

    // 5. Parse and validate the response
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // 6. Validate against Zod schema
    const validationResult = ChartAnalysisSchema.safeParse(parsedResult);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return NextResponse.json(
        { error: 'AI response validation failed' },
        { status: 500 }
      );
    }

    // 7. Deduct 1 credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json({
      ...validationResult.data,
      creditsRemaining: user.credits - 1,
    });
  } catch (error: any) {
    console.error('Chart analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze chart. Please try again.' },
      { status: 500 }
    );
  }
}
