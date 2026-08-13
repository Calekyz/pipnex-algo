import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: Receive analytics from EA
export async function POST(req: NextRequest) {
  try {
    // 1. Get API key from header
    const apiKey = req.headers.get('x-api-key');
    const platformApiKey = process.env.PLATFORM_API_KEY;

    // Log for debugging (remove in production)
    console.log('Received API Key:', apiKey);
    console.log('Expected API Key:', platformApiKey);

    if (!platformApiKey) {
      console.error('PLATFORM_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API key not set' },
        { status: 500 }
      );
    }

    if (apiKey !== platformApiKey) {
      console.error('❌ Invalid API key:', apiKey);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    const data = await req.json();
    const { clientId, accountType, positions, ...analytics } = data;

    if (!clientId) {
      console.error('❌ Missing clientId');
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    console.log(`📥 Received analytics for client: ${clientId}`);

    // 3. Upsert analytics
    const analyticsRecord = await prisma.eAAnalytics.upsert({
      where: { clientId },
      update: {
        accountType: accountType || 'Demo',
        balance: analytics.balance || 0,
        equity: analytics.equity || 0,
        profit: analytics.profit || 0,
        openPositions: analytics.openPositions || 0,
        totalTrades: analytics.totalTrades || 0,
        winningTrades: analytics.winningTrades || 0,
        losingTrades: analytics.losingTrades || 0,
        winRate: analytics.winRate || 0,
        sequencesCompleted: analytics.sequencesCompleted || 0,
        currentSequence: analytics.currentSequence || 0,
        tradesInSequence: analytics.tradesInSequence || 0,
        tradesPerSequence: analytics.tradesPerSequence || 0,
        inRecoveryMode: analytics.inRecoveryMode || false,
        currentLot: analytics.currentLot || 0,
        drawdown: analytics.drawdown || 0,
        dailyLoss: analytics.dailyLoss || 0,
        gridActive: analytics.gridActive || false,
        gridAdditions: analytics.gridAdditions || 0,
        maxGridAdditions: analytics.maxGridAdditions || 0,
        positions: positions || [],
        updatedAt: new Date(),
      },
      create: {
        clientId,
        accountType: accountType || 'Demo',
        balance: analytics.balance || 0,
        equity: analytics.equity || 0,
        profit: analytics.profit || 0,
        openPositions: analytics.openPositions || 0,
        totalTrades: analytics.totalTrades || 0,
        winningTrades: analytics.winningTrades || 0,
        losingTrades: analytics.losingTrades || 0,
        winRate: analytics.winRate || 0,
        sequencesCompleted: analytics.sequencesCompleted || 0,
        currentSequence: analytics.currentSequence || 0,
        tradesInSequence: analytics.tradesInSequence || 0,
        tradesPerSequence: analytics.tradesPerSequence || 0,
        inRecoveryMode: analytics.inRecoveryMode || false,
        currentLot: analytics.currentLot || 0,
        drawdown: analytics.drawdown || 0,
        dailyLoss: analytics.dailyLoss || 0,
        gridActive: analytics.gridActive || false,
        gridAdditions: analytics.gridAdditions || 0,
        maxGridAdditions: analytics.maxGridAdditions || 0,
        positions: positions || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Analytics updated for ${clientId}`);
    return NextResponse.json({ success: true, message: 'Analytics updated' });
  } catch (error: any) {
    console.error('POST /api/ea-analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save analytics' },
      { status: 500 }
    );
  }
}

// GET: Retrieve analytics for a specific client (unchanged)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = req.nextUrl.searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId required' },
        { status: 400 }
      );
    }

    const analytics = await prisma.eAAnalytics.findUnique({
      where: { clientId },
    });

    if (!analytics) {
      return NextResponse.json(
        { error: 'No analytics found for this client' },
        { status: 404 }
      );
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('GET /api/ea-analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
