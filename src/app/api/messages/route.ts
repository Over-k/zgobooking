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

    const userEmail = session.user.email;

    // Get all message threads for the user
    const threads = await prisma.messageThread.findMany({
      where: {
        participants: {
          some: {
            user: {
              email: userEmail
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                isHost: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true
              },
            },
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
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
            status: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, threadId, recipientId } = await request.json();
    
    // Allow creating thread without content when only recipientId is provided
    if (!threadId && !recipientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If threadId is provided, content is required
    if (threadId && !content) {
      return NextResponse.json(
        { error: 'Content is required when sending to existing thread' },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let thread;
    
    if (threadId) {
      // Use existing thread
      thread = await prisma.messageThread.findUnique({
        where: { id: threadId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }

      // Verify user is a participant in this thread
      const isParticipant = thread.participants.some(p => p.user.email === userEmail);
      if (!isParticipant) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (recipientId) {
      // Get recipient user
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, email: true }
      });

      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      // Check if thread already exists between these users
      const existingThread = await prisma.messageThread.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  user: {
                    email: userEmail
                  }
                }
              }
            },
            {
              participants: {
                some: {
                  user: {
                    email: recipient.email
                  }
                }
              }
            }
          ]
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
    
      if (existingThread) {
        thread = existingThread;
      } else {
        // Create new thread
        thread = await prisma.messageThread.create({
          data: {
            lastMessageAt: new Date(),
            lastMessageText: content ? content.substring(0, 100) : '',
            participants: {
              create: [
                { userId: user.id },
                { userId: recipientId }
              ]
            }
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });
      }
    }

    if (!thread) {
      return NextResponse.json({ error: 'Could not create or find thread' }, { status: 500 });
    }

    // Only create message if content is provided
    let message = null;
    if (content) {
      // Find the recipient user ID for this message
      const recipientUserId = recipientId || thread.participants.find(p => p.userId !== user.id)?.userId;

      if (!recipientUserId) {
        return NextResponse.json({ error: 'Could not determine recipient' }, { status: 400 });
      }

      // Create the message
      message = await prisma.message.create({
        data: {
          content,
          threadId: thread.id,
          senderId: user.id,
          recipientId: recipientUserId
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      // Update thread's last message info
      await prisma.messageThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(),
          lastMessageText: content.substring(0, 100)
        }
      });

      // Update unread count for other participants
      await prisma.messageThreadParticipant.updateMany({
        where: {
          threadId: thread.id,
          userId: { not: user.id }
        },
        data: {
          unreadCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json({ message, thread });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}