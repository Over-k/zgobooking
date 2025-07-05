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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { notificationPreferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If preferences don't exist, create default ones
    if (!user.notificationPreferences) {
      const preferences = await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
          emailMarketing: true,
          emailAccountUpdates: true,
          emailBookingReminders: true,
          emailNewMessages: true,
          pushMarketing: false,
          pushAccountUpdates: true,
          pushBookingReminders: true,
          pushNewMessages: true,
          smsMarketing: false,
          smsAccountUpdates: true,
          smsBookingReminders: true,
          smsNewMessages: true
        }
      });
      return NextResponse.json(preferences);
    }

    return NextResponse.json(user.notificationPreferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data
      }
    });

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
