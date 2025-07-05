import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Review, ReviewPhoto } from "@prisma/client";

interface ReviewWithRelations extends Review {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  photos: ReviewPhoto[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        photos: true,
      },
    }) as ReviewWithRelations;

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const formattedReview = {
      id: review.id,
      userId: review.userId,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      userImage: review.user.profileImage,
      rating: review.rating,
      date: review.createdAt.toISOString(),
      comment: review.comment,
      categories: {
        cleanliness: review.cleanliness,
        communication: review.communication,
        checkIn: review.checkIn,
        accuracy: review.accuracy,
        location: review.location,
        value: review.value,
      },
      photos: review.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
      })),
      response: review.response
        ? {
            comment: review.response,
            createdAt: review.responseCreatedAt?.toISOString(),
          }
        : undefined,
    };

    return NextResponse.json(formattedReview);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
} 