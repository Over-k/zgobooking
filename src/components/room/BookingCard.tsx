"use client";
import { Star, Calendar as CalendarIcon, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { useBooking } from "@/context/BookingContext";
import { Prisma } from "@prisma/client";
import { BookingListing } from "@/types/booking";

interface BookingCardProps {
  room: Prisma.ListingGetPayload<{
    include: {
      host: {
        include: {
          hostInfo: true;
        };
      };
    };
  }>;
}

export default function BookingCard({ room }: BookingCardProps) {
  const router = useRouter();
  const {
    checkInDate,
    checkOutDate,
    guests,
    priceDetails,
    setCheckInDate,
    setCheckOutDate,
    setGuests,
    setListing,
  } = useBooking();

  // Set the listing in context when component mounts
useEffect(() => {
  const transformedListing = {
    ...room,
    host: {
      id: room.hostId,
      name: room.host.firstName + " " + room.host.lastName,
      image: room.host.profileImage,
      rating: room.host.hostInfo?.averageRating || 0,
      reviewsCount: room.host.hostInfo?.totalReviews || 0,
      responseRate: room.host.hostInfo?.responseRate || 0,
      responseTime: room.host.hostInfo?.responseTime || "",
      isSuperhost: room.host.hostInfo?.superhost || false,
      description: room.host.bio || ""
    }
  };
  setListing(transformedListing as unknown as BookingListing);
}, [room, setListing]);

  // Local UI state
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);

  const resetDates = () => {
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
  };

  const handleGuestChange = (type: keyof typeof guests, val: number) => {
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, val) }));
  };

  const totalGuestCount = guests.adults + guests.children;

  const guestSummary = () => {
    if (totalGuestCount === 0) return "";
    const parts = [`${totalGuestCount} guest${totalGuestCount > 1 ? "s" : ""}`];
    if (guests.infants) {
      parts.push(`${guests.infants} infant${guests.infants > 1 ? "s" : ""}`);
    }
    if (guests.pets) {
      parts.push(`${guests.pets} pet${guests.pets > 1 ? "s" : ""}`);
    }
    return parts.join(", ");
  };

  const handleReserve = () => {
    router.push(`/booking/${room.id}`);
  };

  const renderPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: room.currency || 'USD',
    }).format(price);
  };

  const isSameDaySelected = checkInDate && checkOutDate && isSameDay(checkInDate, checkOutDate);
  const isReserveDisabled = !checkInDate || !checkOutDate || totalGuestCount === 0 || isSameDaySelected;

  return (
    <div className="rounded-xl border shadow-md p-6 sticky top-24">
      {/* Price per night */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xl font-bold">
            {renderPrice(priceDetails.nightlyRate || room.price)}
          </span>
          <span className="text-muted-foreground"> night</span>
        </div>
        <div className="flex items-center text-sm">
          <Star className="h-4 w-4 fill-current" />
          <span className="ml-1">{room.rating}</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className="text-muted-foreground underline">
            {room.reviewsCount ?? 0} reviews
          </span>
        </div>
      </div>

      {/* Date picker and guest selector */}
      <div className="border rounded-lg mb-4">
        {/* Dates */}
        <div className="grid grid-cols-1 border-b">
          <div className="p-3">
            <p className="text-xs font-bold">DATES</p>
            <Popover
              open={isDatePopoverOpen}
              onOpenChange={setIsDatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center w-full text-left text-sm outline-none cursor-pointer"
                  onClick={() => setIsDatePopoverOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsDatePopoverOpen(true);
                    }
                  }}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {checkInDate && checkOutDate ? (
                    <>
                      {format(checkInDate, "MMM dd")} -{" "}
                      {format(checkOutDate, "MMM dd")}
                    </>
                  ) : (
                    <span>Add dates</span>
                  )}
                  {(checkInDate || checkOutDate) && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        resetDates();
                      }}
                      className="ml-2 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto rounded z-50">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={{ from: checkInDate, to: checkOutDate }}
                  onSelect={(range) => {
                    if (range?.from) setCheckInDate(range.from);
                    if (range?.to) setCheckOutDate(range.to);
                  }}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 2}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />
                <div className="p-3 border-t flex justify-between">
                  <Button variant="outline" onClick={resetDates}>
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      if (checkInDate && checkOutDate)
                        setIsDatePopoverOpen(false);
                    }}
                    disabled={!checkInDate || !checkOutDate}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Guests */}
        <div className="p-3">
          <p className="text-xs font-bold">GUESTS</p>
          <Popover
            open={isGuestPopoverOpen}
            onOpenChange={setIsGuestPopoverOpen}
          >
            <PopoverTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                className="flex items-center text-sm w-full text-left cursor-pointer"
                onClick={() => setIsGuestPopoverOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsGuestPopoverOpen(true);
                  }
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                {guestSummary() || "Add guests"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 rounded z-50">
              {/* Guest selection */}
              {["adults", "children", "infants", "pets"].map((type) => (
                <div
                  key={type}
                  className="flex justify-between items-center mb-4"
                >
                  <div>
                    <p className="font-medium capitalize">{type}</p>
                    <p className="text-sm text-muted-foreground">
                      {type === "adults" && "13 or older"}
                      {type === "children" && "2–12"}
                      {type === "infants" && "Under 2"}
                      {type === "pets" && "Service animals allowed"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={
                        guests[type as keyof typeof guests] <= 0
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleGuestChange(
                          type as keyof typeof guests,
                          guests[type as keyof typeof guests] - 1
                        );
                      }}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">
                      {guests[type as keyof typeof guests]}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleGuestChange(
                          type as keyof typeof guests,
                          guests[type as keyof typeof guests] + 1
                        );
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <Button size="sm" onClick={() => setIsGuestPopoverOpen(false)}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Reserve Button */}
      <Button
        className="w-full mb-4 primary font-medium"
        onClick={handleReserve}
        disabled={isReserveDisabled}
      >
        Reserve
      </Button>

      {isSameDaySelected && (
        <p className="text-center text-sm text-red-500 mb-6">
          Please select different check-in and check-out dates
        </p>
      )}

      {!isSameDaySelected && (
        <p className="text-center text-sm text-muted-foreground mb-6">
          You won't be charged yet
        </p>
      )}

      {/* Price breakdown */}
      {checkInDate && checkOutDate && !isSameDaySelected && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="underline">
              {renderPrice(priceDetails.nightlyRate)} x {priceDetails.nights} nights
            </span>
            <span>
              {renderPrice(priceDetails.nightlyRate * priceDetails.nights)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>{renderPrice(priceDetails.cleaningFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee</span>
            <span>{renderPrice(priceDetails.serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Taxes</span>
            <span>{renderPrice(priceDetails.taxes)}</span>
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{renderPrice(priceDetails.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
