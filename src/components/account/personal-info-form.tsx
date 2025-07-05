"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { NextResponse } from "next/server";

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(1),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  // Fix: Remove the min date validation that was causing form submission issues
  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
  }),
  profileImage: z.any(), // Allow any type for file upload
});

export function PersonalInfoForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState<z.infer<typeof profileFormSchema> | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profileImage: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      dateOfBirth: new Date(),
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/account/profile");
        if (!response.ok) {
          throw new Error('Failed to upload profile image. Please check your Cloudinary configuration and try again.');
        }
        const userData = await response.json();
        setUserData(userData);

        // Set form values with user data
        form.setValue("firstName", userData.firstName || "");
        form.setValue("lastName", userData.lastName || "");
        form.setValue("email", userData.email || "");
        form.setValue("phone", userData.phone || "");
        form.setValue("city", userData.city || "");
        form.setValue("country", userData.country || "");
        // Fix: Properly handle date format from API
        if (userData.dateOfBirth) {
          form.setValue("dateOfBirth", new Date(userData.dateOfBirth));
        }
        form.setValue("profileImage", userData.profileImage || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    try {
      // If profileImage is a File object, we'll let the backend handle the upload
      if (data.profileImage instanceof File) {
        console.log('Uploading file object to backend');
      }

      // Create FormData for the request
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'dateOfBirth') {
          formData.append(key, value instanceof Date ? value.toISOString() : value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Update user profile
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">Personal Information</h3>
          <p className="text-sm text-slate-500">
            Update your personal details and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
            Edit Profile
          </Button>
        )}
      </div>

      <Separator />

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      ) : isEditing ? (
        <Form form={form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage
                  src={previewImage || (typeof userData?.profileImage === 'string' ? userData.profileImage : '')}
                  alt="Profile"
                />
                <AvatarFallback className="text-lg">
                  {form.getValues("firstName")?.[0]}
                  {form.getValues("lastName")?.[0]}
                </AvatarFallback>
              </Avatar>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => document.getElementById("profileImage")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Photo
              </Button>

              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    
                    // Create a blob URL for preview
                    const blobUrl = URL.createObjectURL(file);
                    setPreviewImage(blobUrl);
                    
                    // Set the file directly
                    form.setValue("profileImage", file);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          if (date) {
                            field.onChange(new Date(date));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h4 className="mb-4 text-lg sm:text-xl font-medium">Address</h4>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 pb-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={previewImage || (typeof userData?.profileImage === 'string' ? userData.profileImage : '')} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {userData?.firstName?.[0]}
                  {userData?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xl font-medium">
                  {userData?.firstName} {userData?.lastName}
                </h4>
                <p className="text-sm text-slate-500">{userData?.email}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Phone</p>
                <p>{userData?.phone || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Date of Birth
                </p>
                <p>{userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-500">Address</p>
                <p>
                  {userData?.city ? `${userData.city}, ${userData.country}` : 'Not provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}