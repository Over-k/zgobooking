import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendPasswordResetOtp } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Delete any existing verification codes for this email
    await prisma.verification.deleteMany({
      where: {
        email,
      },
    });

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    // Store verification
    await prisma.verification.create({
      data: {
        email,
        code: verificationCode,
        expiresAt,
      },
    });

    // Send verification email
    await sendPasswordResetOtp(email, verificationCode, expiresAt);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resending verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}