"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { BookingSkeleton } from "@/components/booking/BookingSkeleton";
import { BookingListing } from "@/types/booking";

export const dynamic = 'force-dynamic';

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { 
    listing, 
    setListing,
    checkInDate, 
    checkOutDate, 
    guests, 
    priceDetails,
    isBookingValid,
    totalNights,
    setCheckInDate,
    setCheckOutDate,
    setGuests,
    setContactInfo
  } = useBooking();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/listings/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch room data');
        }

        const res = await response.json();
        const data = res.data;
        // Ensure all required fields are present
        const transformedListing: BookingListing = {
          ...data,
          images: data.images || [],
          amenities: data.amenities || [],
          houseRules: data.houseRules || [],
          safetyFeatures: data.safetyFeatures || [],
          location: data.location || null,
          host: data.host || null,
          cancellationPolicy: data.cancellationPolicy || null
        };

        setListing(transformedListing);

        // Set initial dates if they're not already set
        if (!checkInDate && data.checkInDate) {
          setCheckInDate(new Date(data.checkInDate));
        }
        if (!checkOutDate && data.checkOutDate) {
          setCheckOutDate(new Date(data.checkOutDate));
        }

        // Set initial guests if they're not already set
        if (!guests.adults) {
          setGuests({
            adults: 1,
            children: 0,
            infants: 0,
            pets: 0
          });
        }

        // Reset contact info
        setContactInfo({
          email: "",
          phone: "",
          specialRequests: ""
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error fetching room:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [id, setListing, guests, setCheckInDate, setCheckOutDate, setGuests, setContactInfo]);


  if (isLoading) return <BookingSkeleton />;
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Room</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Room Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the room you're looking for.</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BookingForm />
        </div>
        <div className="lg:col-span-1">
          <BookingSummary 
            listing={listing}
            checkInDate={checkInDate!}
            checkOutDate={checkOutDate!}
            guests={guests}
            priceDetails={priceDetails}
            totalNights={totalNights}
          />
        </div>
      </div>
    </div>
  );
}