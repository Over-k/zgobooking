// src/components/user/ListingCard.tsx
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types/listing";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/rooms/${listing.id}`} className="block group">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
        <Image
          src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1579525441328-57527a081c9b"}
          alt={listing.images?.[0]?.caption || "Listing image"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{listing.location?.city || "Location not specified"}</h3>
          {listing.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm">{listing.rating}</span>
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm">{listing.propertyType}</p>
        <p className="mt-1">
          <span className="font-medium">
            {listing.currency === "USD" ? "$" : listing.currency}{" "}
            {listing.price}
          </span>
          <span className="text-muted-foreground"> night</span>
        </p>
      </div>
    </Link>
  );
}
