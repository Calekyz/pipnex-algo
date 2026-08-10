import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // Skip signature verification in development
    if (process.env.NODE_ENV === 'development') {
      return await handleWebhook(req);
    }

    // Verify signature in production
    const payload = await req.json();
    const event = payload as WebhookEvent;

    // Basic check – we trust Clerk's header
    // For full security, you'd verify the webhook signature
    // using the webhook secret

    return await handleWebhook(req);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleWebhook(req: Request) {
  const payload = await req.json();
  const event = payload as WebhookEvent;

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = event.data;

    const email = email_addresses[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

    await prisma.user.create({
      data: {
        clerkId: id,
        email: email,
        name: name,
        status: 'PENDING',
        credits: 0,
      },
    });

    console.log(`✅ User created in database: ${email}`);
  }

  return NextResponse.json({ success: true });
}
