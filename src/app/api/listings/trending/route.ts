import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/listings/trending - Get trending listings
export async function GET() {
    try {
        // Get trending listings based on booking count and rating
        const trendingListings = await prisma.listing.findMany({
            where: {
                status: "Active",
                // Only include listings with at least one booking and good rating
                bookings: {
                    some: {}
                },
                rating: {
                    gte: 4.0
                }
            },
            include: {
                location: true,
                images: {
                    where: {
                        isPrimary: true
                    },
                    take: 1
                },
                host: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                },
                _count: {
                    select: {
                        bookings: true,
                        reviews: true
                    }
                }
            },
            orderBy: [
                {
                    bookings: {
                        _count: "desc"
                    }
                },
                {
                    rating: "desc"
                },
                {
                    reviewsCount: "desc"
                }
            ],
            take: 8 // Limit to 8 trending listings
        });

        // If we don't have enough trending listings, get some popular ones
        if (trendingListings.length < 4) {
            const popularListings = await prisma.listing.findMany({
                where: {
                    status: "Active",
                    id: {
                        notIn: trendingListings.map(l => l.id)
                    }
                },
                include: {
                    location: true,
                    images: {
                        where: {
                            isPrimary: true
                        },
                        take: 1
                    },
                    host: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profileImage: true
                        }
                    },
                    _count: {
                        select: {
                            bookings: true,
                            reviews: true
                        }
                    }
                },
                orderBy: [
                    {
                        rating: "desc"
                    },
                    {
                        reviewsCount: "desc"
                    }
                ],
                take: 8 - trendingListings.length
            });

            trendingListings.push(...popularListings);
        }

        return NextResponse.json(trendingListings);
    } catch (error) {
        console.error('Error fetching trending listings:', error);
        return NextResponse.json(
            { error: "Failed to fetch trending listings" },
            { status: 500 }
        );
    }
} 