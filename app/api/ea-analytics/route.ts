import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: Receive analytics from EA (used by the EA's WebRequest)
export async function POST(req: NextRequest) {
  try {
    // 1. Verify API key
    const apiKey = req.headers.get('x-api-key');
    const platformApiKey = process.env.PLATFORM_API_KEY;

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

    // 3. Upsert analytics in database
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

// GET: Retrieve analytics for a specific client
export async function GET(req: NextRequest) {
  try {
    // 1. Auth check (only logged-in users can fetch)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get clientId from query param
    const clientId = req.nextUrl.searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId required' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching analytics for client: ${clientId}`);

    // 3. Fetch from database
    const analytics = await prisma.eAAnalytics.findUnique({
      where: { clientId },
    });

    if (!analytics) {
      console.log(`❌ No analytics found for ${clientId}`);
      return NextResponse.json(
        { error: 'No analytics found for this client' },
        { status: 404 }
      );
    }

    console.log(`✅ Analytics found for ${clientId}`);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('GET /api/ea-analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
