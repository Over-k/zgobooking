import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Create a single Prisma instance to reuse across requests
const prisma = new PrismaClient();

// Validation schema for POST request
const toggleFavoriteSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required")
});

// POST /api/favorites - Toggle favorite status
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = toggleFavoriteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { listingId } = validationResult.data;

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if the listing exists
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true } // Only select what we need
      });

      if (!listing) {
        throw new Error("LISTING_NOT_FOUND");
      }

      // Check if favorite already exists
      const existingFavorite = await tx.favorite.findUnique({
        where: {
          userId_listingId: {
            userId: session.user.id,
            listingId: listingId
          }
        }
      });

      if (existingFavorite) {
        // Remove favorite
        await tx.favorite.delete({
          where: {
            id: existingFavorite.id
          }
        });

        return {
          success: true,
          action: "removed",
          message: "Removed from favorites"
        };
      } else {
        // Add favorite
        const favorite = await tx.favorite.create({
          data: {
            userId: session.user.id,
            listingId: listingId
          }
        });

        return {
          success: true,
          action: "added",
          message: "Added to favorites",
          data: {
            id: favorite.id,
            createdAt: favorite.createdAt
          }
        };
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error handling favorite:", error);

    // Handle specific error types
    if (error instanceof Error && error.message === "LISTING_NOT_FOUND") {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}

// GET /api/favorites - Get user's favorites with optional pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 items per page
    const skip = (page - 1) * limit;

    // Get total count and favorites in parallel
    const [totalCount, favorites] = await Promise.all([
      prisma.favorite.count({
        where: {
          userId: session.user.id
        }
      }),
      prisma.favorite.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          listing: {
            include: {
              images: {
                take: 1, // Only get the first image for performance
              },
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true
                }
              },
              location: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: favorites,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// Optional: Add a DELETE endpoint to remove specific favorites
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json(
        { error: "Favorite ID is required" },
        { status: 400 }
      );
    }

    // Verify the favorite belongs to the current user before deleting
    const favorite = await prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId: session.user.id
      }
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: {
        id: favoriteId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Favorite removed successfully"
    });

  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
}

// Cleanup function for graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});