export interface Wishlist {
    id: string;
    userId: string;
    name: string;
    description?: string;
    coverImageId?: string;
    listingIds: string[];
    createdAt: string;
    updatedAt: string;
    isPrivate: boolean;
    isDefault: boolean;
    shareableLink?: string;
}

export interface Favorite {
    id: string;
    userId: string;
    listingId: string;
    wishlistIds: string[];
    createdAt: string;
}