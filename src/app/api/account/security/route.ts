import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Now fetch user with security settings
    const userWithSettings = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        securitySettings: {
          include: {
            loginHistory: {
              orderBy: { date: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    // If no security settings found, create default settings
    if (!userWithSettings?.securitySettings) {
      // Create default security settings
      const defaultSettings = await prisma.securitySettings.create({
        data: {
          email: user.email,
          userId: user.id,
          twoFactorEnabled: false,
          password: '', // This should be set properly during account creation
          passwordSalt: '', // This should be set properly during account creation
          lastPasswordChange: new Date(),
        },
      });
      
      return NextResponse.json({
        email: user.email,
        twoFactorEnabled: defaultSettings.twoFactorEnabled,
        lastPasswordChange: defaultSettings.lastPasswordChange,
        emailVerified: user.emailVerified,
        loginHistory: [],
      });
    }

    // Return the complete data
    return NextResponse.json({
      email: userWithSettings.email,
      twoFactorEnabled: userWithSettings.securitySettings.twoFactorEnabled,
      lastPasswordChange: userWithSettings.securitySettings.lastPasswordChange,
      emailVerified: userWithSettings.emailVerified,
      loginHistory: userWithSettings.securitySettings.loginHistory.map(login => ({
        date: login.date,
        location: login.location,
        device: login.device,
      })),
    });
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if security settings exist
    const securitySettings = await prisma.securitySettings.findUnique({
      where: { userId: user.id },
    });

    // If not, create them
    if (!securitySettings) {
      await prisma.securitySettings.create({
        data: {
          email: user.email,
          userId: user.id,
          twoFactorEnabled: data.twoFactorEnabled,
          password: '', // This should be set properly during account creation
          passwordSalt: '', // This should be set properly during account creation
          lastPasswordChange: new Date(),
        },
      });
    } else {
      // Update existing security settings
      await prisma.securitySettings.update({
        where: { userId: user.id },
        data: {
          twoFactorEnabled: data.twoFactorEnabled,
        },
      });
    }

    // Fetch updated data
    const updatedUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        securitySettings: {
          include: {
            loginHistory: {
              orderBy: { date: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!updatedUser || !updatedUser.securitySettings) {
      return NextResponse.json({ error: 'User security data not found' }, { status: 404 });
    }

    return NextResponse.json({
      email: updatedUser.email,
      twoFactorEnabled: updatedUser.securitySettings.twoFactorEnabled,
      lastPasswordChange: updatedUser.securitySettings.lastPasswordChange,
      emailVerified: updatedUser.emailVerified,
      loginHistory: updatedUser.securitySettings.loginHistory.map(login => ({
        date: login.date,
        location: login.location,
        device: login.device,
      })),
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}