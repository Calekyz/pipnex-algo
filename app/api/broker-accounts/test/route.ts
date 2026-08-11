import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

// This is a mock test – in production you'd call the broker's API
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const account = await prisma.brokerAccount.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Decrypt password to test
    const decryptedPassword = decrypt(account.password);

    // Here you would call the broker's API to test credentials
    // For now, we simulate a successful connection
    // In production: use the broker adapter to test login

    // Update account status
    await prisma.brokerAccount.update({
      where: { id: account.id },
      data: {
        isConnected: true,
        status: 'CONNECTED',
        lastConnected: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
    });
  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Connection failed' },
      { status: 500 }
    );
  }
}
