// layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminLayoutClient from "./AdminLayoutClient";

async function getStats(userId: string) {
  const [currentUser, totalUsers, totalHostRequests, totalNotifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    }),
    prisma.user.count(),
    prisma.hostRequest.count({
      where: { status: "pending" },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return { currentUser, totalUsers, totalHostRequests, totalNotifications };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const stats = await getStats(session.user.id);

  if (!stats.currentUser) {
    redirect("/auth/signin"); // or handle appropriately
  }

  return <AdminLayoutClient stats={stats}>{children}</AdminLayoutClient>;
}
