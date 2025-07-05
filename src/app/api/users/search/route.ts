// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const currentUserEmail = session.user.email;

    // Search for users by name or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
              email: {
              not: currentUserEmail // Exclude current user
            }
          },
          {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        isHost: true,
        isVerified: true,
        city: true,
        country: true,
        hostInfo: {
          select: {
            superhost: true,
            averageRating: true,
            totalReviews: true
          }
        }
      },
      take: 10,
      orderBy: [
        { isVerified: 'desc' }, // Verified users first
        { firstName: 'asc' }
      ]
    });

    // Check if there are existing conversations with these users
    const usersWithConversationStatus = await Promise.all(
      users.map(async (user) => {
        const existingThread = await prisma.messageThread.findFirst({
          where: {
            participants: {
              every: {
                userId: {
                  in: [currentUserEmail, user.id]
                }
              }
            }
          },
          select: {
            id: true
          }
        });

        return {
          ...user,
          hasExistingConversation: !!existingThread,
          existingThreadId: existingThread?.id
        };
      })
    );

    return NextResponse.json({ users: usersWithConversationStatus });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}