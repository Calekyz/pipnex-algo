import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event = payload as WebhookEvent;

    // Only process user.created events
    if (event.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = event.data;

      const email = email_addresses[0]?.email_address || '';
      const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      // Create user in your database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email,
          name: name,
          status: 'PENDING', // They haven't paid yet
          credits: 0,
        },
      });

      console.log(`✅ User created in database: ${email}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Clerk webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
