import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then((res) => res.json());

  const userEmail = clerkUser.email_addresses[0]?.email_address || '';
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

  if (!adminEmails.includes(userEmail)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { plan, duration, quantity } = await req.json();

  if (!plan || !duration || !quantity) {
    return NextResponse.json(
      { error: 'Plan, duration, and quantity are required' },
      { status: 400 }
    );
  }

  try {
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const randomId = Math.random().toString(36).substring(2, 8);
      const code = `${plan.toLowerCase()}-${randomId}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await prisma.licenseCode.create({
        data: {
          code,
          plan,
          duration,
          expiresAt,
          createdBy: userEmail,
        },
      });
      codes.push(code);
    }

    return NextResponse.json({ codes, message: `Generated ${codes.length} codes` });
  } catch (error) {
    console.error('Generate codes error:', error);
    return NextResponse.json(
      { error: 'Failed to generate codes' },
      { status: 500 }
    );
  }
}
