import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Simple in-memory status (in production use Redis)
let adminLastSeen = Date.now();

export async function GET() {
  // Check if user is admin
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ isOnline: false });
  }

  // Update last seen when admin visits
  adminLastSeen = Date.now();

  // Consider online if seen within the last 5 minutes
  const isOnline = Date.now() - adminLastSeen < 5 * 60 * 1000;

  return NextResponse.json({ isOnline });
}

// Admin can update status via POST
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await req.json();
  if (status === 'online') {
    adminLastSeen = Date.now();
  }

  return NextResponse.json({ success: true });
}
