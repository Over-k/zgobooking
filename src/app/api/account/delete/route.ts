import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { signOut } from 'next-auth/react';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete account settings
      await tx.accountSettings.delete({
        where: { userId: user.id },
      });

      // Delete payment methods
      await tx.paymentMethod.deleteMany({
        where: { userId: user.id },
      });

      // Delete user
      await tx.user.delete({
          where: { id: user.id },
        });
        // clear session
        signOut({
          callbackUrl: "/",
        })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}