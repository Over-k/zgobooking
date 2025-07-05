import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({
      session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
} 