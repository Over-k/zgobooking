"use client";
import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import { BookingListing, GuestCounts, PriceDetails } from "@/types/booking";

interface BookingContextType {
  listing: BookingListing | null;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  guests: GuestCounts;
  priceDetails: PriceDetails;
  contactInfo: {
    email: string;
    phone: string;
    specialRequests: string;
  };
  setListing: (listing: BookingListing) => void;
  setCheckInDate: (date: Date | undefined) => void;
  setCheckOutDate: (date: Date | undefined) => void;
  setGuests: (guests: GuestCounts | ((prev: GuestCounts) => GuestCounts)) => void;
  setContactInfo: (info: Partial<{
    email: string;
    phone: string;
    specialRequests: string;
  }>) => void;
  isBookingValid: boolean;
  totalNights: number;
  calculatePriceDetails: () => PriceDetails;
  resetBooking: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const defaultGuests: GuestCounts = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
};

const defaultPriceDetails: PriceDetails = {
  nightlyRate: 0,
  nights: 0,
  cleaningFee: 0,
  serviceFee: 0,
  taxes: 0,
  total: 0,
  currency: "USD",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [listing, setListing] = useState<BookingListing | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);
  const [priceDetails, setPriceDetails] = useState<PriceDetails>(defaultPriceDetails);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  const totalGuests = useMemo(() => guests.adults + guests.children, [guests]);
  const hasPets = useMemo(() => guests.pets > 0, [guests.pets]);

  const calculatePriceDetails = useCallback((): PriceDetails => {
    if (!listing || !checkInDate || !checkOutDate) {
      return defaultPriceDetails;
    }

    const nights = totalNights;
    const nightlyRate = listing.price;
    
    // Base calculation
    const baseTotal = nightlyRate * nights;
    
    // Additional fees
    const extraGuestFee = Math.max(0, totalGuests - 2) * 25 * nights;
    const petFee = hasPets ? 50 : 0;
    const cleaningFee = 50 + (Math.floor(totalGuests / 2) * 20);
    const serviceFee = Math.round((baseTotal + extraGuestFee) * 0.12);
    const taxes = Math.round((baseTotal + extraGuestFee + cleaningFee + serviceFee + petFee) * 0.1);

    return {
      nightlyRate,
      nights,
      cleaningFee,
      serviceFee,
      taxes,
      total: baseTotal + extraGuestFee + cleaningFee + serviceFee + taxes + petFee,
      currency: listing.currency || "USD",
    };
  }, [listing, checkInDate, checkOutDate, totalNights, totalGuests, hasPets]);

  useEffect(() => {
    setPriceDetails(calculatePriceDetails());
  }, [calculatePriceDetails]);

  const isBookingValid = useMemo(() => {
    return !!(
      listing &&
      checkInDate &&
      checkOutDate &&
      guests.adults > 0 &&
      checkInDate < checkOutDate
    );
  }, [listing, checkInDate, checkOutDate, guests.adults]);

  const resetBooking = useCallback(() => {
    setListing(null);
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setGuests(defaultGuests);
    setPriceDetails(defaultPriceDetails);
    setContactInfo({
      email: "",
      phone: "",
      specialRequests: "",
    });
  }, []);

  const updateContactInfo = useCallback((info: Partial<{
    email: string;
    phone: string;
    specialRequests: string;
  }>) => {
    setContactInfo(prev => ({ ...prev, ...info }));
  }, []);

  const handleBookingSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        listing,
        checkInDate,
        checkOutDate,
        guests,
        priceDetails,
        contactInfo,
        setListing,
        setCheckInDate,
        setCheckOutDate,
        setGuests,
        setContactInfo: updateContactInfo,
        isBookingValid,
        totalNights,
        calculatePriceDetails,
        resetBooking,
        isSubmitting,
        setIsSubmitting,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};