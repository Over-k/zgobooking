"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";

interface RoomImagesProps {
  images: Prisma.ListingImageGetPayload<{}>[];
}

export default function RoomImages({ images }: RoomImagesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>(new Array(images.length).fill(false));

  // Set the primary image as the default selected image
  useEffect(() => {
    const primaryImageIndex = images.findIndex(
      (img) => typeof img !== "string" && img.isPrimary
    );
    if (primaryImageIndex >= 0) {
      setCurrentImageIndex(primaryImageIndex);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simulate loading time
    return () => clearTimeout(timer);
  }, [images]);

  const getImageUrl = (image: Prisma.ListingImageGetPayload<{}>): string => {
    return typeof image === "string" ? image : image.url;
  };

  const getImageCaption = (image: Prisma.ListingImageGetPayload<{}>): string | undefined => {
    return typeof image === "string" ? undefined : image.caption || undefined;
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:grid-rows-2 h-64 md:h-96">
        <Skeleton className="h-full rounded-lg md:col-span-2 md:row-span-2" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
      </div>
    );
  }

  // Gallery Carousel for Fullscreen View
  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-background backdrop-blur-md">
          <button
            onClick={() => setShowAllPhotos(false)}
            className="flex items-center gap-2 hover:opacity-80 transition "
          >
            <X size={20} /> Close
          </button>
          <span>
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex-grow flex items-center justify-center relative">
          <button
            onClick={handlePreviousImage}
            className="absolute left-4 bg-background hover:bg-background/20 p-2 rounded-full z-10"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="w-full h-full max-w-5xl max-h-screen p-4 relative">
            {!loadedImages[currentImageIndex] && (
              <Skeleton className="absolute inset-0" />
            )}
            <Image
              src={getImageUrl(images[currentImageIndex])}
              key={images[currentImageIndex].id}
              alt={getImageCaption(images[currentImageIndex]) || "Room photo"}
              fill
              className={cn(
                "object-contain transition-opacity duration-300",
                loadedImages[currentImageIndex] ? "opacity-100" : "opacity-0"
              )}
              priority={currentImageIndex === 0}
              loading={currentImageIndex === 0 ? "eager" : "lazy"}
              quality={75}
              onLoad={() => handleImageLoad(currentImageIndex)}
            />
          </div>

          <button
            onClick={handleNextImage}
            className="absolute right-4 bg-background hover:bg-background/20 p-2 rounded-full z-10"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Thumbnails at bottom */}
        <div className="p-4">
          <div className="flex gap-2 overflow-x-auto py-2 max-w-5xl mx-auto">
            {images.map((image, index) => (
              <div
                key={typeof image !== "string" ? image.id : index}
                className={`relative w-20 h-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-md ${
                  index === currentImageIndex
                    ? "ring-2 ring-ring/80"
                    : "opacity-70"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                {!loadedImages[index] && (
                  <Skeleton className="absolute inset-0" />
                )}
                <Image
                  src={getImageUrl(image)}
                  alt={getImageCaption(image) || "Room thumbnail"}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    loadedImages[index] ? "opacity-100" : "opacity-0"
                  )}
                  loading="lazy"
                  quality={50}
                  onLoad={() => handleImageLoad(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-8">
      {/* Airbnb-style Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:grid-rows-2 h-72 md:h-96 rounded-xl overflow-hidden">
        {/* Main Large Image */}
        <div
          className="relative md:col-span-2 md:row-span-2 cursor-pointer"
          onClick={() => {
            setCurrentImageIndex(0);
            setShowAllPhotos(true);
          }}
        >
          {!loadedImages[currentImageIndex] && (
            <Skeleton className="absolute inset-0" />
          )}
          <Image
            src={getImageUrl(images[currentImageIndex])}
            key={images[currentImageIndex].id}
            alt={getImageCaption(images[currentImageIndex]) || "Main room view"}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              loadedImages[currentImageIndex] ? "opacity-100" : "opacity-0"
            )}
            priority={currentImageIndex === 0}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
            quality={75}
            onLoad={() => handleImageLoad(currentImageIndex)}
          />
        </div>

        {/* Secondary Images */}
        {images.slice(1, 5).map((image, index) => (
          <div
            key={typeof image !== "string" ? image.id : index + 1}
            className="relative hidden md:block cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(index + 1);
              setShowAllPhotos(true);
            }}
          >
            {!loadedImages[index + 1] && (
              <Skeleton className="absolute inset-0" />
            )}
            <Image
              src={getImageUrl(image)}
              key={image.id}
              alt={getImageCaption(image) || `Room view ${index + 2}`}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                loadedImages[index + 1] ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
              quality={50}
              onLoad={() => handleImageLoad(index + 1)}
            />
          </div>
        ))}
      </div>

      {/* Show All Photos Button */}
      <button
        onClick={() => setShowAllPhotos(true)}
        className="absolute bottom-4 right-4  px-4 py-2 rounded-lg shadow-md font-medium text-sm flex items-center gap-2 hover:bg-white/20 transition"
      >
        Show all photos
      </button>
    </div>
  );
}
