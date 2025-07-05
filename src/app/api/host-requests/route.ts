import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { userId, firstName, lastName, reason } = body;

    // Verify that the user is submitting their own request
    if (userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.hostRequest.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return new NextResponse('You already have a pending host request', {
        status: 400,
      });
    }

    // Create the host request
    const hostRequest = await prisma.hostRequest.create({
      data: {
        userId,
        hostname: `${firstName} ${lastName}`,
        reason,
        status: 'pending',
      },
    });
    // create notification to admin
    const admins = await prisma.user.findMany({
      where: {
        isAdmin: true,
      },
      select: {
        id: true
      }
    });
    // Create notifications for all admins
    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'host_request',
            message: `${firstName} ${lastName} has requested to become a host.`,
          }
        })
      )
    );
    return NextResponse.json(hostRequest);
  } catch (error) {
    console.error('Error creating host request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only allow admins to view all requests
    if (!session.user.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where = {
      ...(status && { status }),
      ...(userId && { userId }),
    };

    const requests = await prisma.hostRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching host requests:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 