"use client";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, Wifi, AirVent, Flame, ChefHat, WashingMachine, Tv, Bath, Bed, Shield, Camera, Stethoscope, Waves, Dumbbell, Coffee, Monitor, PawPrint, Clock, Accessibility, DoorOpen, Car, Home, Lock, Baby, Phone, AlertTriangle, Music, Footprints, Utensils, Users, VolumeX, Flame as CandleIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { type ListingFormData } from "@/types/listing-form";
import { Listing } from "@/types/listing";

const propertyTypes = [
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Studio",
  "Townhouse",
  "Loft",
  "Cabin",
  "Cottage",
];

const categories = ["Entire place", "Private room", "Shared room"];

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "MAD", label: "MAD - Moroccan Dirham" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

const STEPS = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Add the basic details about your listing",
  },
  {
    id: "images",
    title: "Images",
    description: "Upload photos of your property",
  },
  {
    id: "amenities",
    title: "Amenities",
    description: "Select the amenities available in your property",
  },
  {
    id: "rules",
    title: "House Rules & Safety",
    description: "Set house rules and safety features",
  },
  {
    id: "availability",
    title: "Availability & Policy",
    description: "Set available dates and cancellation policy",
  },
];

const AMENITY_OPTIONS = {
  essential: [
    "Wifi",
    "Air conditioning",
    "Heating",
    "Kitchen",
    "Washer",
    "Dryer",
    "TV",
    "Essentials (towels, bed sheets, soap, toilet paper)",
    "Hot water",
    "Bed linens",
  ],
  safety: [
    "Smoke alarm",
    "Carbon monoxide alarm",
    "Fire extinguisher",
    "First aid kit",
    "Security cameras",
    "Safe",
  ],
  outdoor: [
    "Pool",
    "Hot tub",
    "BBQ grill",
    "Patio or balcony",
    "Garden",
    "Parking",
    "Beach access",
  ],
  features: [
    "Elevator",
    "Gym",
    "Indoor fireplace",
    "Breakfast",
    "Workspace",
    "Pets allowed",
    "Long term stays allowed",
  ],
  accessibility: [
    "Step-free access",
    "Wide doorway",
    "Wide hallway clearance",
    "Accessible bathroom",
    "Accessible parking",
    "Elevator access",
  ],
};

const HOUSE_RULE_OPTIONS = [
  "No smoking",
  "No parties or events",
  "No pets",
  "No loud music",
  "No shoes inside",
  "No food in bedrooms",
  "No unregistered guests",
  "Quiet hours (10 PM - 7 AM)",
  "No commercial photography",
  "No candles or open flames",
];

const SAFETY_FEATURE_OPTIONS = [
  "Smoke alarm",
  "Carbon monoxide alarm",
  "Fire extinguisher",
  "First aid kit",
  "Security cameras",
  "Safe",
  "Deadbolt lock",
  "Window guards",
  "Baby safety gates",
  "Emergency contact information",
];

const CANCELLATION_POLICY_OPTIONS = [
  {
    type: "Flexible",
    description: "Full refund if canceled at least 24 hours before check-in",
    refundableUntil: 24, // hours before check-in
  },
  {
    type: "Moderate",
    description: "Full refund if canceled at least 5 days before check-in",
    refundableUntil: 120, // hours before check-in
  },
  {
    type: "Strict",
    description: "50% refund if canceled at least 7 days before check-in",
    refundableUntil: 168, // hours before check-in
  },
];

// Icon mappings for amenities
const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  "Wifi": Wifi,
  "Air conditioning": AirVent,
  "Heating": Flame,
  "Kitchen": ChefHat,
  "Washer": WashingMachine,
  "Dryer": WashingMachine,
  "TV": Tv,
  "Essentials (towels, bed sheets, soap, toilet paper)": Bath,
  "Hot water": Bath,
  "Bed linens": Bed,
  "Smoke alarm": Shield,
  "Carbon monoxide alarm": Shield,
  "Fire extinguisher": Shield,
  "First aid kit": Stethoscope,
  "Security cameras": Camera,
  "Safe": Shield,
  "Pool": Waves,
  "Hot tub": Waves,
  "BBQ grill": ChefHat,
  "Patio or balcony": Home,
  "Garden": Home,
  "Parking": Car,
  "Beach access": Waves,
  "Elevator": Accessibility,
  "Gym": Dumbbell,
  "Indoor fireplace": Flame,
  "Breakfast": Coffee,
  "Workspace": Monitor,
  "Pets allowed": PawPrint,
  "Long term stays allowed": Clock,
  "Step-free access": Accessibility,
  "Wide doorway": DoorOpen,
  "Wide hallway clearance": DoorOpen,
  "Accessible bathroom": Bath,
  "Accessible parking": Car,
  "Elevator access": Accessibility,
};

// Icon mappings for house rules
const HOUSE_RULE_ICONS: Record<string, React.ComponentType<any>> = {
  "No smoking": AlertTriangle,
  "No parties or events": Users,
  "No pets": PawPrint,
  "No loud music": Music,
  "No shoes inside": Footprints,
  "No food in bedrooms": Utensils,
  "No unregistered guests": Users,
  "Quiet hours (10 PM - 7 AM)": VolumeX,
  "No commercial photography": Camera,
  "No candles or open flames": CandleIcon,
};

// Icon mappings for safety features
const SAFETY_ICON_ICONS: Record<string, React.ComponentType<any>> = {
  "Smoke alarm": Shield,
  "Carbon monoxide alarm": Shield,
  "Fire extinguisher": Shield,
  "First aid kit": Stethoscope,
  "Security cameras": Camera,
  "Safe": Lock,
  "Deadbolt lock": Lock,
  "Window guards": Shield,
  "Baby safety gates": Baby,
  "Emergency contact information": Phone,
};

const FileUploadComponent = ({
  selectedFiles,
  setSelectedFiles,
}: {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Filter for valid image files
    const validFiles = files.filter((file: File) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        console.warn(`File ${file.name} is not a valid image type`);
      }
      if (!isValidSize) {
        console.warn(`File ${file.name} exceeds 10MB size limit`);
      }

      return isValidType && isValidSize;
    });

    setSelectedFiles(validFiles);
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...imageFiles]);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Button
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          className="mb-2"
        >
          Select Images
        </Button>
        <p className="text-sm text-gray-500">Or drag and drop images here</p>
        <p className="text-xs text-gray-400 mt-1">
          Supports: JPG, PNG, GIF, WebP (Max 10MB each)
        </p>
      </div>
      {/* Selected Files Count */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 mb-2">
          <p className="text-sm font-medium text-gray-700">
            {selectedFiles.length} image{selectedFiles.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>
      )}

      {/* File Previews */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {selectedFiles.map((file, idx) => (
          <div key={`${file.name}-${idx}`} className="relative group">
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${idx}`}
              className="object-cover w-full h-32 rounded-lg shadow-sm"
            />

            {/* File Info Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFile(idx)}
                  className="text-xs"
                >
                  Remove
                </Button>
              </div>
            </div>

            {/* File Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg truncate">
              {file.name}
            </div>

            {/* Primary Image Indicator */}
            {idx === 0 && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: string; url: string; caption?: string; isPrimary: boolean, listingId?: string }>
  >([]);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{id: string; url: string; caption?: string; isPrimary: boolean }>
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const form = useForm<ListingFormData>({
    mode: "onChange",
    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      propertyType: listing?.propertyType ?? "House",
      category: listing?.category ?? "Apartment",
      price: (listing?.price ?? 0).toString(),
      currency: listing?.currency ?? "USD",

      beds: (listing?.beds ?? 1).toString(),
      bathrooms: (listing?.bathrooms ?? 1).toString(),
      maxAdults: (listing?.maxAdults ?? 1).toString(),
      maxChildren: (listing?.maxChildren ?? 0).toString(),
      maxInfants: (listing?.maxInfants ?? 0).toString(),
      maxPets: (listing?.maxPets ?? 0).toString(),
      minimumStay: (listing?.minimumStay ?? 1).toString(),
      maximumStay: (listing?.maximumStay ?? 365).toString(),

      instantBooking: listing?.instantBooking ?? false,

      city: listing?.location?.city ?? "",
      country: listing?.location?.country ?? "",
      neighborhood: listing?.location?.neighborhood ?? "",
      address: listing?.location?.address ?? "",
      latitude: "",
      longitude: "",
      images: [],

      amenities: {
        essential: [],
        safety: [],
        outdoor: [],
        features: [],
        accessibility: [],
        others: [],
      },

      houseRules: [],
      safetyFeatures: [],
      availableDates: [],

      cancellationPolicy: {
        type: listing?.cancellationPolicy?.type ?? "Flexible",
        description:
          listing?.cancellationPolicy?.description ??
          CANCELLATION_POLICY_OPTIONS[0].description,
        refundableUntil:
          listing?.cancellationPolicy?.refundableUntil ?? new Date(),
      },
    },
  });

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listing");
        }
        const { data } = await response.json();
        setListing(data);
        setExistingImages(data.images);
        form.reset({
          title: data.title || "",
          description: data.description || "",
          propertyType: data.propertyType || "",
          category: data.category || "",
          price: data.price?.toString() || "",
          currency: data.currency || "USD",
          beds: data.beds?.toString() || "1",
          bathrooms: data.bathrooms?.toString() || "1",
          maxAdults: data.maxAdults?.toString() || "1",
          maxChildren: data.maxChildren?.toString() || "0",
          maxInfants: data.maxInfants?.toString() || "0",
          maxPets: data.maxPets?.toString() || "0",
          minimumStay: data.minimumStay?.toString() || "1",
          maximumStay: data.maximumStay?.toString() || "365",
          instantBooking: data.instantBooking || false,
          city: data.location?.city || "",
          country: data.location?.country || "",
          neighborhood: data.location?.neighborhood || "",
          address: data.location?.address || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          images: data.images || [],
          amenities: data.amenities || {
            essential: [],
            safety: [],
            outdoor: [],
            features: [],
            accessibility: [],
            others: [],
          },
          houseRules: data.houseRules || [],
          safetyFeatures: data.safetyFeatures || [],
          availableDates:
            data.availableDates?.map((date: string) => new Date(date)) || [],
          cancellationPolicy: data.cancellationPolicy || {
            type: "Flexible",
            description: CANCELLATION_POLICY_OPTIONS[0].description,
            refundableUntil: new Date(),
          },
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing data");
        router.push("/dashboard/listings");
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, router, form]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  const onSubmit: SubmitHandler<ListingFormData> = async (values) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Combine existing images with new uploaded images
      const allImages = [...existingImages];

      // Upload new images if any
      if (selectedFiles.length > 0) {
        const newImages = await uploadImagesToCloudinary(selectedFiles);
        const mappedNewImages = newImages.map((img: { url: string }) => ({
          url: img.url,
          isPrimary: false,
          caption: "",
        }));
        allImages.push(...mappedNewImages);
      }

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          images: allImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update listing");
      }

      toast.success("Listing updated successfully!");
      router.push("/dashboard/listings");
      router.refresh();
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImagesToCloudinary = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file, idx) => {
      formData.append("file" + idx, file);
    });
    const response = await fetch("/api/listings/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload images");
    }

    return await response.json();
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      const values = form.getValues();
      const missingFields = [];

      if (!values.title) missingFields.push("Title");
      if (!values.description) missingFields.push("Description");
      if (!values.propertyType) missingFields.push("Property Type");
      if (!values.category) missingFields.push("Category");
      if (!values.price) missingFields.push("Price");
      if (!values.city) missingFields.push("City");
      if (!values.country) missingFields.push("Country");
      if (!values.address) missingFields.push("Address");

      if (missingFields.length > 0) {
        toast.error(
          `Please fill in the following required fields: ${missingFields.join(
            ", "
          )}`
        );
        return;
      }
    }

    if (currentStep === 1 && selectedFiles.length > 0) {
      setIsUploadingImages(true);
      try {
        const images = await uploadImagesToCloudinary(selectedFiles);
        const mapped = images.map((img: { url: string }) => ({
          url: img.url,
          isPrimary: false,
          caption: "",
          listingId: listingId,
        }));
        setExistingImages((prev) => [...prev, ...mapped]);
        setSelectedFiles([]);
        toast.success(
          `${selectedFiles.length} image(s) uploaded successfully!`
        );
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Failed to upload images. Please try again.");
        return;
      } finally {
        setIsUploadingImages(false);
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  // Client-side handler functions
  const handleRemoveImage = async (imageId: String) => {
    try {
      const response = await fetch("/api/listings/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId: imageId}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete image");
        return;
      }
setExistingImages((prev) => {
  const updated = prev.filter((img) => img.id !== imageId);
  form.setValue("images", updated);
  return updated;
});
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleMakePrimary = async (imageId: String) => {
    try {
      const response = await fetch("/api/listings/upload", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: imageId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update primary image");
        return;
      }

setExistingImages((prev) => {
  const updated = prev.map((img) => ({
    ...img,
    isPrimary: img.id === imageId,
  }));
  form.setValue("images", updated);
  return updated;
});
      toast.success("Primary image updated successfully");
    } catch (error) {
      console.error("Error updating primary image:", error);
      toast.error("Failed to update primary image");
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="mt-2 text-3xl font-bold">Edit Listing</h1>
        <p className="text-muted-foreground mt-2">
          Update your property listing details.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {[
          { id: "basic", title: "Basic Info" },
          { id: "images", title: "Images" },
          { id: "amenities", title: "Amenities" },
          { id: "rules", title: "Rules & Safety" },
          { id: "availability", title: "Availability" },
        ].map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < 4 ? "flex-1" : ""}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {index + 1}
            </div>
            {index < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {
              [
                "Basic Information",
                "Images",
                "Amenities",
                "House Rules & Safety",
                "Availability & Policy",
              ][currentStep]
            }
          </CardTitle>
          <CardDescription>
            {
              [
                "Update the basic details about your listing",
                "Manage photos of your property",
                "Update the amenities available in your property",
                "Update house rules and safety features",
                "Update available dates and cancellation policy",
              ][currentStep]
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Beautiful apartment in city center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per night *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property, highlight unique features and amenities..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Location Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city name" {...field} />
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
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter country name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter complete address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Neighborhood (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter neighborhood"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="beds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beds</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bathrooms</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxAdults"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Adults</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxChildren"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Children</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <FileUploadComponent
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                  />

                  {/* Show uploaded images if any */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Uploaded Images
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((image, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={image.url}
                              alt={`uploaded-${idx}`}
                              className="object-cover w-full h-32 rounded-lg shadow-sm"
                            />

                            {/* Primary Image Indicator */}
                            {image.isPrimary && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Primary
                              </div>
                            )}

                            {/* Caption */}
                            {image.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg truncate">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Current Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {form.getValues("images").map((image, idx) => (
                        <div key={image.id || idx} className="relative group">
                          <img
                            src={image.url}
                            alt={`uploaded-${idx}`}
                            className="object-cover w-full h-32 rounded-lg shadow-sm"
                          />

                          {/* Primary Image Indicator */}
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}

                          {/* Action Buttons - Show on hover */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveImage(image.id);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg transition-colors duration-200"
                              title="Remove image"
                            >
                              Remove
                            </button>

                            {/* Make Primary Button - Only show if not already primary */}
                            {!image.isPrimary && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleMakePrimary(image.id);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg transition-colors duration-200"
                                title="Make primary"
                              >
                                Primary
                              </button>
                            )}
                          </div>

                          {/* Caption */}
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg truncate">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {Object.entries({
                    essential: "Essential Amenities",
                    safety: "Safety Features",
                    outdoor: "Outdoor Features",
                    features: "Property Features",
                    accessibility: "Accessibility Features",
                  }).map(([category, title]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AMENITY_OPTIONS[
                          category as keyof typeof AMENITY_OPTIONS
                        ].map((option) => {
                          const IconComponent = AMENITY_ICONS[option];
                          return (
                            <FormField
                              key={option}
                              control={form.control}
                              name={
                                `amenities.${category}` as
                                  | "amenities.essential"
                                  | "amenities.safety"
                                  | "amenities.outdoor"
                                  | "amenities.features"
                                  | "amenities.accessibility"
                              }
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                  <FormControl>
                                    <Checkbox
                                      checked={(
                                        field.value as string[]
                                      )?.includes(option)}
                                      onCheckedChange={(checked) => {
                                        const current =
                                          (field.value as string[]) || [];
                                        field.onChange(
                                          checked
                                            ? [...current, option]
                                            : current.filter(
                                                (item) => item !== option
                                              )
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  {IconComponent && (
                                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                                  )}
                                  <FormLabel className="font-normal cursor-pointer flex-1">
                                    {option}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">House Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {HOUSE_RULE_OPTIONS.map((rule) => {
                        const IconComponent = HOUSE_RULE_ICONS[rule];
                        return (
                          <FormField
                            key={rule}
                            control={form.control}
                            name="houseRules"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(rule)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, rule]
                                          : current.filter(
                                              (item) => item !== rule
                                            )
                                      );
                                    }}
                                  />
                                </FormControl>
                                {IconComponent && (
                                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                                )}
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  {rule}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Safety Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SAFETY_FEATURE_OPTIONS.map((feature) => {
                        const IconComponent = SAFETY_ICON_ICONS[feature];
                        return (
                          <FormField
                            key={feature}
                            control={form.control}
                            name="safetyFeatures"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, feature]
                                          : current.filter(
                                              (item) => item !== feature
                                            )
                                      );
                                    }}
                                  />
                                </FormControl>
                                {IconComponent && (
                                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                                )}
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  {feature}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Dates</h3>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Select the dates when your property will be available
                        for booking. You can select multiple date ranges.
                      </div>
                      <FormField
                        control={form.control}
                        name="availableDates"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="border rounded-lg p-4 bg-card">
                                <Calendar
                                  mode="multiple"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  className="rounded-md"
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  numberOfMonths={2}
                                  pagedNavigation
                                  captionLayout="dropdown"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                            {field.value && field.value.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-medium mb-2">
                                  Selected dates ({field.value.length}):
                                </p>
                                <div className="text-sm text-muted-foreground">
                                  {field.value
                                    .slice(0, 5)
                                    .map((date, index) => (
                                      <span
                                        key={index}
                                        className="inline-block bg-muted px-2 py-1 rounded mr-2 mb-1"
                                      >
                                        {date.toLocaleDateString()}
                                      </span>
                                    ))}
                                  {field.value.length > 5 && (
                                    <span className="text-muted-foreground">
                                      ... and {field.value.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Cancellation Policy
                    </h3>
                    <FormField
                      control={form.control}
                      name="cancellationPolicy.type"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const policy = CANCELLATION_POLICY_OPTIONS.find(
                                (p) => p.type === value
                              );
                              if (policy) {
                                form.setValue(
                                  "cancellationPolicy.description",
                                  policy.description
                                );
                                form.setValue(
                                  "cancellationPolicy.refundableUntil",
                                  new Date(
                                    Date.now() +
                                      policy.refundableUntil * 60 * 60 * 1000
                                  )
                                );
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cancellation policy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CANCELLATION_POLICY_OPTIONS.map((policy) => (
                                <SelectItem
                                  key={policy.type}
                                  value={policy.type}
                                >
                                  {policy.type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cancellationPolicy.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isUploadingImages}
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading Images...
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Update Listing...
                      </>
                    ) : (
                      "Update Listing"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
