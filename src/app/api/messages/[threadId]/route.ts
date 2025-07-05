import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parameter validation
    const { threadId } = await params;
    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID required' }, { status: 400 });
    }

    const userId = session.user.id;

    // Single query to check participation and get thread data
    const thread = await prisma.messageThread.findFirst({
      where: {
        id: threadId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
              }
            },
            recipient: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            attachments: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        booking: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            total: true
          }
        }
      }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 404 });
    }

    // Mark messages as read using transaction
    const unreadMessages = thread.messages.filter(
      msg => msg.recipientId === userId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Mark messages as read
        await tx.message.updateMany({
          where: {
            threadId,
            recipientId: userId,
            isRead: false
          },
          data: {
            isRead: true
          }
        });

        // Reset unread count
        await tx.messageThreadParticipant.update({
          where: {
            threadId_userId: {
              threadId,
              userId
            }
          },
          data: {
            unreadCount: 0
          }
        });
      });

      // Update the messages in the response to reflect read status
      thread.messages.forEach(msg => {
        if (msg.recipientId === userId && !msg.isRead) {
          msg.isRead = true;
        }
      });
    }

    // Get current user's participant info
    const currentUserParticipant = thread.participants.find(p => p.userId === userId);

    return NextResponse.json({
      thread: {
        ...thread,
        lastMessageAt: thread.lastMessageAt || thread.updatedAt,
        lastMessageText: thread.lastMessageText || '',
        currentUserUnreadCount: 0, // Always 0 after marking as read
        isArchived: currentUserParticipant?.isArchived || false
      }
    });

  } catch (error) {
    console.error('Error fetching thread:', error);

    // More specific error handling
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}