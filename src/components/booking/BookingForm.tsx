"use client";
import { useBooking } from "@/context/BookingContext";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Users, X, Clock, Shield, Sparkles, Key, MessageCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingForm() {
  const router = useRouter();
  const {
    listing,
    checkInDate,
    checkOutDate,
    guests,
    contactInfo,
    setCheckInDate,
    setCheckOutDate,
    setGuests,
    setContactInfo,
    isBookingValid,
    priceDetails,
    isSubmitting,
    setIsSubmitting,
  } = useBooking();

  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);

  if (!listing) return null;

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
    if (guests.infants) parts.push(`${guests.infants} infant${guests.infants > 1 ? "s" : ""}`);
    if (guests.pets) parts.push(`${guests.pets} pet${guests.pets > 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  const checkInTime = "3:00 PM";
  const checkOutTime = "11:00 AM";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBookingSubmit();
  };
  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!isBookingValid || !listing || !checkInDate || !checkOutDate) {
        throw new Error('Invalid booking data');
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          adults: guests.adults,
          children: guests.children,
          infants: guests.infants,
          pets: guests.pets,
          nightlyRate: priceDetails.nightlyRate,
          cleaningFee: priceDetails.cleaningFee,
          serviceFee: priceDetails.serviceFee,
          taxes: priceDetails.taxes,
          contactEmail: contactInfo.email,
          contactPhone: contactInfo.phone,
          specialRequests: contactInfo.specialRequests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Return to Listing</h1>
      </div>

      {/* Trip Details Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Trip</h2>
        
        <div className="space-y-4">
          {/* Dates */}
          <div className="border rounded-lg">
            <div className="p-4">
              <Label className="text-sm font-semibold mb-2">Dates</Label>
              <Popover
                open={isDatePopoverOpen}
                onOpenChange={setIsDatePopoverOpen}
              >
                <PopoverTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex items-center w-full text-left text-sm outline-none cursor-pointer mt-1"
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
                      <span>Select dates</span>
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
                <PopoverContent className="p-0 w-auto" align="start">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={{ from: checkInDate, to: checkOutDate }}
                    onSelect={(range) => {
                      if (range?.from) setCheckInDate(range.from);
                      if (range?.to) setCheckOutDate(range.to);
                    }}
                    initialFocus
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

            {checkInDate && checkOutDate && (
              <div className="border-t p-4 grid grid-cols-2 gap-4 bg-muted">
                <div>
                  <p className="text-sm font-medium">Check-in</p>
                  <p className="text-sm text-muted-foreground">{checkInTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Checkout</p>
                  <p className="text-sm text-muted-foreground">{checkOutTime}</p>
                </div>
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="border rounded-lg p-4">
            <Label className="text-sm font-semibold mb-2">Guests</Label>
            <Popover
              open={isGuestPopoverOpen}
              onOpenChange={setIsGuestPopoverOpen}
            >
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center text-sm w-full text-left cursor-pointer mt-1"
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
              <PopoverContent className="w-80 p-4" align="start">
                {["adults", "children", "infants", "pets"].map((type) => (
                  <div
                    key={type}
                    className="flex justify-between items-center mb-4"
                  >
                    <div>
                      <p className="font-medium capitalize">{type}</p>
                      <p className="text-sm text-muted-foreground">
                        {type === "adults" && "Ages 13+"}
                        {type === "children" && "Ages 2-12"}
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
                <Button 
                  className="w-full mt-2" 
                  onClick={() => setIsGuestPopoverOpen(false)}
                >
                  Apply
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={contactInfo.email}
              onChange={(e) =>{}
              }
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={contactInfo.phone}
              onChange={(e) =>{}
              }
            />
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Special Requests</h2>
        <Textarea
          placeholder="Let the host know if you have any special requirements"
          value={contactInfo.specialRequests}
          onChange={(e) =>
          {}}
          className="min-h-[100px]"
        />
      </div>

      {/* House Rules */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">House Rules</h2>
        <div className="space-y-4">
          {listing.houseRules.map((rule: { rule: string }, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-muted-foreground">{rule.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Good to Know</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Check-in/out Times</p>
              <p className="text-sm text-muted-foreground">Check-in: {checkInTime}</p>
              <p className="text-sm text-muted-foreground">Check-out: {checkOutTime}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Cancellation Policy</p>
              <p className="text-sm text-muted-foreground">{listing.cancellationPolicy?.description || "No cancellation policy"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Enhanced Clean</p>
              <p className="text-sm text-muted-foreground">This host follows strict cleaning standards</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Key className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Self Check-in</p>
              <p className="text-sm text-muted-foreground">Check yourself in with a keypad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Information */}
      {listing.safetyFeatures && listing.safetyFeatures.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Safety & Property</h2>
          <div className="space-y-4">
            {listing.safetyFeatures.map((item: { feature: string }, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <p className="text-muted-foreground">{item.feature}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message to Host */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Message to Host</h2>
        <div className="flex items-start space-x-3 p-4 bg-card rounded-lg">
          <MessageCircle className="w-5 h-5 text-gray-600 mt-1" />
          <div>
            <p className="font-medium">Let the host know why you're traveling</p>
            <p className="text-sm text-gray-600 mb-2">
              Share your travel plans and arrival time to help the host prepare for your stay
            </p>
            <Textarea
              placeholder="e.g., Visiting for a weekend getaway with friends..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Update the Book Now button to be a submit button */}
      <Button 
        type="submit"
        className="w-full" 
        size="lg"
        disabled={isSubmitting || !checkInDate || !checkOutDate || totalGuestCount === 0}
      >
        {isSubmitting ? 'Processing...' : 'Book Now'}
      </Button>
    </form>
  );
}