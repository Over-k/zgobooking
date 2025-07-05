import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const id = searchParams.get('id') ? parseInt(searchParams.get('id')!) : undefined;
    const title = searchParams.get('title') || undefined;
    const location = searchParams.get('location') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const category = searchParams.get('category') || undefined;
    const beds = searchParams.get('beds') ? parseInt(searchParams.get('beds')!) : undefined;
    const bathrooms = searchParams.get('bathrooms') ? parseFloat(searchParams.get('bathrooms')!) : undefined;
    const wifi = searchParams.get('wifi') === 'true' ? true : false;
    const kitchen = searchParams.get('kitchen') === 'true' ? true : false;
    const privateBathroom = searchParams.get('privateBathroom') === 'true' ? true : false;
    const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined;

    // Build dynamic search conditions
    const searchConditions: any = {};

    // Location prioritization (if provided)
    if (location) {
      searchConditions.location = {
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { country: { contains: location, mode: 'insensitive' } },
          { address: { contains: location, mode: 'insensitive' } }
        ]
      };
    }

    // Guest filtering
    if (guests !== undefined) {
      searchConditions.OR = [
        { maxAdults: { gte: guests } },
        { maxChildren: { gte: guests } },
        { maxInfants: { gte: guests } },
        { maxPets: { gte: guests } },
        { amenities: { essential: { has: 'Wifi' } } },
        { amenities: { essential: { has: 'Kitchen' } } },
        { amenities: { essential: { has: 'Private Bathroom' } } },
      ];
    }

    // Additional optional filters
    if (minPrice !== undefined) {
      searchConditions.price = { ...searchConditions.price, gte: minPrice };
    }

    if (maxPrice !== undefined) {
      searchConditions.price = { ...searchConditions.price, lte: maxPrice };
    }

    if (category) {
      searchConditions.propertyType = category;
    }

    if (beds !== undefined) {
      searchConditions.beds = { gte: beds };
    }

    if (bathrooms !== undefined) {
      searchConditions.bathrooms = { gte: bathrooms };
    }
    if (wifi && !searchConditions.amenities) {
      searchConditions.amenities = { essential: { has: 'Wifi' } };
    }

    if (kitchen && !searchConditions.amenities) {
      searchConditions.amenities = { ...searchConditions.amenities, essential: { has: 'Kitchen' } };
    }
    if (privateBathroom && !searchConditions.amenities) {
      searchConditions.amenities = { ...searchConditions.amenities, essential: { has: 'Private Bathroom' } };
    }

    const listings = await prisma.listing.findMany({
      where: {
        ...(id && { id: id.toString() }),
        ...(title && { title: { contains: title, mode: 'insensitive' } }),
        ...searchConditions,
        ...(beds !== undefined && { beds: { gte: beds } }),
        ...(bathrooms !== undefined && { bathrooms: { gte: bathrooms } }),
        ...(wifi && { amenities: { essential: { has: 'Wifi' } } }),
        ...(kitchen && { amenities: { essential: { has: 'Kitchen' } } }),
        ...(privateBathroom && { amenities: { essential: { has: 'Private Bathroom' } } }),
        status: 'Active', // Only return active listings
      },
      include: {
        location: true,
        images: true,
        host: {
          include: {
            hostInfo: true,
          }
        },
      },
    });

    return Response.json(listings);
  } catch (error) {
    console.error('Listings search error:', error);
    return Response.json(
      { error: "Failed to search listings", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}