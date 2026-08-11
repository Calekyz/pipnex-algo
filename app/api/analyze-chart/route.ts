import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Schema for the chart analysis
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

export const maxDuration = 60; // Allow 60 seconds for image analysis

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

    // Check credits (costs 1 credit per chart analysis)
    if (user.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Requires 1 credit per chart analysis.' },
        { status: 402 }
      );
    }

    // Get the uploaded image
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const symbol = formData.get('symbol') as string || 'EUR/USD';
    const timeframe = formData.get('timeframe') as string || '1h';

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type || 'image/png';

    // Build the prompt
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
      
      Be realistic and conservative. Always consider proper risk management.
    `;

    // Call OpenAI Vision API
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: ChartAnalysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    // Deduct 1 credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json({
      ...object,
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
