import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET all open tickets
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });

    if (!clerkRes.ok) {
      return NextResponse.json({ error: 'Could not verify admin' }, { status: 500 });
    }

    const clerkUser = await clerkRes.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { status: 'OPEN' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Admin tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST reply to ticket
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });

    if (!clerkRes.ok) {
      return NextResponse.json({ error: 'Could not verify admin' }, { status: 500 });
    }

    const clerkUser = await clerkRes.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ticketId, message } = await req.json();

    if (!ticketId || !message) {
      return NextResponse.json({ error: 'Ticket ID and message required' }, { status: 400 });
    }

    // Create reply and mark all user messages as read
    const [newMessage] = await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId,
          sender: 'ADMIN',
          message,
          isRead: true,
        },
      }),
      prisma.supportMessage.updateMany({
        where: {
          ticketId,
          sender: 'USER',
          isRead: false,
        },
        data: { isRead: true },
      }),
    ]);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Send reply error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}

// DELETE close ticket
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });

    if (!clerkRes.ok) {
      return NextResponse.json({ error: 'Could not verify admin' }, { status: 500 });
    }

    const clerkUser = await clerkRes.json();
    const userEmail = clerkUser.email_addresses?.[0]?.email_address || '';
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ticketId } = await req.json();

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
    });

    return NextResponse.json({ success: true, message: 'Ticket closed' });
  } catch (error: any) {
    console.error('Close ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to close ticket' },
      { status: 500 }
    );
  }
}
