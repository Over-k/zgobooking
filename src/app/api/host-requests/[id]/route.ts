import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/host-requests/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Ensure user can only access their own request
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Find the most recent host request for this user
    const hostRequest = await prisma.hostRequest.findFirst({
      where: {
        userId: id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        reviewedBy: true,
      }
    });

    if (!hostRequest) {
      return NextResponse.json(
        { error: 'No host request found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hostRequest);

  } catch (error) {
    console.error('Error fetching host request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch host request' },
      { status: 500 }
    );
  }
}

// PATCH /api/host-requests/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!session.user.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (!['approve', 'reject'].includes(action)) {
      return new NextResponse('Invalid action', { status: 400 });
    }

    const { id } = await params;

    const request = await prisma.hostRequest.findUnique({
      where: { id: id },
      include: { user: true },
    });

    if (!request) {
      return new NextResponse('Request not found', { status: 404 });
    }

    if (request.status !== 'pending') {
      return new NextResponse('Request already processed', { status: 400 });
    }

    // Update the host request
    const updatedRequest = await prisma.hostRequest.update({
      where: { id: id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    // If approved, update the user's host status
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: request.userId },
        data: { isHost: true },
      });

      // Create a notification for the user
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'host_request',
          message: 'Your request to become a host has been approved! You can now create listings.',
          isRead: false,
        },
      });
    } else {
      // Create a notification for rejected request
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'host_request',
          message: 'Your request to become a host has been rejected. Please contact support for more information.',
          isRead: false,
        },
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error processing host request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}