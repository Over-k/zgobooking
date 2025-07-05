import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Configure Cloudinary with enhanced timeout and retry settings
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 60000, // Increased timeout to 60 seconds
    upload_prefix: 'https://api.cloudinary.com' // Explicit API endpoint
});

// Enhanced image upload function with retries for local files
async function uploadImageToCloudinary(file: File, retries = 3): Promise<string> {
    // Check if Cloudinary credentials are available
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('Cloudinary credentials not found. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
        throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Convert file to base64 or use FormData for upload
            const result = await uploadFileToCloudinary(file);
            return result.secure_url;
        } catch (error) {
            console.error(`Attempt ${attempt} failed to upload file ${file.name}:`, error);
            if (attempt === retries) {
                console.error(`Failed to upload ${file.name} after ${retries} attempts`);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
    }
    throw new Error(`Failed to upload ${file.name} after ${retries} attempts`);
}

// Helper function to upload file to Cloudinary using Node.js Buffer
async function uploadFileToCloudinary(file: File): Promise<any> {
    try {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert buffer to base64
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto", // Automatically detect file type
            folder: "uploads", // Optional: organize uploads in folders
            public_id: `${Date.now()}_${file.name.split('.')[0]}`, // Unique filename
            overwrite: true
        });
        
        return result;
    } catch (error) {
        console.error('Error in uploadFileToCloudinary:', error);
        throw error;
    }
}

// Function to upload multiple files
async function uploadImagesToCloudinary(files: File[]): Promise<Array<{ url: string, originalName: string }>> {
    const uploadPromises = files.map(async (file) => {
        const url = await uploadImageToCloudinary(file);
        return { url, originalName: file.name };
    });

    return Promise.all(uploadPromises);
}
// remove Image from cloudinary
async function removeImageFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error in removeImageFromCloudinary:', error);
        throw error;
    }
}
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = Array.from(formData.values()) as File[];
        
        if (files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            );
        }
        
        // Filter for valid image files
        const validFiles = files.filter(file => 
            file instanceof File && 
            file.type.startsWith('image/') && 
            file.size <= 10 * 1024 * 1024 // 10MB limit
        );
        
        if (validFiles.length === 0) {
            return NextResponse.json(
                { error: "No valid image files found. Please upload images under 10MB each." },
                { status: 400 }
            );
        }
        
        const results = await uploadImagesToCloudinary(validFiles);
        return NextResponse.json(results);
    } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload images. Please try again.";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

// API Route (DELETE handler)
export async function DELETE(request: Request) {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
        );
    }

    try {
        // Handle DELETE request
        const { imageId } = await request.json();
        // First get the image details before deleting
        const imageToDelete = await prisma.listingImage.findUnique({
            where: { id: imageId }
        });
            if (!imageToDelete) {
                return NextResponse.json(
                    { error: "Image not found" },
                    { status: 404 }
                );
            }
        const listingImages = await prisma.listingImage.findMany({
            where: { listingId: imageToDelete?.listingId },
        });
        if (listingImages.length === 1) {
            return NextResponse.json(
                { error: "Cannot delete last image" },
                { status: 400 }
            );
        }
        // Delete from database
        await prisma.listingImage.delete({
            where: {
                id: imageId,
            },
        });

        // Remove image from Cloudinary (handle async but don't block response)
        removeImageFromCloudinary(imageId).catch((error) => {
            console.error(`Failed to remove image from Cloudinary: ${error.message}`);
        });

        // Return success response
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete image error:", error);
        return NextResponse.json(
            { error: "Failed to delete image" },
            { status: 500 }
        );
    }
}

// API Route for updating primary image (PUT handler)
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
        );
    }

    try {
        const {imageId} = await request.json();

        // First, set all images for this listing to not primary
        const image = await prisma.listingImage.findUnique({ where: { id: imageId } });
        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }
        await prisma.listingImage.updateMany({
            where: { listingId: image.listingId },
            data: { isPrimary: false }
        });
        // Then set the selected image as primary
        await prisma.listingImage.update({
            where: { id: imageId },
            data: { isPrimary: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update primary image error:", error);
        return NextResponse.json(
            { error: "Failed to update primary image" },
            { status: 500 }
        );
    }
  }