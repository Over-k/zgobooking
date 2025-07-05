"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Notifications } from "@/components/notifications/notifications";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;
      
      try {
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
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session?.user?.id) {
    return <div className="flex items-center justify-center h-screen">Please sign in to view notifications</div>;
  }

  return (
    <Notifications
      notifications={notifications}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteRead={handleDeleteReadNotifications}
    />
  );
}
