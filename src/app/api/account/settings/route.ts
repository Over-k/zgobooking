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
      include: {
        accountSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio,
      city: user.city,
      country: user.country,
      language: user.accountSettings?.language || 'en',
      currency: user.accountSettings?.currency || 'USD',
      timezone: user.accountSettings?.timezone || 'UTC',
      privacySettings: {
        showProfile: user.accountSettings?.showProfile || true,
        shareActivity: user.accountSettings?.shareActivity || false,
        allowMarketingEmails: user.accountSettings?.allowMarketingEmails || true,
      },
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
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
      include: { accountSettings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update account settings
    if (user.accountSettings) {
      await prisma.accountSettings.update({
        where: { userId: user.id },
        data: {
          language: data.language,
          currency: data.currency,
          timezone: data.timezone,
          showProfile: data.privacySettings?.showProfile,
          shareActivity: data.privacySettings?.shareActivity,
          allowMarketingEmails: data.privacySettings?.allowMarketingEmails,
        },
      });
    } else {
      // Create account settings if they don't exist
      await prisma.accountSettings.create({
        data: {
          userId: user.id,
          language: data.language || 'en',
          currency: data.currency || 'USD',
          timezone: data.timezone || 'UTC',
          showProfile: data.privacySettings?.showProfile ?? true,
          shareActivity: data.privacySettings?.shareActivity ?? false,
          allowMarketingEmails: data.privacySettings?.allowMarketingEmails ?? true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}