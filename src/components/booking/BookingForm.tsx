"use client";

import { cn } from "@/lib/utils"
import { useBooking } from "@/context/BookingContext";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarIcon, Users, X, Clock, Shield, Sparkles, Key, MessageCircle, CheckCircle2, ArrowLeft, CreditCard, Banknote, Mail, Phone, MapPin, Star, Wifi, Car, Coffee } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

import * as React from "react"
import { type DateRange } from "react-day-picker"

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
  const [messageToHost, setMessageToHost] = useState("");

  // Payment method state
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("card");
  const [bookedRanges, setBookedRanges] = useState<{ checkInDate: string; checkOutDate: string }[]>([]);

  // Fetch user contact info and payment methods on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch user profile (email, phone)
        const profileRes = await fetch("/api/account/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile?.email) setContactInfo({ email: profile.email });
          if (profile?.phone) setContactInfo({ phone: profile.phone });
        }
        // Fetch payment methods
        const pmRes = await fetch("/api/account/payment-methods");
        if (pmRes.ok) {
          const data = await pmRes.json();
          if (Array.isArray(data)) {
            setPaymentMethods(data);
            if (data.length > 0) {
              setSelectedPaymentMethodId(data[0].id);
              setSelectedPaymentType(data[0].type);
            }
          }
        }
            if (!listing?.id) return;
      fetch(`/api/listings/${listing.id}/bookings`)
      .then(res => res.json())
      .then(data => {
        if (data.bookings) {
          setBookedRanges(data.bookings);
        }
      })
      .catch(err => {
        // Optionally handle error
        setBookedRanges([]);
      });
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
function getDisabledDates(ranges: { checkInDate: string; checkOutDate: string }[]) {
  const disabled: Date[] = [];
  ranges.forEach(({ checkInDate, checkOutDate }) => {
    let current = new Date(checkInDate);
    const end = new Date(checkOutDate);
    while (current <= end) {
      disabled.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });
  return disabled;
}

const disabledDates = getDisabledDates(bookedRanges);
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
          messageToHost: messageToHost,
          paymentMethodId: selectedPaymentType === "p2p" ? null : selectedPaymentMethodId,
          paymentType: selectedPaymentType,
        }),
      });
      
      if(response.status == 409){
        toast.error("Failed to Create booking, Please check different date.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Failed to create booking');
      }

      const booking = await response.json();
      toast.success('Booking created successfully!');
      router.push('../dashboard/bookings')
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="backdrop-blur-sm border"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                Complete Your Booking
              </h1>
              <p className="mt-1 text-muted-foreground">Just a few more details and you're all set</p>
            </div>
          </div>
          
          {/* Property Summary Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl bg-muted text-muted-foreground">
                  {listing.title?.charAt(0) || 'L'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{listing.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{listing.location.address}</span>
                    {listing.rating && (
                      <div className="flex items-center gap-1 ml-4">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">{listing.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Trip Details Section */}
          <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Your Trip
              </h2>
              <p className="text-muted-foreground">Select your dates and number of guests</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dates Section */}  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Travel Dates</Label>
                  <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-12 bg-background/50 border hover:bg-background/80"
                          onClick={() => setIsDatePopoverOpen(true)}
                          type="button"
                        >
                          <CalendarIcon className="w-5 h-5 mr-3" />
                          {checkInDate && checkOutDate ? (
                            <span>
                              {format(checkInDate, "MMM dd")} - {format(checkOutDate, "MMM dd")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Select your dates</span>
                          )}
                        </Button>
                        {(checkInDate || checkOutDate) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetDates();
                            }}
                            type="button"
                            tabIndex={-1}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto border-0 shadow-xl" align="start">
                      <div className="bg-background rounded-lg">
                        <Calendar
                        autoFocus
                          mode="range"
                          numberOfMonths={2}
                          selected={{ from: checkInDate, to: checkOutDate }}
                          onSelect={(range) => {
                            if (range?.from) setCheckInDate(range.from);
                            if (range?.to) setCheckOutDate(range.to);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            // Disable past dates and booked dates
                            return (
                              date < today ||
                              disabledDates.some(
                              (d) =>
                                d.getFullYear() === date.getFullYear() &&
                                d.getMonth() === date.getMonth() &&
                                d.getDate() === date.getDate()
                              )
                            );
                          }}
                        />
                        <div className="p-4 border-t bg-muted flex justify-between">
                          <Button variant="outline" type="button" onClick={resetDates} className="bg-background">
                            Clear dates
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              if (checkInDate && checkOutDate) setIsDatePopoverOpen(false);
                            }}
                            disabled={!checkInDate || !checkOutDate}
                            className="bg-primary hover:bg-primary/80"
                          >
                            Apply dates
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Enhanced Guests Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Guests</Label>
                  <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-12 bg-background/50 border hover:bg-background/80"
                        onClick={() => setIsGuestPopoverOpen(true)}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        {guestSummary() || <span className="text-muted-foreground">Add guests</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-0 shadow-xl" align="start">
                      <div className="bg-background rounded-lg p-6">
                        <h4 className="font-semibold mb-4">How many guests?</h4>
                        {['adults', 'children', 'infants', 'pets'].map((type) => (
                          <div key={type} className="flex justify-between items-center py-4 border-b last:border-b-0">
                            <div>
                              <p className="font-medium capitalize">{type}</p>
                              <p className="text-sm text-muted-foreground">
                                {type === "adults" && "Ages 13+"}
                                {type === "children" && "Ages 2-12"}
                                {type === "infants" && "Under 2"}
                                {type === "pets" && "Service animals allowed"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                disabled={guests[type as keyof typeof guests] <= 0}
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
                              <span className="w-8 text-center font-medium">
                                {guests[type as keyof typeof guests]}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
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
                          type="button" 
                          className="w-full mt-4 bg-primary hover:bg-primary/80" 
                          onClick={() => setIsGuestPopoverOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Check-in/Check-out Times */}
              {checkInDate && checkOutDate && (
                <div className="rounded-xl p-4 bg-muted">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-medium">Check-in</p>
                      </div>
                      <p className="text-lg font-semibold">{checkInTime}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-medium">Check-out</p>
                      </div>
                      <p className="text-lg font-semibold">{checkOutTime}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Contact Information */}
          <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Contact Information
              </h2>
              <p className="text-muted-foreground">How can the host reach you?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ email: e.target.value })}
                      required
                      className="pl-11 h-12 bg-background/50 border focus:bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ phone: e.target.value })}
                      required
                      className="pl-11 h-12 bg-background/50 border focus:bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Payment Method Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Payment Method</Label>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        id={`payment-${method.id}`}
                        checked={selectedPaymentMethodId === method.id && selectedPaymentType !== "p2p"}
                        onChange={() => {
                          setSelectedPaymentMethodId(method.id);
                          setSelectedPaymentType(method.type);
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`payment-${method.id}`}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPaymentMethodId === method.id && selectedPaymentType !== "p2p"
                            ? 'border-primary bg-muted'
                            : 'border bg-background/50 hover:border-muted'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">
                          {method.name}{method.lastFour ? ` •••• ${method.lastFour}` : ""}
                        </span>
                        {selectedPaymentMethodId === method.id && selectedPaymentType !== "p2p" && (
                          <CheckCircle2 className="w-5 h-5 ml-auto" />
                        )}
                      </label>
                    </div>
                  ))}
                  
                  <div className="relative">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="p2p"
                      id="payment-p2p"
                      checked={selectedPaymentType === "p2p"}
                      onChange={() => {
                        setSelectedPaymentMethodId(null);
                        setSelectedPaymentType("p2p");
                      }}
                      className="sr-only"
                    />
                    <label
                      htmlFor="payment-p2p"
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPaymentType === "p2p"
                          ? 'border-success bg-muted'
                          : 'border bg-background/50 hover:border-muted'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <div>
                        <span className="font-medium">Pay on arrival (P2P)</span>
                        <p className="text-sm text-muted-foreground">Pay the host directly when you arrive</p>
                      </div>
                      {selectedPaymentType === "p2p" && (
                        <CheckCircle2 className="w-5 h-5 ml-auto" />
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Special Requests */}
          <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Special Requests
              </h2>
              <p className="text-muted-foreground">Let the host know about any special requirements</p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Early check-in, accessible room, dietary restrictions..."
                value={contactInfo.specialRequests}
                onChange={(e) => setContactInfo({ specialRequests: e.target.value })}
                className="min-h-[120px] bg-background/50 border focus:bg-background resize-none"
              />
            </CardContent>
          </Card>

          {/* House Rules */}
          {listing.houseRules && listing.houseRules.length > 0 && (
            <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  House Rules
                </h2>
                <p className="text-muted-foreground">Please review and acknowledge these rules</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listing.houseRules.map((rule: { rule: string }, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <p className="text-muted-foreground">{rule.rule}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold">Good to Know</h2>
              <p className="text-muted-foreground">Important details about your stay</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-6 h-6 mt-1" />
                  <div>
                    <p className="font-semibold">Check-in/out Times</p>
                    <p className="text-sm text-muted-foreground mt-1">Check-in: {checkInTime}</p>
                    <p className="text-sm text-muted-foreground">Check-out: {checkOutTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-6 h-6 mt-1" />
                  <div>
                    <p className="font-semibold">Cancellation Policy</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.cancellationPolicy?.description || "Flexible cancellation"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Sparkles className="w-6 h-6 mt-1" />
                  <div>
                    <p className="font-semibold">Enhanced Clean</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This host follows strict cleaning standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Key className="w-6 h-6 mt-1" />
                  <div>
                    <p className="font-semibold">Self Check-in</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check yourself in with a keypad
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Information */}
          {listing.safetyFeatures && listing.safetyFeatures.length > 0 && (
            <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Safety & Property
                </h2>
                <p className="text-muted-foreground">Safety features and property information</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.safetyFeatures.map((item: { feature: string }, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item.feature}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message to Host */}
          <Card className="border-0 shadow-lg bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Message to Host
              </h2>
              <p className="text-muted-foreground">Share your travel plans to help the host prepare</p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Visiting for a weekend getaway with friends. We'll arrive around 4 PM and are looking forward to exploring the area..."
                value={messageToHost}
                onChange={(e) => setMessageToHost(e.target.value)}
                className="min-h-[120px] bg-background/70 border focus:bg-background resize-none"
              />
            </CardContent>
          </Card>

          {/* Enhanced Submit Button */}
          <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border p-6 -mx-6 -mb-6 rounded-t-xl">
            <div className="max-w-4xl mx-auto">
              <Button 
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/80 shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isSubmitting || !checkInDate || !checkOutDate || totalGuestCount === 0}
              >
                <div className="flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing your booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Complete Booking</span>
                    </>
                  )}
                </div>
              </Button>
              
              {/* Booking Status Indicators */}
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {checkInDate && checkOutDate ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border" />
                  )}
                  <span>Dates selected</span>
                </div>
                <div className="flex items-center gap-2">
                  {totalGuestCount > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border" />
                  )}
                  <span>Guests added</span>
                </div>
                <div className="flex items-center gap-2">
                  {contactInfo.email && contactInfo.phone ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border" />
                  )}
                  <span>Contact info</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  }