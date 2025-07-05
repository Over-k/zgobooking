import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const listings = await prisma.listing.findMany({
      take: 20,
      include: {
        location: true,
        images: true,
        host: {
          include: {
            hostInfo: true,
          },
        },
        favorites: true,
      },
    });
    return NextResponse.json(listings);
  } catch (error) {
    console.error('Listings fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Destructure with correct field names matching the frontend
    const {
      title,
      description,
      propertyType,
      category,
      price,
      currency,
      beds,
      bathrooms,
      maxAdults,
      maxChildren,
      maxInfants,
      maxPets,
      minimumStay,
      maximumStay,
      instantBooking,
      city,
      country,
      neighborhood,
      address,
      latitude,
      longitude,
      // New fields
      images,
      amenities,
      houseRules,
      safetyFeatures,
      availableDates,
      cancellationPolicy,
    } = body;

    // Validate required fields
    if (!title || !description || !propertyType || !category || !price || !city || !country || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create listing with all relations in a transaction
    const listing = await prisma.$transaction(async (tx) => {
      // Create the listing first
      const newListing = await tx.listing.create({
        data: {
          title,
          description,
          propertyType,
          category,
          price: parseFloat(price),
          currency: currency || "USD",
          beds: parseInt(beds),
          bathrooms: parseFloat(bathrooms),
          maxAdults: parseInt(maxAdults),
          maxChildren: parseInt(maxChildren),
          maxInfants: parseInt(maxInfants),
          maxPets: parseInt(maxPets),
          minimumStay: parseInt(minimumStay),
          maximumStay: parseInt(maximumStay),
          instantBooking: Boolean(instantBooking),
          hostId: session.user.id,
          status: "Active",
        },
      });

      // Create the location record
      await tx.location.create({
        data: {
          city,
          country,
          neighborhood: neighborhood || null,
          address,
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
          listingId: newListing.id,
        },
      });

      // Create images
      if (images && images.length > 0) {
        await tx.listingImage.createMany({
          data: images.map((image: any) => ({
            url: image.url,
            caption: image.caption,
            isPrimary: image.isPrimary,
            listingId: newListing.id,
          })),
        });
      }

      // Create amenities
      if (amenities) {
        await tx.amenities.create({
          data: {
            essential: amenities.essential || [],
            safety: amenities.safety || [],
            outdoor: amenities.outdoor || [],
            features: amenities.features || [],
            accessibility: amenities.accessibility || [],
            others: amenities.others || [],
            listingId: newListing.id,
          },
        });
      }

      // Create house rules
      if (houseRules && houseRules.length > 0) {
        await tx.houseRule.createMany({
          data: houseRules.map((rule: string) => ({
            rule,
            listingId: newListing.id,
          })),
        });
      }

      // Create safety features
      if (safetyFeatures && safetyFeatures.length > 0) {
        await tx.safetyFeature.createMany({
          data: safetyFeatures.map((feature: string) => ({
            feature,
            listingId: newListing.id,
          })),
        });
      }

      // Create available dates
      if (availableDates && availableDates.length > 0) {
        await tx.availableDate.createMany({
          data: availableDates.map((date: string) => ({
            date: new Date(date),
            listingId: newListing.id,
          })),
        });
      }

      // Create cancellation policy
      if (cancellationPolicy) {
        await tx.cancellationPolicy.create({
          data: {
            type: cancellationPolicy.type,
            description: cancellationPolicy.description,
            refundableUntil: new Date(cancellationPolicy.refundableUntil),
            listingId: newListing.id,
          },
        });
      }

      return newListing;
    });

    // Fetch the complete listing with relations for response
    const completeListingData = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        location: true,
        images: true,
        amenities: true,
        houseRules: true,
        safetyFeatures: true,
        availableDates: true,
        cancellationPolicy: true,
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Listing created successfully",
        listing: completeListingData,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Listing creation error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A listing with this information already exists" },
        { status: 409 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid reference data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create listing. Please try again." },
      { status: 500 }
    );
  }
}