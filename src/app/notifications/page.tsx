"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Notifications } from "@/components/notifications/notifications";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;
      
      try {
        setError(null);
        const response = await fetch('/api/notifications', {
          headers: {
            'x-session-id': session.user.id,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [session?.user?.id]);

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': session.user.id,
        },
        body: JSON.stringify({ action: 'markAllAsRead' }),
      });

      // Optimistic update
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setError("Failed to mark notifications as read.");
    }
  };

  const handleDeleteReadNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': session.user.id,
        },
        body: JSON.stringify({ action: 'deleteRead' }),
      });

      // Optimistic update
      setNotifications(prev =>
        prev.filter(n => !n.isRead)
      );
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      setError("Failed to delete notifications.");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-opacity-10 hover:bg-current transition-colors"
              aria-label="Go back"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-60">
                {notifications.filter(n => !n.isRead).length} unread
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent"></div>
            <p className="opacity-60">Loading notifications...</p>
          </div>
        ) : !session?.user?.id ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">Authentication Required</h2>
              <p className="opacity-60">Please sign in to view your notifications</p>
            </div>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="px-4 py-2 rounded-lg border hover:bg-opacity-10 hover:bg-current transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
              <p className="opacity-60 mb-4">{error}</p>
            </div>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg border hover:bg-opacity-10 hover:bg-current transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed flex items-center justify-center">
                <svg 
                  className="w-8 h-8 opacity-40" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zm0-10H4l5-5v5zm6 0h5l-5-5v5z" 
                  />
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">All caught up!</h2>
              <p className="opacity-60">You don't have any notifications right now</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Action Bar */}
            {notifications.some(n => !n.isRead) && (
              <div className="flex items-center justify-between mb-6 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  <span className="text-sm">
                    {notifications.filter(n => !n.isRead).length} unread notifications
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-3 py-1.5 text-sm rounded-md border hover:bg-opacity-10 hover:bg-current transition-colors"
                  >
                    Mark all as read
                  </button>
                  {notifications.some(n => n.isRead) && (
                    <button
                      onClick={handleDeleteReadNotifications}
                      className="px-3 py-1.5 text-sm rounded-md border hover:bg-opacity-10 hover:bg-current transition-colors"
                    >
                      Clear read
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Component */}
            <Notifications
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteRead={handleDeleteReadNotifications}
            />
          </div>
        )}
      </main>
    </div>
  );
}