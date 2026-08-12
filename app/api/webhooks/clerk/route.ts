import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // Read raw body once
    const payloadText = await req.text();
    const payload = JSON.parse(payloadText) as WebhookEvent;

    if (payload.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = payload.data;

      const email = email_addresses?.[0]?.email_address || '';
      const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name,
          status: 'PENDING',
          credits: 0,
        },
      });

      console.log(`✅ User created: ${email}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
