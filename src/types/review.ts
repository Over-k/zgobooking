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
    bookingId: string;
    listingId: string;
    userId: string; // reviewer
    hostId: string; // for guest reviews
    guestId?: string; // for host reviews
    rating: number;
    comment: string;
    response?: {
        comment: string;
        createdAt: string;
    };
    categories: ReviewCategories;
    photos?: {
        id: string;
        url: string;
    }[];
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    reviewType: "guest_to_host" | "host_to_guest" | "guest_to_listing";
    helpfulVotes: number;
    reportCount: number;
    isVerifiedStay: boolean;
}