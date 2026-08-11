import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, accountId } = await req.json();

    if (!botId || !accountId) {
      return NextResponse.json(
        { error: 'botId and accountId are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify bot belongs to user or is global
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Verify account belongs to user
    const account = await prisma.brokerAccount.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if already running
    const existing = await prisma.eAInstance.findFirst({
      where: {
        userId: user.id,
        brokerAccountId: accountId,
        botId: botId,
        status: { in: ['RUNNING', 'ONLINE'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This EA is already running on this account' },
        { status: 400 }
      );
    }

    // Decrypt password
    let decryptedPassword = '';
    try {
      decryptedPassword = decrypt(account.password);
    } catch (error) {
      console.error('Decryption error:', error);
      return NextResponse.json(
        { error: 'Failed to decrypt account credentials' },
        { status: 500 }
      );
    }

    // ============================================
    // Call the Trading Engine
    // ============================================
    const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL;
    const apiKey = process.env.PLATFORM_API_KEY;

    if (!engineUrl) {
      console.error('NEXT_PUBLIC_ENGINE_URL is not set');
      return NextResponse.json(
        { error: 'Trading engine URL is not configured' },
        { status: 500 }
      );
    }

    // Map bot name to strategy name for engine
    const strategyName = bot.name;

    // Default config based on bot type
    let config: any = {
      symbol: 'EUR/USD',
      initialLot: 0.05,
      martingaleMultiplier: 2.0,
      tradesPerSequence: 3,
      maxMartingaleLevels: 3,
      recoveryTarget: 20.0,
      initialSL: 70.0,
      useTrailingStop: true,
      trailingStart: 20.0,
      trailingDistance: 3.0,
      secondsBetweenTrades: 3,
      maxConcurrentPositions: 10,
      tradeBuy: true,
      tradeSell: true,
      alternateDirection: true,
      sameDirectionPerSequence: true,
      useTimeFilter: false,
      startHour: 8,
      endHour: 20,
      maxDailyLoss: 0,
      maxDrawdownPercent: 25.0,
    };

    // Customize config based on bot type
    switch (bot.type) {
      case 'SCALPER':
        config.initialLot = 0.03;
        config.initialSL = 30.0;
        config.recoveryTarget = 10.0;
        config.trailingStart = 10.0;
        config.trailingDistance = 2.0;
        config.secondsBetweenTrades = 1;
        break;
      case 'SWING':
        config.initialLot = 0.05;
        config.initialSL = 100.0;
        config.recoveryTarget = 30.0;
        config.trailingStart = 30.0;
        config.trailingDistance = 5.0;
        config.secondsBetweenTrades = 5;
        config.swingStrength = 30;
        config.rewardRiskRatio = 3.0;
        config.lotSize = 0.05;
        config.maxOpenPositions = 5;
        config.fibLevels = '0.236,0.382,0.5,0.618,0.786,0.85';
        break;
      case 'AI':
        config.initialLot = 0.04;
        config.swingStrength = 30;
        config.rewardRiskRatio = 3.0;
        config.lotSize = 0.04;
        config.maxOpenPositions = 4;
        config.fibLevels = '0.236,0.382,0.5,0.618,0.786';
        break;
      case 'EA':
      default:
        // Martingale EA settings
        break;
    }

    // Create EA instance in database
    const instance = await prisma.eAInstance.create({
      data: {
        userId: user.id,
        brokerAccountId: accountId,
        botId: botId,
        status: 'RUNNING',
        startedAt: new Date(),
        config: config,
      },
    });

    // Call the engine
    const engineResponse = await fetch(`${engineUrl}/api/instance/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || 'default',
      },
      body: JSON.stringify({
        clientId: user.id,
        strategyName: strategyName,
        broker: account.broker,
        accountId: account.accountId,
        password: decryptedPassword,
        server: account.server || 'Demo',
        symbol: 'EUR/USD',
        config: config,
      }),
    });

    let engineResult;
    try {
      engineResult = await engineResponse.json();
    } catch (error) {
      console.error('Engine response parse error:', error);
      // Update instance status to error
      await prisma.eAInstance.update({
        where: { id: instance.id },
        data: { status: 'ERROR' },
      });
      return NextResponse.json(
        { error: 'Failed to communicate with trading engine' },
        { status: 500 }
      );
    }

    if (!engineResponse.ok) {
      // Update instance status to error
      await prisma.eAInstance.update({
        where: { id: instance.id },
        data: { status: 'ERROR' },
      });
      return NextResponse.json(
        { error: engineResult.error || 'Engine failed to start EA' },
        { status: engineResponse.status }
      );
    }

    // Update bot status
    await prisma.bot.update({
      where: { id: botId },
      data: { isRunning: true },
    });

    // Update instance with balance info
    if (engineResult.balance) {
      await prisma.eAInstance.update({
        where: { id: instance.id },
        data: {
          balance: engineResult.balance.balance || 0,
          equity: engineResult.balance.equity || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      instance: instance,
      engine: engineResult,
      message: `${bot.name} started successfully on ${account.name}`,
    });

  } catch (error: any) {
    console.error('Start EA error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start EA' },
      { status: 500 }
    );
  }
}
