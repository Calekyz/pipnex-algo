import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Webhook } from 'svix';

// Optional: If you have a signing secret, you can verify the webhook authenticity.
// Set CLERK_WEBHOOK_SECRET in your environment variables.
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    // ============================================================
    // 1. Read the raw request body as text (ONCE)
    // ============================================================
    const payloadText = await req.text();
    const payload = JSON.parse(payloadText) as WebhookEvent;

    // ============================================================
    // 2. Optionally verify the webhook signature (if secret is set)
    // ============================================================
    if (webhookSecret) {
      const svixId = req.headers.get('svix-id');
      const svixTimestamp = req.headers.get('svix-timestamp');
      const svixSignature = req.headers.get('svix-signature');

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Missing Svix headers');
        return NextResponse.json(
          { error: 'Missing webhook verification headers' },
          { status: 400 }
        );
      }

      const wh = new Webhook(webhookSecret);
      try {
        await wh.verify(payloadText, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    // ============================================================
    // 3. Process the event
    // ============================================================
    const eventType = payload.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = payload.data;

      const email = email_addresses?.[0]?.email_address || '';
      const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name,
          status: 'PENDING', // They still need to activate
          credits: 0,
        },
      });

      console.log(`✅ User created in database: ${email}`);
    }

    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
