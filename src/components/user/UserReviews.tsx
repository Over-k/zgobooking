// src/components/user/UserReviews.tsx
import { User, Review } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import ReviewCard from "./ReviewCard";

interface UserReviewsProps {
  user: User & { reviewsGiven: Review[]; reviewsReceived: Review[] };
}

export default function UserReviews({ user }: UserReviewsProps) {
  if (!user.reviewsGiven.length && !user.reviewsReceived.length) {
    return null;
  }

  const totalReviews = (user.reviewsGiven.length || 0) + (user.reviewsReceived.length || 0);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{totalReviews} reviews</h2>
      {user.reviewsGiven.map((review) => (
        <ReviewCard key={review.id} review={review as unknown as Review & { hostId: string; categories: string[] } & { listingId: string } & { userId: string } & { bookingId: string }} />
      ))}
      {user.reviewsReceived.map((review) => (
        <ReviewCard key={review.id} review={review as unknown as Review & { hostId: string; categories: string[] } & { listingId: string } & { userId: string } & { bookingId: string }} />
      ))}
      <Separator className="my-8" />
    </div>
  );
}
