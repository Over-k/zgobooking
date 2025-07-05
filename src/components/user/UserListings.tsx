// src/components/user/UserListings.tsx
"use client";
import ListingCard from "./ListingCard";
import { Listing, ListingImage, Favorite } from "@prisma/client";
import { useEffect, useState } from "react";

interface ListingWithRelations extends Listing {
  images: ListingImage[];
  favorites: Favorite[];
}

interface UserListingsProps {
  userId: string;
}

export default function UserListings({ userId }: UserListingsProps) {
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/listings`);
        if (!response.ok) throw new Error('Failed to fetch listings');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg p-4 animate-pulse">
            <div className="h-48 bg-muted-foreground/20 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-muted-foreground/20 rounded"></div>
              <div className="h-4 w-1/2 bg-muted-foreground/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No listings found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
