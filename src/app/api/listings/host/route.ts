import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listings = await prisma.listing.findMany({
            where: {
                hostId: session.user.id
            },
            include: {
                location: true,
                images: true,
                host: {
                    include: {
                        hostInfo: true,
                    },
                },
                reviews: true, // Include reviews to calculate rating and count
            },
        });

        // Transform the data to match your component's expectations
        const transformedListings = listings.map(listing => ({
            ...listing,
            rating: listing.reviews.length > 0
                ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
                : 0,
            reviewsCount: listing.reviews.length,
        }));

        return NextResponse.json(transformedListings);
    } catch (error) {
        console.error('Listings fetch error:', error);
        return NextResponse.json(
            { error: "Failed to fetch listings" },
            { status: 500 }
        );
    }
}