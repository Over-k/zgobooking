import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('No session or user found', session?.user?.email);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const verification = await prisma.verification.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: session.user.email },
        data: { email, emailVerified: true },
      }),
      prisma.securitySettings.updateMany({
        where: { email: session.user.email },
        data: { email },
      }),
      prisma.booking.updateMany({
        where: { guestId: session.user.email },
        data: { contactEmail: email },
      }),
      prisma.booking.updateMany({
        where: { hostId: session.user.email },
        data: { contactEmail: email },
      }),
      prisma.verification.delete({
        where: { id: verification.id },
      }),
    ]);
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: { email: true, emailVerified: true }
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found after update' }, { status: 500 });
    }
    // Update session data
    const updatedSession = {
      user: {
        id: session.user?.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      }
    };

    // Return the updated session data
    return NextResponse.json({ 
      success: true,
      session: updatedSession
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
