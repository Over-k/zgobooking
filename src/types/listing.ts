import { User } from "./user";

export interface ListingImage {
    id: string;
    url: string;
    caption: string | null;
    isPrimary: boolean;
    listingId: string;
}

export interface ListingLocation {
    id: string;
    city: string;
    country: string;
    neighborhood?: string;
    latitude: number;
    longitude: number;
    address: string;
    listingId: string;
}

export interface ListingAmenities {
    id: string;
    essential: string[];
    safety: string[];
    outdoor: string[];
    features: string[];
    accessibility: string[];
    others: string[];
    listingId: string;
}

export interface ReviewCategories {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
    response?: string;
    responseCreatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    isPublic: boolean;
    reviewType: string; // guest_to_host, host_to_guest, guest_to_listing
    helpfulVotes: number;
    reportCount: number;
    isVerifiedStay: boolean;
    userId: string; // reviewer
    receiverId: string; // for host reviews
    listingId: string;
    bookingId: string;
    photos?: ReviewPhoto[];
}
export interface Favorite  {
    id: string;
    createdAt: Date;
    listingId: string;
    userId: string;
}

export interface ReviewPhoto {
    id: string;
    url: string;
    reviewId: string;
}

export interface CancellationPolicy {
    id: string;
    type: string;
    description: string;
    refundableUntil: Date;
    listingId: string;
}

export interface HouseRule {
    id: string;
    rule: string;
    listingId: string;
}

export interface SafetyFeature {
    id: string;
    feature: string;
    listingId: string;
}

export interface AvailableDate {
    id: string;
    date: Date;
    listingId: string;
}

export interface Listing {
    id: string;
    title: string;
    propertyType: string;
    description: string;
    price: number;
    currency: string;
    beds: number;
    bathrooms: number;
    category: string;
    rating: number;
    reviewsCount: number;
    instantBooking: boolean;
    minimumStay: number;
    maximumStay: number;
    hostId: string;
    maxAdults: number;
    maxChildren: number;
    maxInfants: number;
    maxPets: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Relations (optional for when populated)
    host?: User;
    location?: ListingLocation;
    images: ListingImage[];
    amenities?: ListingAmenities;
    houseRules?: HouseRule[];
    safetyFeatures?: SafetyFeature[];
    reviews?: Review[];
    availableDates?: AvailableDate[];
    cancellationPolicy?: CancellationPolicy;
    favorites: Favorite[];
    
    // Computed/display fields
    dates?: string; // for display purposes
    nights?: number; // for display purposes
}

export interface TrendingListing {
  id: string;
  title: string;
  propertyType: string;
  description: string;
  price: number;
  currency: string;
  beds: number;
  bathrooms: number;
  category: string;
  rating: number;
  reviewsCount: number;
  instantBooking: boolean;
  minimumStay: number;
  maximumStay: number;
  hostId: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  maxPets: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  location: {
    id: string;
    city: string;
    country: string;
    neighborhood?: string;
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  images: {
    id: string;
    url: string;
    caption?: string;
    isPrimary: boolean;
  }[];
  host: {
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  _count: {
    bookings: number;
    reviews: number;
  };
}