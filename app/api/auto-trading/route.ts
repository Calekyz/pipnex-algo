import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const includeArchived = url.searchParams.get('includeArchived') === 'true';

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ============================================
    // All 6 EA Bots (including PipNex AI)
    // ============================================
    const EA_BOTS = [
      {
        name: 'Zillionaire EA',
        description: 'Advanced Martingale EA with sequence trading, recovery mode, and trailing stops. Trades in sequences of 3 trades with martingale progression. Built for consistent returns with managed risk.',
        type: 'EA',
        strategy: 'Martingale Sequence',
        riskLevel: 'HIGH',
        performance: '+156% Backtested in 2026',
        icon: '💰',
        color: 'gold',
      },
      {
        name: 'PipNex AI',
        description: 'Complete martingale EA with sequence trading, recovery mode, trailing stops, and optional grid averaging. Trades in sequences of 2‑5 trades with martingale lot progression. Designed for consistent returns with robust risk management.',
        type: 'EA',
        strategy: 'Martingale Sequence + Grid Averaging',
        riskLevel: 'HIGH',
        performance: '+167% Backtested in 2026',
        icon: '🤖',
        color: 'blue',
      },
      {
        name: 'Nova Edge AI',
        description: 'Next-generation AI-powered swing trading bot that uses machine learning to identify high-probability setups. Adapts to market conditions in real-time with advanced Fibonacci pattern recognition.',
        type: 'AI',
        strategy: 'Machine Learning Pattern Recognition',
        riskLevel: 'MODERATE',
        performance: '+98% Backtested in 2026',
        icon: '🧠',
        color: 'purple',
      },
      {
        name: 'Kairon Scalper Aggressive',
        description: 'High-frequency scalping EA designed for fast-moving markets. Executes multiple small trades with tight stop losses to capture quick profits. Optimized for low-spread accounts with martingale recovery.',
        type: 'SCALPER',
        strategy: 'High-Frequency Scalping',
        riskLevel: 'HIGH',
        performance: '+210% Backtested in 2026',
        icon: '⚡',
        color: 'orange',
      },
      {
        name: 'Kairon Swing Master',
        description: 'Professional swing trading EA that captures medium-term trends. Uses Fibonacci retracement levels and price action to identify optimal entry and exit points. Designed for 4H and Daily timeframes.',
        type: 'SWING',
        strategy: 'Fibonacci Retracement & Price Action',
        riskLevel: 'MODERATE',
        performance: '+132% Backtested in 2026',
        icon: '📈',
        color: 'teal',
      },
      {
        name: 'Straddle AI',
        description: 'Advanced volatility-based trading bot that uses a straddle strategy to profit from market breakouts. Combines AI-driven volatility analysis with Fibonacci levels for precise entry execution.',
        type: 'AI',
        strategy: 'Volatility Straddle Breakout',
        riskLevel: 'MODERATE',
        performance: '+87% Backtested in 2026',
        icon: '🎯',
        color: 'red',
      },
    ];

    // ============================================
    // Ensure Each Bot Exists (Upsert)
    // ============================================
    for (const botData of EA_BOTS) {
      const existingBot = await prisma.bot.findFirst({
        where: {
          name: botData.name,
          userId: null,
        },
      });

      if (!existingBot) {
        await prisma.bot.create({
          data: {
            name: botData.name,
            description: botData.description,
            type: botData.type,
            strategy: botData.strategy,
            riskLevel: botData.riskLevel,
            performance: botData.performance,
            icon: botData.icon,
            color: botData.color,
            isActive: true,
            isRunning: false,
            isArchived: false,
            userId: null,
          },
        });
        console.log(`✅ Global bot added: ${botData.name}`);
      } else {
        // Update existing bot with latest data
        await prisma.bot.update({
          where: { id: existingBot.id },
          data: {
            description: botData.description,
            strategy: botData.strategy,
            riskLevel: botData.riskLevel,
            performance: botData.performance,
            icon: botData.icon,
            color: botData.color,
          },
        });
        console.log(`🔄 Global bot updated: ${botData.name}`);
      }
    }

    // ============================================
    // Fetch All Bots (Global + User-Specific)
    // ============================================
    const where: any = {
      OR: [
        { userId: null },
        { userId: user.id },
      ],
    };

    if (!includeArchived) {
      where.isArchived = false;
    }

    const bots = await prisma.bot.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ bots });
  } catch (error: any) {
    console.error('Get bots error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}
