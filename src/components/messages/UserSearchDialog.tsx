// components/messages/UserSearchDialog.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; 
import { Search, MessageCircle, Star, MapPin, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  isHost: boolean;
  isVerified: boolean;
  city?: string;
  country?: string;
  hostInfo?: {
    superhost: boolean;
    averageRating: number;
    totalReviews: number;
  };
  hasExistingConversation: boolean;
  existingThreadId?: string;
}

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserSelect: (userId: string, threadId?: string) => void;
  onConversationCreated?: () => void; // Add callback to refresh message list
}

export default function UserSearchDialog({
  open,
  onOpenChange,
  onUserSelect,
  onConversationCreated
}: UserSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingConversation, setStartingConversation] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
      debouncedSearch(searchQuery);
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [searchQuery, debouncedSearch]);

  const handleUserSelect = async (user: User) => {
    if (user.hasExistingConversation && user.existingThreadId) {
      // Open existing conversation
      onUserSelect(user.id, user.existingThreadId);
      handleClose();
    } else {
      // Start new conversation without sending initial message
      try {
        setStartingConversation(user.id);
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: user.id,
            // No content - just create the thread
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          // Notify parent components to refresh
          if (onConversationCreated) {
            onConversationCreated();
          }
          // Open the new conversation
          onUserSelect(user.id, data.thread.id);
          handleClose();
        } else {
          console.error('Failed to start conversation');
          // You might want to show a toast notification here
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
        // You might want to show a toast notification here
      } finally {
        setStartingConversation(null);
      }
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setStartingConversation(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {/* Loading Skeletons */}
            {loading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-3 animate-pulse">
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
              </>
            )}

            {/* No users found */}
            {!loading && searchQuery.length >= 2 && users.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Search className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Try searching with a different name or email
                </p>
              </div>
            )}

            {/* User list */}
            {users.map((user) => (
              <Card
                key={user.id}
                className="p-3 cursor-pointer transition-colors hover:bg-muted hover:shadow-md"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="transition-transform duration-200 hover:scale-105">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm truncate">
                        {user.firstName} {user.lastName}
                      </h3>

                      {user.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}

                      {user.hostInfo?.superhost && (
                        <Badge variant="default" className="text-xs bg-red-500">
                          Superhost
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>

                    {(user.city || user.country) && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {[user.city, user.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    {user.hostInfo && user.hostInfo.totalReviews > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {user.hostInfo.averageRating.toFixed(1)} ({user.hostInfo.totalReviews} reviews)
                        </span>
                      </div>
                    )}

                    {user.hasExistingConversation && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Existing conversation
                      </Badge>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {startingConversation === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        aria-label={`Message ${user.firstName}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Prompt for search */}
            {searchQuery.length < 2 && !loading && (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Search className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Search for users</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Type at least 2 characters to start searching
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}