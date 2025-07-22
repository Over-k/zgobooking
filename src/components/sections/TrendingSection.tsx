"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Star, Heart, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingListing } from "@/types/listing";
import { useRouter } from "next/navigation";

export function TrendingSection() {
  const router = useRouter();
  const [listings, setListings] = useState<TrendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // Add state for random listing values
  const [listingRandoms, setListingRandoms] = useState<Record<string, { rating: number; price: number; views: number }>>({});

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/listings/trending");
        if (!res.ok) {
          throw new Error("Failed to fetch trending destinations");
        }
        const data = await res.json();
        setListings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Generate random values for each listing after listings are loaded
  useEffect(() => {
    if (!loading && listings.length > 0) {
      setListingRandoms((prev) => {
        const newRandoms = { ...prev };
        listings.forEach((listing) => {
          if (!newRandoms[listing.id]) {
            newRandoms[listing.id] = {
              rating: +(4.0 + Math.random() * 1).toFixed(1),
              price: Math.floor(Math.random() * 200) + 50,
              views: Math.floor(Math.random() * 500) + 100,
            };
          }
        });
        return newRandoms;
      });
    }
  }, [loading, listings]);

  const toggleFavorite = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="space-y-8 py-12">
      {/* Enhanced Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
            Hot Right Now
          </span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
          Trending Destinations
        </h2>
        <p className="text-lg text-muted-foreground">
          Discover the most sought-after places where travelers are booking right now
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="group">
              <Card className="overflow-hidden">
                <div className="relative">
                  <Skeleton className="h-48 w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="p-8 text-center border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Unable to load trending destinations</p>
            <p className="text-sm mt-2 opacity-75">{error}</p>
          </div>
        </Card>
      )}

      {/* Enhanced Listing Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing, index) => (
            <Card
              key={listing.id}
              className="cursor-pointer overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              onClick={() => router.push(`/rooms/${listing.id}`)}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={listing.images[0]?.url || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Trending badge */}
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg flex items-center gap-1.5 px-3 py-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">Trending</span>
                </Badge>

                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(e, listing.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      favorites.has(listing.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  />
                </button>

                {/* View count indicator */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Eye className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">
                    {listingRandoms[listing.id]?.views ?? '—'}
                  </span>
                </div>
              </div>

              <CardContent className="p-5 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" title={listing.title}>
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                    <span className="truncate">
                      {listing.location?.city}, {listing.location?.country}
                    </span>
                  </div>
                </div>

                {/* Enhanced footer with rating and price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {listingRandoms[listing.id]?.rating ?? '—'}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      ${listingRandoms[listing.id]?.price ?? '—'}
                      <span className="text-xs font-normal text-gray-500"> /night</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced empty state */}
      {!loading && !error && listings.length === 0 && (
        <Card className="p-12 text-center border-dashed border-2 border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No trending destinations found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for the latest trending destinations
          </p>
        </Card>
      )}
    </div>
  );
}