// src/app/api/listings/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
const prisma = new PrismaClient();
type ListingResponse = Prisma.ListingGetPayload<{
  include: {
    host: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        profileImage: true;
        joinDate: true;
        hostInfo: true;
      };
    };
    location: true;
    images: true;
    amenities: true;
    reviews: {
      include: {
        user: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            profileImage: true;
          };
        };
      };
    };
    cancellationPolicy: true;
    houseRules: true;
    safetyFeatures: true;
  };
}> & {
  averageRating: number;
};
type image = {
  url: string;
  isPrimary: boolean;
  caption: string;
};
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id: id },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            joinDate: true,
            hostInfo: true
          }
        },
        location: true,
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        amenities: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
              }
            }
          },
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' }
        },
        cancellationPolicy: true,
        houseRules: true,
        safetyFeatures: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = listing.reviews.length > 0
      ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
      : 0;

    // Create the response object
    const response: ListingResponse = {
      ...listing,
      averageRating: parseFloat(averageRating.toFixed(2))
      // No need to transform reviews as we already selected only the fields we want
    };

    const headers = {
      'Cache-Control': 'public, max-age=3600',
      'CDN-Cache-Control': 'public, max-age=86400'
    };

    // Wrap the response in the expected structure
    return NextResponse.json({
      data: response,
      success: true
    }, { headers });
  } catch (error) {
    console.error("Error fetching listing:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.price) {
      return NextResponse.json(
        { error: "Title, description, and price are required" },
        { status: 400 }
      );
    }

    // Check if the listing exists and belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id: id, hostId: session.user.id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or you do not have permission to update it" },
        { status: 404 }
      );
    }

    // Process and validate the basic listing data
    const updateData = {
      title: body.title?.trim(),
      description: body.description?.trim(),
      category: body.category,
      price: parseFloat(body.price) || 0,
      beds: parseInt(body.beds) || 1,
      bathrooms: parseFloat(body.bathrooms) || 1,
      maxAdults: parseInt(body.maxAdults) || 1,
      maxChildren: parseInt(body.maxChildren) || 0,
      maxInfants: parseInt(body.maxInfants) || 0,
      maxPets: parseInt(body.maxPets) || 0,
      minimumStay: parseInt(body.minimumStay) || 1,
      maximumStay: parseInt(body.maximumStay) || 365,
      // Add other direct fields that exist in your schema
      ...(body.propertyType && { propertyType: body.propertyType }),
      ...(body.currency && { currency: body.currency }),
      ...(body.instantBooking !== undefined && { instantBooking: Boolean(body.instantBooking) }),
      ...(body.status && { status: body.status }),
    };

    // Additional validation
    if (updateData.price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    if (updateData.minimumStay > updateData.maximumStay) {
      return NextResponse.json(
        { error: "Minimum stay cannot be greater than maximum stay" },
        { status: 400 }
      );
    }

    if (updateData.maxAdults < 1) {
      return NextResponse.json(
        { error: "At least 1 adult must be allowed" },
        { status: 400 }
      );
    }

    // Remove any undefined values to avoid Prisma issues
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Update the listing with transactions to handle relations
    const updatedListing = await prisma.$transaction(async (prisma) => {
      // Update basic listing data
      const listing = await prisma.listing.update({
        where: { id: id },
        data: cleanedData,
      });

      // Handle location update if coordinates are provided
      if (body.latitude !== undefined && body.longitude !== undefined) {
        const latitude = parseFloat(body.latitude) || 0;
        const longitude = parseFloat(body.longitude) || 0;

        await prisma.location.upsert({
          where: { listingId: id },
          update: {
            latitude: latitude,
            longitude: longitude,
            ...(body.city && { city: body.city.trim() }),
            ...(body.country && { country: body.country.trim() }),
            ...(body.neighborhood && { neighborhood: body.neighborhood.trim() }),
            ...(body.address && { address: body.address.trim() }),
          },
          create: {
            listingId: id,
            latitude: latitude,
            longitude: longitude,
            city: body.city?.trim() || "Unknown City",
            country: body.country?.trim() || "Unknown Country",
            address: body.address?.trim() || "Unknown Address",
            ...(body.neighborhood && { neighborhood: body.neighborhood.trim() }),
          },
        });
      }

      // Handle images update
      if (Array.isArray(body.images)) {
        // Delete existing images that are not in the new array
        const existingImages = await prisma.listingImage.findMany({
          where: { listingId: id },
        });

        const newImageIds = body.images.map((img: any) => img.id).filter(Boolean);
        const imagesToDelete = existingImages.filter((img: any) => !newImageIds.includes(img.id));

        if (imagesToDelete.length > 0) {
          await prisma.listingImage.deleteMany({
            where: {
              id: { in: imagesToDelete.map((img: any) => img.id) },
            },
          });
        }

        // Update or create images
        for (const imageData of body.images) {
          if (imageData.id) {
            // Update existing image
            await prisma.listingImage.update({
              where: { id: imageData.id },
              data: {
                url: imageData.url,
                caption: imageData.caption || null,
                isPrimary: Boolean(imageData.isPrimary),
              },
            });
          } else {
            // Create new image
            await prisma.listingImage.create({
              data: {
                url: imageData.url,
                caption: imageData.caption || null,
                isPrimary: Boolean(imageData.isPrimary),
                listingId: id,
              },
            });
          }
        }
      }

      // Handle amenities update (based on your schema structure)
      if (body.amenities && typeof body.amenities === 'object') {
        await prisma.amenities.upsert({
          where: { listingId: id },
          update: {
            essential: Array.isArray(body.amenities.essential) ? body.amenities.essential : [],
            safety: Array.isArray(body.amenities.safety) ? body.amenities.safety : [],
            outdoor: Array.isArray(body.amenities.outdoor) ? body.amenities.outdoor : [],
            features: Array.isArray(body.amenities.features) ? body.amenities.features : [],
            accessibility: Array.isArray(body.amenities.accessibility) ? body.amenities.accessibility : [],
            others: Array.isArray(body.amenities.others) ? body.amenities.others : [],
          },
          create: {
            listingId: id,
            essential: Array.isArray(body.amenities.essential) ? body.amenities.essential : [],
            safety: Array.isArray(body.amenities.safety) ? body.amenities.safety : [],
            outdoor: Array.isArray(body.amenities.outdoor) ? body.amenities.outdoor : [],
            features: Array.isArray(body.amenities.features) ? body.amenities.features : [],
            accessibility: Array.isArray(body.amenities.accessibility) ? body.amenities.accessibility : [],
            others: Array.isArray(body.amenities.others) ? body.amenities.others : [],
          },
        });
      }

      // Handle house rules update
      if (Array.isArray(body.houseRules)) {
        // Delete existing house rules
        await prisma.houseRule.deleteMany({
          where: { listingId: id },
        });

        // Create new house rules
        if (body.houseRules.length > 0) {
          await prisma.houseRule.createMany({
            data: body.houseRules.map((ruleData: any) => ({
              rule: typeof ruleData === 'string' ? ruleData : ruleData.rule,
              listingId: id,
            })),
          });
        }
      }

      // Handle safety features update
      if (Array.isArray(body.safetyFeatures)) {
        // Delete existing safety features
        await prisma.safetyFeature.deleteMany({
          where: { listingId: id },
        });

        // Create new safety features
        if (body.safetyFeatures.length > 0) {
          await prisma.safetyFeature.createMany({
            data: body.safetyFeatures.map((featureData: any) => ({
              feature: typeof featureData === 'string' ? featureData : featureData.feature,
              listingId: id,
            })),
          });
        }
      }

      // Handle cancellation policy update
      if (body.cancellationPolicy) {
        await prisma.cancellationPolicy.upsert({
          where: { listingId: id },
          update: {
            type: body.cancellationPolicy.type,
            description: body.cancellationPolicy.description,
            ...(body.cancellationPolicy.refundableUntil && {
              refundableUntil: new Date(body.cancellationPolicy.refundableUntil),
            }),
          },
          create: {
            listingId: id,
            type: body.cancellationPolicy.type,
            description: body.cancellationPolicy.description,
            refundableUntil: body.cancellationPolicy.refundableUntil
              ? new Date(body.cancellationPolicy.refundableUntil)
              : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
          },
        });
      }

      // Handle available dates update
      if (Array.isArray(body.availableDates)) {
        // Delete existing available dates
        await prisma.availableDate.deleteMany({
          where: { listingId: id },
        });

        // Create new available dates
        if (body.availableDates.length > 0) {
          const validDates = body.availableDates
            .map((date: string) => new Date(date))
            .filter((date: Date) => !isNaN(date.getTime()));

          if (validDates.length > 0) {
            await prisma.availableDate.createMany({
              data: validDates.map((date: Date) => ({
                date: date,
                listingId: id,
              })),
              skipDuplicates: true, // Handle unique constraint
            });
          }
        }
      }

      return listing;
    });

    return NextResponse.json(
      {
        message: "Listing updated successfully",
        listing: updatedListing
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating listing:', error);

    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Check if the listing exists and belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id: id, hostId: session.user.id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the listing
    await prisma.listing.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Listing deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}