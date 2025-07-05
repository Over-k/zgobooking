import { Prisma } from '@prisma/client';
export type ListingWithRelations = Prisma.ListingGetPayload<{
    include: {
        images: true;
        location: true;
        host: {
            select: {
                id: true;
                firstName: true;
                lastName: true;
                profileImage: true;
                hostInfo: {
                    select: {
                        averageRating: true;
                        totalReviews: true;
                        responseRate: true;
                        responseTime: true;
                        superhost: true;
                    };
                };
            };
        };
        reviews: {
            select: {
                id: true;
                rating: true;
                comment: true;
                createdAt: true;
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
        amenities: true;
        houseRules: true;
        safetyFeatures: true;
        availableDates: true;
        cancellationPolicy: true;
    };
}>;