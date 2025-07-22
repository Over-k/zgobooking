import { Notification } from "@prisma/client";
import { mockUsers } from "./users";

// Generate a few notification types for demo
const notificationTypes = [
  "booking_request",
  "booking_approved",
  "booking_cancelled",
  "host_request",
  "system_alert",
  "message",
  "review",
  "error"
];

// Helper to pick a random element
function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate a random date within the last 30 days
function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);
  return date;
}

export const mockNotifications: Notification[] = mockUsers.flatMap((user, i) => {
  // Each user gets 2-3 notifications
  const count = 2 + Math.floor(Math.random() * 2);
  return Array.from({ length: count }).map((_, j) => ({
    id: `notif-${user.id}-${j+1}`,
    type: randomOf(notificationTypes),
    message: `This is a ${randomOf(notificationTypes)} notification for ${user.firstName}.`,
    isRead: Math.random() < 0.5,
    createdAt: randomDate(),
    userId: user.id
  }));
}); 