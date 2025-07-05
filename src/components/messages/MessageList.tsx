'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'unread' | 'hosts' | 'guests';

interface MessageThread {
  id: string;
  lastMessageAt: string;
  lastMessageText: string;
  participants: Array<{
    userId: string;
    unreadCount: number;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImage: string;
      isHost: boolean;
    };
  }>;
  listing?: {
    id: string;
    title: string;
    images: Array<{ url: string }>;
  };
  booking?: {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
  };
}

interface MessageListProps {
  currentUserEmail: string;
  selectedThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  refreshTrigger?: number;
  activeFilter?: FilterType;
  searchQuery?: string;
}

export default function MessageList({
  currentUserEmail,
  selectedThreadId,
  onThreadSelect,
  refreshTrigger,
  activeFilter = 'all',
  searchQuery = ''
}: MessageListProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, [refreshTrigger]);

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (thread: MessageThread) => {
    return thread.participants.find(p => p.user.email !== currentUserEmail);
  };

  const getCurrentParticipant = (thread: MessageThread) => {
    return thread.participants.find(p => p.user.email === currentUserEmail);
  };

  // Filter threads based on active filter and search query
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const otherParticipant = getOtherParticipant(thread);
      const currentParticipant = getCurrentParticipant(thread);
      
      if (!otherParticipant) return false;

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
          .toLowerCase()
          .includes(searchLower);
        const emailMatch = otherParticipant.user.email.toLowerCase().includes(searchLower);
        const messageMatch = thread.lastMessageText.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !emailMatch && !messageMatch) {
          return false;
        }
      }

      // Filter by type
      switch (activeFilter) {
        case 'unread':
          return (currentParticipant?.unreadCount || 0) > 0;
        case 'hosts':
          return otherParticipant.user.isHost;
        case 'guests':
          return !otherParticipant.user.isHost;
        case 'all':
        default:
          return true;
      }
    });
  }, [threads, activeFilter, searchQuery, currentUserEmail]);

  if (loading) {
    return (
      <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-background">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-3 animate-pulse bg-card">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
         <div className="flex-1 overflow-hidden">
        <div className="h-full max-h-[calc(100vh-120px)] overflow-y-auto scroll-smooth">
    <div className="space-y-2 p-4 bg-background/50">
      {filteredThreads.map((thread) => {
        const otherParticipant = getOtherParticipant(thread);
        const currentParticipant = getCurrentParticipant(thread);
        const unreadCount = currentParticipant?.unreadCount || 0;
        
        if (!otherParticipant) return null;

        return (
          <Card
            key={thread.id}
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedThreadId === thread.id 
                ? 'bg-accent border-accent-foreground/20' 
                : 'bg-card hover:bg-accent/50'
            }`}
            onClick={() => onThreadSelect(thread.id)}
          >
            <div className="flex items-start space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={otherParticipant.user.profileImage}
                  alt={`${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`}
                />
                <AvatarFallback>
                  {otherParticipant.user.firstName[0]}
                  {otherParticipant.user.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm truncate text-foreground">
                      {otherParticipant.user.firstName} {otherParticipant.user.lastName}
                    </h3>
                    {otherParticipant.user.isHost && (
                      <Badge variant="outline" className="text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.lastMessageAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                </div>

                {thread.listing && (
                  <div className="flex items-center space-x-2 mt-1">
                    {thread.listing.images[0] && (
                      <img
                        src={thread.listing.images[0].url}
                        alt={thread.listing.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {thread.listing.title}
                    </span>
                  </div>
                )}

                {thread.booking && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(thread.booking.checkInDate).toLocaleDateString()} - {' '}
                      {new Date(thread.booking.checkOutDate).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={
                        thread.booking.status === 'approved'
                          ? 'default'
                          : thread.booking.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-xs"
                    >
                      {thread.booking.status}
                    </Badge>
                  </div>
                )}

                <p className="text-sm text-muted-foreground truncate mt-1">
                  {thread.lastMessageText}
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {filteredThreads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No conversations match "${searchQuery}"`
              : activeFilter === 'unread' 
                ? 'All messages are read'
                : activeFilter === 'hosts'
                ? 'No conversations with hosts'
                : activeFilter === 'guests'
                ? 'No conversations with guests'
                : 'Start a conversation to see it here'
            }
          </p>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}