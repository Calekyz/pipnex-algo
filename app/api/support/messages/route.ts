import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
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

    // Find or create ticket
    let ticket = await prisma.supportTicket.findFirst({
      where: {
        userId: user.id,
        status: 'OPEN',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId: user.id,
          subject: 'Support Request',
          status: 'OPEN',
        },
        include: {
          messages: true,
        },
      });
    }

    return NextResponse.json({
      ticketId: ticket.id,
      messages: ticket.messages,
    });
  } catch (error: any) {
    console.error('Support messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create open ticket
    let ticket = await prisma.supportTicket.findFirst({
      where: {
        userId: user.id,
        status: 'OPEN',
      },
    });

    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId: user.id,
          subject: 'Support Request',
          status: 'OPEN',
        },
      });
    }

    // Create message
    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        sender: 'USER',
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
