import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        bio: true,
        city: true,
        country: true,
        joinDate: true,
        dateOfBirth: true,
        isHost: true,
        isAdmin: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        governmentIdVerified: true,
        identityVerified: true,
        messagesReceived: {
          where: {
            isRead: false,
          }
        },
        notifications: {
          where: {
            isRead: false,
          }
        },
      },
    });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update user profile with FormData handling
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Since we're using FormData, we need to handle it differently
    const formData = await request.formData();
    
    // Extract the form values
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const dateOfBirth = new Date(formData.get('dateOfBirth') as string);
    const bio = formData.get('bio') as string || undefined;
    
    // Get profileImage which could be a File object or a string URL
    const profileImage = formData.get('profileImage');
    
    console.log("Form data received:", {
      firstName,
      lastName,
      email,
      phone,
      city,
      country,
      dateOfBirth,
      profileImage: typeof profileImage === 'string' ? 'String URL' : 'File object'
    });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !city || !country) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Handle profile image upload
    let profileImageUrl = typeof profileImage === 'string' ? profileImage : undefined;
    
    // Only upload if it's a File object
    if (profileImage && typeof profileImage !== 'string') {
      try {        
        // Convert the file to a format Cloudinary can accept
        const fileBuffer = await (profileImage as File).arrayBuffer();
        const fileBase64 = Buffer.from(fileBuffer).toString('base64');
        const fileDataUri = `data:${(profileImage as File).type};base64,${fileBase64}`;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
          folder: "users/profiles",
          resource_type: "image",
          allowed_formats: ["jpg", "png", "jpeg", "svg", "ico", "webp"],
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" }
          ]
        });
        
        profileImageUrl = uploadResult.secure_url;
        console.log("Image uploaded successfully:", profileImageUrl);
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        // Continue with the update even if image upload fails
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName,
        lastName,
        email,
        phone,
        profileImage: profileImageUrl,
        bio,
        dateOfBirth,
        city,
        country,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof Error) {
      return new NextResponse(`Error updating profile: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Failed to update profile", { status: 500 });
  }
}