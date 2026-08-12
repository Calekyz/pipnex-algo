import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    // Read the raw body
    const payloadText = await req.text();

    // Get headers
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    // If webhook secret is set, verify the signature
    if (webhookSecret) {
      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json(
          { error: 'Missing svix headers' },
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
        console.error('Webhook verification failed:', err);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse and process the event
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
