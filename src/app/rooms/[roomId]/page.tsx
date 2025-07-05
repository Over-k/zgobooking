// src/app/rooms/[roomId]/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { Prisma } from '@prisma/client';
import BackButton from "@/components/room/BackButton";
import RoomHeader from "@/components/room/RoomHeader";
import RoomImages from "@/components/room/RoomImages";
import RoomDetails from "@/components/room/RoomDetails";
import RoomAmenities from "@/components/room/RoomAmenities";
import RoomReviews from "@/components/room/RoomReviews";
import RoomLocation from "@/components/room/RoomLocation";
import BookingCard from "@/components/room/BookingCard";
import MeetYourHost from "@/components/room/MeetYourHost";
import ThingsToKnow from "@/components/room/ThingsToKnow";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

// Types
type Room = Prisma.ListingGetPayload<{
  include: {
    location: true;
    images: true;
    amenities: true;
    host: {
      include: {
        hostInfo: true;
      };
    };
    reviews: {
      include: {
        user: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            profileImage: true;
          };
        };
      };
    };
    houseRules: true;
    safetyFeatures: true;
    availableDates: true;
    cancellationPolicy: true;
  };
}>;

interface RoomApiResponse {
  data: Room;
  success: boolean;
  message?: string;
}

// Constants
const CACHE_TTL = 60; // 1 minute
const API_TIMEOUT = 5000; // 5 seconds

/**
 * Skeleton loader for the room page
 */
const RoomSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:grid-rows-2 h-64 md:h-96">
        <Skeleton className="h-full rounded-lg md:col-span-2 md:row-span-2" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
        <Skeleton className="h-full rounded-lg hidden md:block" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Fetches room data from the API with error handling and timeout
 */
async function getRoom(id: string): Promise<Room> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`,
      {
        next: { revalidate: CACHE_TTL },
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to fetch room (HTTP ${response.status})` 
      }));
      throw new Error(error.message);
    }

    const { data }: RoomApiResponse = await response.json();
    if (!data) {
      throw new Error('Invalid room data structure received');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error.message || 'Failed to fetch room details');
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Generate dynamic metadata for the room page
 */
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ roomId: string }> 
}): Promise<Metadata> {
  const { roomId } = await params;
  try {
    const room = await getRoom(roomId);
    return {
      title: `${room.title} - ${room.location?.city}, ${room.location?.country}`,
      description: room.description || `Book ${room.title} for your next stay`,
      openGraph: {
        title: room.title,
        description: room.description || `Book ${room.title} for your next stay`,
        images: room.images.length > 0 ? [room.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Room Details',
      description: 'View details about this room',
    };
  }
}

export default async function RoomPage({ 
  params 
}: { 
  params: Promise<{ roomId: string }> 
}) {
  const { roomId } = await params;
  let room: Room | null = null;
  let error: string | null = null;

  try {
    room = await getRoom(roomId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'An unexpected error occurred';
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <ErrorDisplay 
          title="Error Loading Room"
          message={error}
          retryLink={`/rooms/${roomId}`}
        />
      </div>
    );
  }

  if (!room) {
    return <RoomSkeleton />;
  }

  return (
    <div className="relative pb-8">
      <BackButton />
      <Suspense fallback={<RoomSkeleton />}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <RoomHeader 
            room={{
              location: room.location,
              rating: room.rating,
              reviewsCount: room.reviewsCount,
              title: room.title,
              id: room.id
            }} 
          />
          <RoomImages images={room.images} />

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              <RoomDetails room={room} />
              <RoomAmenities amenities={room.amenities || {}} />
              <RoomReviews listingId={room.id} />
              <RoomLocation room={room} />
              <MeetYourHost room={room} />
              <ThingsToKnow room={room} />
            </div>
            <div className="lg:w-1/3 sticky top-4 h-fit">
              <BookingCard room={room} />
            </div>
          </div>
        </main>
      </Suspense>
    </div>
  );
}