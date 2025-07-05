"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { } from "@/types/listing";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Listing, ListingImage , Favorite } from "@prisma/client";

interface ListingCardProps extends Partial<Listing> {
  id: string;
  images: ListingImage[];
  location?: {
    city?: string;
    country?: string;
    neighborhood?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    address: string;
  };
  rating: number;
  hostName?: string;
  hostId?: string;
  propertyType: string;
  price: number;
  currency: string;
  hostYears?: number;
  hostImage?: string;
  dates?: string;
  nights?: number;
  favorites: Favorite[];
}

export const ListingCard = ({
  id,
  images,
  location,
  rating,
  hostName,
  propertyType,
  dates,
  price,
  currency = "MAD",
  nights,
  favorites,
  hostYears,
  hostImage,
  hostId,
}: ListingCardProps) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: session } = useSession();
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<boolean[]>(new Array(images?.length || 0).fill(false));
  const [imageError, setImageError] = useState<boolean[]>(new Array(images?.length || 0).fill(false));

  useEffect(() => {
    if (session?.user?.id) {
      const exists = (favorites ?? []).some((fav) => fav.userId === session.user.id);
      setSaved(exists);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [session, favorites]);

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!images || images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!images || images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSave = async () => {
    setIsLoadingFavorites(true);
    if (!session?.user) {
      toast.error("Please sign in to save listings");
      router.push("/auth/signin");
      return;
    }
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: id }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaved(data.action === "added");
        setIsLoadingFavorites(false);
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed to update favorite status");
      }
    } catch (error) {
      toast.error("Failed to update favorite status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  const handleImageError = (index: number) => {
    setImageError(prev => {
      const newError = [...prev];
      newError[index] = true;
      return newError;
    });
    setLoadedImages(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  const getFormattedLocation = () => {
    if (!location) return "Location not specified";
    const city = location.city || "Unknown city";
    const country = location.country || "Unknown country";
    return `${city}, ${country}`;
  };

  const getCurrentImageUrl = () => {
    if (!images || images.length === 0) return "";
    const currentImage = images[currentImageIndex];
    return currentImage?.url || "";
  };

  const formatPrice = () => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    return `${formattedPrice}${nights ? ` for ${nights} nights` : ' night'}`;
  };
  if (isLoading) {
    return (
      <Card className="w-full max-w-xs overflow-hidden rounded-xl border-0 shadow-sm">
        <div className="relative aspect-square h-[300px] overflow-hidden">
          <Skeleton className="h-full w-full" />
          <div className="absolute left-3 top-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="absolute right-3 top-3">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="absolute bottom-3 left-3">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1">
            {[1, 2, 3].map((_, index) => (
              <Skeleton key={index} className="h-1.5 w-1.5 rounded-full" />
            ))}
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-10" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xs overflow-hidden rounded-xl border-0 shadow-sm group py-0">
      <div className="relative w-full h-[300px] overflow-hidden">
        {(!loadedImages[currentImageIndex] ||
          imageError[currentImageIndex]) && (
          <Skeleton className="absolute inset-0" />
        )}
        {!imageError[currentImageIndex] && getCurrentImageUrl() && (
          <Image
            src={getCurrentImageUrl()}
            alt={`${getFormattedLocation()} property`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-opacity duration-300",
              loadedImages[currentImageIndex] ? "opacity-100" : "opacity-0"
            )}
            priority={currentImageIndex === 0}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
            quality={75}
            onLoad={() => handleImageLoad(currentImageIndex)}
            onError={() => handleImageError(currentImageIndex)}
          />
        )}

        {images && images.length > 1 && (
          <>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    index === currentImageIndex ? "bg-white w-3" : "bg-white/60"
                  )}
                />
              ))}
            </div>

            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md opacity-0 transition-opacity duration-200 hover:bg-card hover:text-card-foreground hover:opacity-100 group-hover:opacity-80 bg-card cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full shadow-md opacity-0 transition-opacity duration-200 hover:bg-card hover:text-card-foreground hover:opacity-100 group-hover:opacity-80 bg-card cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {images && images.length > 0 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="bg-background text-xs font-medium rounded-full px-2 py-1">
              {currentImageIndex + 1}/{images.length}
            </span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="absolute right-3 top-3 transition-transform hover:scale-110"
          aria-label={saved ? "Remove from favorites" : "Add to favorites"}
        >
          {isLoadingFavorites ? (
            <Skeleton className="h-6 w-6 rounded-full" />
          ) : (
            <Heart
              className={`h-6 w-6 ${saved ? "text-red-500" : "text-gray-400"}`}
              fill={saved ? "currentColor" : "none"}
              stroke={saved ? "none" : "currentColor"}
            />
          )}
        </button>

        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="text-xs font-medium">
            Guest favorite
          </Badge>
        </div>

        <div
          className="absolute bottom-3 left-3 hover:cursor-pointer"
          onClick={() => router.push(`/users/show/${hostId}`)}
        >
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage src={hostImage} alt={hostName} />
            <AvatarFallback>{hostName?.[0] || "?"}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div
        className="p-3 cursor-pointer"
        onClick={() => router.push(`/rooms/${id}`)}
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-medium">{getFormattedLocation()}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm">★</span>
              <span className="text-sm font-medium">
                {typeof rating === "number" ? rating.toFixed(1) : rating}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm">
          Stay with {hostName} · {propertyType}
          {hostYears && ` · Hosting for ${hostYears} years`}
        </p>

        {dates && <p className="text-sm">{dates}</p>}

        <p className="mt-1 text-sm font-medium">{formatPrice()}</p>
      </div>
    </Card>
  );
};
