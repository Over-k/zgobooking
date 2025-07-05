"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, DollarSign, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/types/listing";

export function RecentListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const response = await fetch(`/api/listings/host`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched listings:", data); // Debug log
        setListings(data);
      } else {
        console.error("Failed to fetch listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Debug log to see current state
  useEffect(() => {
    console.log("Listings state updated:", listings);
  }, [listings]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Fixed the return statement and syntax
  return (listings || []).length === 0 ? (
    <div className="text-center py-8">
      <p className="text-gray-500">No listings found</p>
      <Link
        href="/listings/new"
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Create Your First Listing
      </Link>
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Link href={`/listings/${listing.id}`} key={listing.id}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={listing.images?.[0]?.url || "/placeholder.jpg"}
                alt={listing.title}
                fill
                className="object-cover"
              />
              <Badge
                variant={
                  listing.status === "Active"
                    ? "default"
                    : listing.status === "Pending"
                    ? "secondary"
                    : "destructive"
                }
                className="absolute top-2 right-2"
              >
                {listing.status}
              </Badge>
            </div>

            <div className="p-4">
              <h3 className="font-semibold truncate">{listing.title}</h3>

              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>{(listing.rating || 0).toFixed(1)}</span>
                    <span className="ml-1">
                      ({listing.reviewsCount || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>
                      {listing.price.toLocaleString()} {listing.currency}
                    </span>
                    <span className="text-gray-500 ml-1">/night</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    Listed on{" "}
                    {format(new Date(listing.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
