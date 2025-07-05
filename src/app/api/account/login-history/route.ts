import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if(!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1') || 1;
    const limit = parseInt(url.searchParams.get('limit') || '5') || 5;
    const skip = (page - 1) * limit;

    const [loginHistory, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.loginHistory.count({
        where: { userId: session.user.id }
      })
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      data: loginHistory,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}