'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onDeleteRead: () => void;
}

export function Notifications({ notifications, onMarkAllAsRead, onDeleteRead }: NotificationsProps) {
  const { data: session } = useSession();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isDeletingRead, setIsDeletingRead] = useState(false);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-sm opacity-60">Please sign in to view notifications</p>
        </div>
      </div>
    );
  }

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDeleteRead = async () => {
    setIsDeletingRead(true);
    try {
      await onDeleteRead();
    } finally {
      setIsDeletingRead(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center">
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
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-sm opacity-60">You don't have any notifications right now</p>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zm0-10H4l5-5v5zm6 0h5l-5-5v5z" />
          </svg>
        );
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-semibold">{notifications.length}</div>
            <div className="text-sm opacity-60">Total</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-semibold">{unreadCount}</div>
            <div className="text-sm opacity-60">Unread</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-semibold">{readCount}</div>
            <div className="text-sm opacity-60">Read</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-semibold">
              {new Set(notifications.map(n => n.type)).size}
            </div>
            <div className="text-sm opacity-60">Types</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleMarkAllAsRead} 
            disabled={notifications.every(n => n.isRead) || isMarkingAllRead}
            className="flex items-center gap-2"
          >
            {isMarkingAllRead && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            Mark all as read
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteRead}
            disabled={notifications.every(n => !n.isRead) || isDeletingRead}
            className="flex items-center gap-2"
          >
            {isDeletingRead && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            Clear read notifications
            {readCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {readCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <Card 
            key={notification.id} 
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              !notification.isRead && "ring-1 ring-current ring-opacity-20"
            )}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getBadgeVariant(notification.type)}
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {getNotificationIcon(notification.type)}
                    <span className="capitalize">{notification.type}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{format(new Date(notification.createdAt), "MMM d, yyyy 'at' HH:mm")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {index === 0 && !notification.isRead && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    notification.isRead ? "opacity-30" : "opacity-100"
                  )}
                  style={{ backgroundColor: 'currentColor' }}
                  title={notification.isRead ? "Read" : "Unread"}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className={cn(
                "text-sm leading-relaxed",
                notification.isRead && "opacity-60"
              )}>
                {notification.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load more placeholder for future enhancement */}
      {notifications.length >= 20 && (
        <div className="text-center py-4">
          <Button variant="outline" disabled>
            Load more notifications
          </Button>
        </div>
      )}
    </div>
  );
}