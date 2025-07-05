"use client";
import { Review, User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

type UserWithRelations = User & {
  hostInfo?: {
    id: string;
    isVerified: boolean;
    verificationStatus: string;
  };
  securitySettings?: {
    id: string;
    twoFactorEnabled: boolean;
  };
  accountSettings?: {
    id: string;
    emailNotifications: boolean;
  };
  notificationPreferences?: {
    id: string;
    emailNotifications: boolean;
  };
};

interface ReviewCardProps {
  review?: Review & { hostId: string; categories: string[] } & { listingId: string } & { userId: string } & { bookingId: string };
  reviewId?: string;
}

export default function ReviewCard({ review, reviewId }: ReviewCardProps) {
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [reviewData, setReviewData] = useState<Review & { hostId: string; categories: string[] } & { listingId: string } & { userId: string } & { bookingId: string } | null>(review || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (reviewId && !review) {
          const response = await fetch(`/api/reviews/${reviewId}`);
          if (!response.ok) throw new Error('Failed to fetch review');
          const reviewData = await response.json();
          setReviewData(reviewData);
        }

        if (reviewData) {
          const userResponse = await fetch(`/api/users/${reviewData.userId}`);
          if (!userResponse.ok) throw new Error('Failed to fetch user');
          const userData = await userResponse.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [review, reviewId, reviewData]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 bg-muted animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!reviewData || !user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMMM yyyy");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
          <Image
            src={user.profileImage || "/api/placeholder/48/48"}
            alt={user.firstName || "User"}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{user.firstName} {user.lastName}</h4>
          <p className="text-sm text-muted-foreground">
            {formatDate(reviewData.createdAt.toISOString())}
          </p>
          {user.city && (
            <p className="text-sm text-muted-foreground">{user.city}, {user.country}</p>
          )}
        </div>
      </div>
      <p className="text-foreground">{reviewData.comment}</p>
      {reviewData.response && (
        <div className="mt-4 ml-12 bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-1 text-foreground">Response from host</p>
          {reviewData.responseCreatedAt && (
            <p className="text-sm text-muted-foreground">
              {formatDate(reviewData.responseCreatedAt.toISOString())}
            </p>
          )}
          <p className="text-sm mt-2 text-foreground">{reviewData.response}</p>
        </div>
      )}
    </div>
  );
}
