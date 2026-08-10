import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Code and email are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    if (user.status === 'ACTIVE' && user.planExpiry && new Date(user.planExpiry) > new Date()) {
      return NextResponse.json(
        { error: 'You already have an active subscription.' },
        { status: 400 }
      );
    }

    const license = await prisma.licenseCode.findUnique({
      where: { code },
    });

    if (!license) {
      return NextResponse.json(
        { error: 'Invalid activation code.' },
        { status: 404 }
      );
    }

    if (license.isUsed) {
      return NextResponse.json(
        { error: 'This code has already been used.' },
        { status: 400 }
      );
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This code has expired.' },
        { status: 400 }
      );
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + license.duration);

    let credits = 0;
    switch (license.plan) {
      case 'PRO':
        credits = 100;
        break;
      case 'GOLD':
        credits = 500;
        break;
      case 'PLATINUM':
        credits = 2000;
        break;
      default:
        credits = 50;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          plan: license.plan,
          planExpiry: expiryDate,
          credits: credits,
        },
      }),
      prisma.licenseCode.update({
        where: { id: license.id },
        data: {
          isUsed: true,
          usedBy: user.id,
          usedAt: new Date(),
        },
      }),
      prisma.userLicense.create({
        data: {
          userId: user.id,
          code: license.code,
          plan: license.plan,
          duration: license.duration,
          expiresAt: expiryDate,
          redeemedAt: new Date(),
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: `✅ Successfully activated ${license.plan} plan! You have ${credits} credits.`,
      plan: license.plan,
      credits: credits,
      expiresAt: expiryDate,
    });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
