"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, Flag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  categories: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
  photos?: {
    id: string;
    url: string;
  }[];
  response?: {
    comment: string;
    createdAt: string;
  };
}

interface UserReviewsProps {
  listingId: string;
}

export default function UserReviews({ listingId }: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}/reviews`);
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  const ReviewItem = ({ review }: { review: Review }) => {
    return (
      <div className="space-y-3 mb-6">
        <div className="flex items-center">
          <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
            <Image
              src={review.userImage}
              alt={review.userName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p
              className="font-medium hover:underline hover:cursor-pointer"
              onClick={() => router.push(`/users/show/${review.userId}`)}
            >
              {review.userName}
            </p>
            <p className="text-muted-foreground text-sm">
              {format(new Date(review.date), "MMMM yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center text-sm space-x-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <Star
                key={idx}
                className={`h-3 w-3 ${
                  idx < review.rating ? "fill-current" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-foreground">{review.comment}</p>

        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {review.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <Image
                  src={photo.url}
                  alt="Review photo"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {review.response && (
          <div className="mt-4 ml-12 bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-1">Response from host</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(review.response.createdAt), "MMMM yyyy")}
            </p>
            <p className="text-sm mt-2">{review.response.comment}</p>
          </div>
        )}

        <div className="flex items-center space-x-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  const displayedReviews = reviews.slice(0, 2);

  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <Star className="h-5 w-5 fill-current" />
        <span className="ml-2 font-medium text-lg">
          {reviews.length > 0
            ? `${(
                reviews.reduce((acc, review) => acc + review.rating, 0) /
                reviews.length
              ).toFixed(1)} · ${reviews.length} reviews`
            : "No reviews yet"}
        </span>
      </div>

      {/* Reviews Preview */}
      <div className="space-y-2">
        {displayedReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 2 && (
        <Button
          variant="outline"
          className="mt-6 border border-border rounded-lg py-2 px-4 hover:bg-accent"
          onClick={() => setShowAllReviews(true)}
        >
          Show all {reviews.length} reviews
        </Button>
      )}

      {/* All Reviews Modal */}
      <Dialog open={showAllReviews} onOpenChange={setShowAllReviews}>
        <DialogContent className="max-w-4xl max-h-screen p-0 overflow-hidden">
          <DialogHeader className="flex justify-between items-center p-4">
            <DialogTitle>{reviews.length} reviews</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left sidebar - Rating stats */}
              <div className="col-span-1">
                <div className="space-y-4">
                  {["Cleanliness", "Communication", "Check-in", "Accuracy", "Location", "Value"].map(
                    (category) => {
                      const avgRating =
                        reviews.reduce(
                          (acc, review) =>
                            acc + review.categories[category.toLowerCase() as keyof typeof review.categories],
                          0
                        ) / reviews.length;

                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <span>{category}</span>
                          <span className="font-medium">
                            {avgRating.toFixed(1)}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Right side - Reviews list */}
              <div className="col-span-2 max-h-[70vh] overflow-y-auto pr-4 border-l border-card pl-4">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <ReviewItem review={review} />
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Separator className="my-8" />
    </div>
  );
} 