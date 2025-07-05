'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

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

  if (!session?.user?.id) {
    return <div className="flex items-center justify-center h-screen">Please sign in to view notifications</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-4">
          <Button onClick={onMarkAllAsRead} disabled={notifications.every(n => n.isRead)}>
            Mark all as read
          </Button>
          <Button
            variant="destructive"
            onClick={onDeleteRead}
            disabled={notifications.every(n => !n.isRead)}
          >
            Delete read notifications
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">No notifications yet</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={notification.type === "error" ? "destructive" : "default"}
                    className={cn(
                      "px-3 py-1 text-sm",
                      notification.type === "error" && "bg-red-500/20 text-red-500"
                    )}
                  >
                    {notification.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(notification.createdAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    notification.isRead ? "bg-gray-300" : "bg-blue-500"
                  )}
                />
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-sm",
                  notification.isRead && "text-muted-foreground"
                )}>
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
