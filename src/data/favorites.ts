import { Wishlist, Favorite } from "@prisma/client";

export const mockWishlists: Wishlist[] = [
    {
        id: "wl1",
        name: "Beach Getaways",
        description: "Beautiful beach destinations for future vacations",
        coverImageId: "img3",
        createdAt: new Date("2024-02-10T14:30:00Z"),
        updatedAt: new Date("2024-02-10T14:30:00Z"),
        isPrivate: false,
        isDefault: false,
        shareableLink: "https://example.com/wishlist/wl1",
        userId: "user-1"
    },
    {
        id: "wl2",
        name: "City Escapes",
        description: "Urban adventures around the world",
        coverImageId: "img6", // Using Tokyo apartment image
        createdAt: new Date("2024-03-15T09:45:00Z"),
        updatedAt: new Date("2024-03-15T09:45:00Z"),
        isPrivate: true,
        isDefault: false,
        shareableLink: "https://example.com/wishlist/wl2",
        userId: "user-2"
    },
    {
        id: "wl3",
        name: "Dream Vacations",
        description: "Places I want to visit someday",
        coverImageId: "img1", // Using Ho Chi Minh living room image
        createdAt: new Date("2024-01-05T16:20:00Z"),
        updatedAt: new Date("2024-02-18T11:30:00Z"),
        isPrivate: false,
        isDefault: true,
        shareableLink: "https://example.com/wishlist/wl3",
        userId: "user-3"
    },
    {
        id: "wl4",
        name: "Photography Spots",
        description: "Perfect locations for photography",
        coverImageId: "img3", // Using Bali villa image
        createdAt: new Date("2024-02-28T13:15:00Z"),
        updatedAt: new Date("2024-02-28T13:15:00Z"),
        isPrivate: false,
        isDefault: false,
        shareableLink: "https://example.com/wishlist/wl4",
        userId: "user-4"
    }
];

export const mockFavorites: Favorite[] = [
    {
      id: "fav1",
      createdAt: new Date("2024-02-10T14:30:00Z"),
      userId: "user-1",
      listingId: "listing-2",
    },
    {
      id: "fav2",
      userId: "user-1",
      listingId: "listing-3",
      createdAt: new Date("2024-03-15T09:45:00Z"),
    },
  ];
  