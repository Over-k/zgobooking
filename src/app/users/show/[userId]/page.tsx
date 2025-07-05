// src/app/users/show/[userId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { HostInfo, User as PrismaUser, User, Review } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import UserReviews from "@/components/user/UserReviews";
import UserListings from "@/components/user/UserListings";
import UserHeader from "@/components/user/UserHeader";
import UserAbout from "@/components/user/UserAbout";
import IdentityBadge from "@/components/user/IdentityBadge";

export const dynamic = 'force-dynamic';

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

async function getUser(userId: string): Promise<PrismaUser & { reviewsGiven: Review[]; reviewsReceived: Review[] } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hostInfo: true,
        securitySettings: true,
        accountSettings: true,
        notificationPreferences: true,
        reviewsGiven: true,
        reviewsReceived: true,
      },
    });
    return user ? user : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;
  const user = await getUser(userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <UserHeader user={user as unknown as User & { hostInfo: HostInfo | null }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <UserAbout user={user as unknown as User & { hostInfo: HostInfo | null }} />
            <Separator className="my-8" />
            <section>
              <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
              <Suspense fallback={<div>Loading reviews...</div>}>
                <UserReviews user={user as unknown as User & { reviewsGiven: Review[]; reviewsReceived: Review[] }} />
              </Suspense>
            </section>
            <Separator className="my-8" />
            <section>
              <h2 className="text-2xl font-semibold mb-4">Listings</h2>
              <Suspense fallback={<div>Loading listings...</div>}>
                <UserListings userId={user.id} />
              </Suspense>
            </section>
          </div>
          <div>
            <IdentityBadge user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
