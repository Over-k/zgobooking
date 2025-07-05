"use client";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Star, Calendar as CalendarIcon, X, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import Image from "next/image";
import { DateRange } from "react-day-picker";
import { BookingListing } from "@/types/booking";


type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

type PriceDetails = {
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  nights?: number;
};

type BookingSummaryProps = {

  listing: BookingListing;
  checkInDate?: Date;
  checkOutDate?: Date;
  guests: GuestCounts;
  priceDetails: PriceDetails;
  totalNights: number;
};

type GuestType = keyof GuestCounts;

type BookingSummaryState = {
  dates: DateRange | undefined;
  guests: GuestCounts;
  priceDetails: PriceDetails;
};

export function BookingSummary({
  listing,
  checkInDate,
  checkOutDate,
  guests,
  priceDetails,
  totalNights,
}: BookingSummaryProps) {
  const {
    setCheckInDate,
    setCheckOutDate,
    setGuests,
    isSubmitting,
  } = useBooking();

  // Local UI state
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);

  const renderPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: listing.currency || 'USD',
    }).format(price);
  };

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

  const isSameDaySelected = checkInDate && checkOutDate && isSameDay(checkInDate, checkOutDate);
  return (
    <div className="rounded-xl border shadow-md p-6 sticky top-24">
      {/* Property Info */}
      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
        <Image
          src={listing.images[0]?.url || '/placeholder.jpg'}
          alt={listing.description || 'Room image'}
          fill
          className="object-cover"
        />
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 fill-current" />
          <span>{listing.rating}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-600 underline">
            {listing.reviewsCount} reviews
          </span>
        </div>
        <h3 className="text-lg font-semibold">{listing.description}</h3>
        <p className="text-sm text-gray-600">{listing.location?.address}</p>
      </div>

      {/* Trip Summary with Interactive Controls */}
      <div className="border rounded-lg mb-6">
        {/* Dates */}
        <div className="border-b">
          <div className="p-3">
            <p className="text-xs font-bold mb-2">DATES</p>
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
              <PopoverContent className="p-0 w-auto rounded z-50" align="start">
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
          <p className="text-xs font-bold mb-2">GUESTS</p>
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
            <PopoverContent className="w-72 p-4 rounded z-50" align="start">
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

      {/* Price Breakdown */}
      {!isSameDaySelected && (
        <div className="py-6 space-y-4">
          <div className="flex justify-between">
            <span className="underline">
              {renderPrice(priceDetails.nightlyRate)} x {totalNights} nights
            </span>
            <span>{renderPrice(priceDetails.nightlyRate * totalNights)}</span>
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

          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{renderPrice(priceDetails.total)}</span>
          </div>
        </div>
      )}

      {isSameDaySelected ? (
        <p className="text-center text-sm text-red-500 mt-4">
          Please select different check-in and check-out dates
        </p>
      ) : (
        <p className="text-center text-sm text-gray-500 mt-4">
          You won't be charged yet
        </p>
      )}
    </div>
  );
} 