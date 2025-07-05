import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendEmailVerification } from '@/lib/email';
import { PasswordManager } from '@/lib/utils/password';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newEmail, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { securitySettings: true },
    });

    if (!user || !user.securitySettings) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const passwordValid = await PasswordManager.verifyPassword(
      password,
      user.securitySettings.password,
      user.securitySettings.passwordSalt
    );

    if (!passwordValid) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 });
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
    }

    // Delete any existing verification records for this email
    await prisma.verification.deleteMany({
      where: { email: newEmail },
    });

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    // Store verification
    await prisma.verification.create({
      data: {
        email: newEmail,
        code: verificationCode,
        expiresAt,
      },
    });

    // Send verification email
    await sendEmailVerification(newEmail, verificationCode, expiresAt);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error initiating email change:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}