'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { Send, Calendar, Loader2, DollarSign } from 'lucide-react';
import { User, Booking, ListingImage} from '@prisma/client';

interface MessageConversationProps {
  threadId: string;
  currentUserEmail: string;
  onMessageSent?: () => void;
}

interface Participant {
  unreadCount: number;
  isArchived: boolean;
  lastReadAt: string | null;
  joinedAt: string;
  threadId: string;
  userId: string;
  user: User;
}
interface Listing {
  id: string;
  title: string;
  price: number;
  images: ListingImage[];
}
interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  threadId: string;
  senderId: string;
  recipientId: string;
  sender: User;
  recipient: User;
  attachments: any[]; // Could be further typed if attachment structure is known
}

interface Thread {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageId: string | null;
  lastMessageAt: string;
  lastMessageText: string;
  listingId: string | null;
  bookingId: string | null;
  participants: Participant[];
  messages: Message[];
  listing: Listing;
  booking: Booking;
  currentUserUnreadCount: number;
  isArchived: boolean;
}

export default function MessageConversation({
  threadId,
  currentUserEmail,
  onMessageSent
}: MessageConversationProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [thread]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setThread(data.thread);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          threadId,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchThread();
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Thread not found</p>
      </div>
    );
  }

  const otherParticipant = thread.participants.find(p => p.userId == thread.messages[0]?.recipientId)?.user;

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 border-b p-4 bg-white">
        {otherParticipant && (
          <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={otherParticipant?.profileImage}
              alt={`${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
            />
            <AvatarFallback>
              {otherParticipant?.firstName[0]}
              {otherParticipant?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              Last active {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
            </p>
          </div>
          </div>
        )}

        {/* Booking/Listing Info */}
        {(thread.booking || thread.listing) && (
          <Card className="mt-4 p-3">
            {thread.booking && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {format(new Date(thread.booking.checkInDate), 'MMM dd')} - {' '}
                      {format(new Date(thread.booking.checkOutDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <Badge
                    variant={
                      thread.booking.status === 'approved'
                        ? 'default'
                        : thread.booking.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {thread.booking.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    ${thread.booking.total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {thread.listing && (
              <div className="flex items-center space-x-3">
                {thread.listing.images[0] && (
                  <img
                    src={thread.listing.images[0].url}
                    alt={thread.listing.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-sm">{thread.listing.title}</h3>
                  <p className="text-sm text-gray-600">
                    ${thread.listing.price}/night
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Messages Container - Scrollable with max height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4 scroll-smooth">
          {thread.messages.map((message, index) => {
            const isCurrentUser = message.sender.email === currentUserEmail;
            const showAvatar = 
              index === 0 || 
              thread.messages[index - 1].sender.id !== message.sender.id;
            const showTime = 
              index === thread.messages.length - 1 ||
              thread.messages[index + 1].sender.id !== message.sender.id ||
              new Date(thread.messages[index + 1].createdAt).getTime() - 
              new Date(message.createdAt).getTime() > 300000; // 5 minutes

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isCurrentUser && showAvatar && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage
                        src={message.sender.profileImage}
                        alt={`${message.sender.firstName} ${message.sender.lastName}`}
                      />
                      <AvatarFallback className="text-xs">
                        {message.sender.firstName[0]}{message.sender.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isCurrentUser && !showAvatar && (
                    <div className="w-8 h-8 flex-shrink-0"></div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div
                      className={`p-3 rounded-2xl break-words ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap word-break">{message.content}</p>
                    </div>
                    
                    {showTime && (
                      <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - Fixed height */}
      <div className="flex-shrink-0 border-t p-4 bg-white">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="px-3 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}