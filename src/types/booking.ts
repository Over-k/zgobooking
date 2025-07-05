import { Prisma, Listing, Booking, ListingImage } from "@prisma/client";
export type BookingWithRelations = Prisma.BookingGetPayload<{
    include: {
        listing: {
            include: {
                location: true;
                images: true;
            };
        };
        host: {
            select: {
                id: true;
                firstName: true;
                lastName: true;
                profileImage: true;
            };
        };
        messageThread: {
            select: {
                id: true;
            };
        };
    };
}>;
// Base types
export type GuestCounts = {
    adults: number;
    children: number;
    infants: number;
    pets: number;
};

export type PriceDetails = {
    nightlyRate: number;
    nights: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency?: string;
};

// Listing types
export type BookingListing = Listing & {
    location: Prisma.LocationGetPayload<{}>;
    images: ListingImage[];
    amenities: Prisma.AmenitiesGetPayload<{}>[];
    houseRules: Prisma.HouseRuleGetPayload<{}>[];
    safetyFeatures: Prisma.SafetyFeatureGetPayload<{}>[];
    cancellationPolicy: Prisma.CancellationPolicyGetPayload<{}> | null;
    host: (Prisma.UserGetPayload<{
        include: {
            hostInfo: true;
        };
    }>) | null;
};

// Booking form data
export type BookingFormData = {
    checkInDate: Date;
    checkOutDate: Date;
    guests: GuestCounts;
    priceDetails: PriceDetails;
    contactInfo: {
        email: string;
        phone: string;
        specialRequests?: string;
    };
};

// API request/response types
export type CreateBookingRequest = {
    listingId: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    nightlyRate: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    contactEmail: string;
    contactPhone?: string;
    specialRequests?: string;
};

export type BookingResponse = Booking & {
    listing: Listing & {
        location: Prisma.LocationGetPayload<{}>;
        images: ListingImage[];
    };
};