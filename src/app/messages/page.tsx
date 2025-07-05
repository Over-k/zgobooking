// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Plus, Filter, MoreVertical, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MessageList from '@/components/messages/MessageList';
import MessageConversation from '@/components/messages/MessageConversation';
import UserSearchDialog from '@/components/messages/UserSearchDialog';

type FilterType = 'all' | 'unread' | 'hosts' | 'guests';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (status === 'loading') {
    return (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center space-y-4">
                {/* Spinner */}
                <div
                  className="h-12 w-12 border-4 border-muted 
                            border-t-foreground 
                            rounded-full animate-spin mx-auto"
                ></div>

                {/* Loading Text */}
                <p className="text-muted-foreground font-medium">
                  Loading your messages...
                </p>
              </div>
            </div>

    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  // Handle user selection from search dialog
  const handleUserSelect = async (userId: string, existingThreadId?: string) => {
    if (existingThreadId) {
      // If there's an existing thread, just select it
      handleThreadSelect(existingThreadId);
      return;
    }

    try {
      // Create a new thread with the selected user
      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          content: `Hi! 👋`
        })
      });

      if (response.ok) {
        const data = await response.json();
        handleThreadSelect(data.thread.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5"/>
            <span>Back</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-xl shadow-lg">
                  <MessageSquare className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Messages
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Connect with hosts and guests seamlessly
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowUserSearch(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
              
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <UserSearchDialog
          open={showUserSearch}
          onOpenChange={setShowUserSearch}
          onUserSelect={handleUserSelect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)]">
          {/* Enhanced Message List - Left Sidebar */}
          <div className={`lg:col-span-4 ${isMobile && selectedThreadId ? 'hidden' : ''}`}>
            <Card className="h-full flex flex-col bg-card backdrop-blur-sm border shadow-xl">
              {/* Search Header */}
              <div className="p-5 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 bg-background/70 border-border focus:bg-background focus:ring-2 focus:ring-ring transition-all duration-200"
                  />
                </div>
                
                {/* Quick Filter Badges */}
                <div className="flex space-x-2 mt-3 overflow-x-auto">
                  <Badge 
                    variant={activeFilter === 'all' ? 'secondary' : 'outline'} 
                    className="whitespace-nowrap cursor-pointer transition-colors hover:bg-secondary"
                    onClick={() => handleFilterChange('all')}
                  >
                    All
                  </Badge>
                  <Badge 
                    variant={activeFilter === 'unread' ? 'secondary' : 'outline'} 
                    className="whitespace-nowrap cursor-pointer transition-colors hover:bg-secondary"
                    onClick={() => handleFilterChange('unread')}
                  >
                    Unread
                  </Badge>
                  <Badge 
                    variant={activeFilter === 'hosts' ? 'secondary' : 'outline'} 
                    className="whitespace-nowrap cursor-pointer transition-colors hover:bg-secondary"
                    onClick={() => handleFilterChange('hosts')}
                  >
                    Hosts
                  </Badge>
                  <Badge 
                    variant={activeFilter === 'guests' ? 'secondary' : 'outline'} 
                    className="whitespace-nowrap cursor-pointer transition-colors hover:bg-secondary"
                    onClick={() => handleFilterChange('guests')}
                  >
                    Guests
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <MessageList
                  currentUserEmail={session.user.email || ''}
                  selectedThreadId={selectedThreadId || undefined}
                  onThreadSelect={handleThreadSelect}
                  activeFilter={activeFilter}
                  searchQuery={searchQuery}
                />
              </div>
            </Card>
          </div>

          {/* Enhanced Message Conversation - Main Content */}
          <div className={`lg:col-span-8 ${isMobile && !selectedThreadId ? 'hidden' : ''}`}>
            <Card className="h-full bg-card backdrop-blur-sm border shadow-xl overflow-hidden">
              {selectedThreadId ? (
                <div className="h-full relative">
                  {isMobile && (
                    <div className="absolute top-4 left-4 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToList}
                        className="bg-background/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        ← Back
                      </Button>
                    </div>
                  )}
                  <MessageConversation
                    threadId={selectedThreadId}
                    currentUserEmail={session.user.email || ''}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-sm mx-auto p-8">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center mx-auto shadow-lg">
                        <MessageSquare className="w-10 h-10 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background shadow-sm animate-pulse"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      Ready to connect?
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Select a conversation from the list to start messaging, or create a new conversation to connect with someone new.
                    </p>
                    
                    <Button 
                      onClick={() => setShowUserSearch(true)}
                      className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Enhanced Empty State - When no conversations exist */}
        {!selectedThreadId && (
          <div className="lg:hidden mt-6">
            <Card className="p-8 text-center bg-card backdrop-blur-sm border shadow-xl">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background shadow-sm">
                  <Plus className="w-3 h-3 text-primary-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                Your inbox awaits
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
                Start meaningful conversations with hosts and guests. Your next amazing experience is just a message away!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setShowUserSearch(true)}
                  className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4 mr-2" /> New Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/search'}
                  className="border-border hover:bg-accent transition-colors"
                >
                  Browse Listings
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}