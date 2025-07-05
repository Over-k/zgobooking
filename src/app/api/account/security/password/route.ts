import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PasswordManager } from '@/lib/utils/password';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { securitySettings: true },
    });

    if (!user || !user.securitySettings) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if(user.securitySettings.password === null || user.securitySettings.passwordSalt === null) {
      return NextResponse.json({ error: 'User password not found' }, { status: 404 });
    }
    // Log passwords for debugging
    console.log('Current password:', currentPassword);
    console.log('New password:', newPassword);

    // Handle case where user has no password (e.g., Google login)
    if (user.securitySettings.password === null || user.securitySettings.passwordSalt === null) {
      // For users who logged in with Google, allow them to set their first password
      console.log('User has no existing password - setting initial password');
      
      // Hash new password using PasswordManager
      const { hash: newPasswordHash, salt: newPasswordSalt } = await PasswordManager.hashPassword(newPassword);
      
      // Update password
      await prisma.securitySettings.update({
        where: { userId: user.id },
        data: {
          password: newPasswordHash,
          passwordSalt: newPasswordSalt,
          lastPasswordChange: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Initial password set successfully' 
      });
    }

    // Verify current password using PasswordManager
    const currentPasswordValid = await PasswordManager.verifyPassword(
      currentPassword,
      user.securitySettings.password,
      user.securitySettings.passwordSalt
    );
    if (!currentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password using PasswordManager
    const { hash: newPasswordHash, salt: newPasswordSalt } = await PasswordManager.hashPassword(newPassword);

    // Update password
    await prisma.securitySettings.update({
      where: { userId: user.id },
      data: {
        password: newPasswordHash,
        passwordSalt: newPasswordSalt,
        lastPasswordChange: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}