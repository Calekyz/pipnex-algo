import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';

// GET: List all broker accounts for the user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const accounts = await prisma.brokerAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Remove sensitive fields before sending
    const sanitized = accounts.map(acc => {
      const { password, apiToken, ...rest } = acc;
      return rest;
    });

    return NextResponse.json({ accounts: sanitized });
  } catch (error: any) {
    console.error('Get broker accounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST: Add a new broker account
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, broker, accountId, password, server } = await req.json();

    if (!name || !broker || !accountId || !password) {
      return NextResponse.json(
        { error: 'Name, broker, accountId, and password are required' },
        { status: 400 }
      );
    }

    // Encrypt the password before storing
    const encryptedPassword = encrypt(password);

    const account = await prisma.brokerAccount.create({
      data: {
        userId: user.id,
        name,
        broker,
        accountId,
        password: encryptedPassword,
        server: server || '',
        isConnected: false,
        status: 'INACTIVE',
      },
    });

    // Remove sensitive fields from response
    const { password: _, ...response } = account;

    return NextResponse.json({
      success: true,
      account: response,
      message: 'Broker account added successfully',
    });
  } catch (error: any) {
    console.error('Add broker account error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add account' },
      { status: 500 }
    );
  }
}
