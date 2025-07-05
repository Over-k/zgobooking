import { useState } from "react";

interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<UploadImageResult> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        success: false,
        error: "Failed to upload image",
      };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
}
