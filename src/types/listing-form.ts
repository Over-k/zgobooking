import { z } from "zod";

export const listingFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    propertyType: z.string().min(1, "Property type is required"),
    category: z.string().min(1, "Category is required"),
    price: z.string().min(1, "Price is required"),
    currency: z.string().default("USD"),
    beds: z.string(),
    bathrooms: z.string(),
    maxAdults: z.string(),
    maxChildren: z.string(),
    maxInfants: z.string(),
    maxPets: z.string(),
    minimumStay: z.string(),
    maximumStay: z.string(),
    instantBooking: z.boolean(),
    city: z.string(),
    country: z.string(),
    neighborhood: z.string().optional(),
    address: z.string(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    images: z.array(
        z.object({
            id: z.string(),
            url: z.string(),
            caption: z.string().optional(),
            isPrimary: z.boolean(),
            listingId: z.string().optional()
            
        })
    ),
    amenities: z.object({
        essential: z.array(z.string()),
        safety: z.array(z.string()),
        outdoor: z.array(z.string()),
        features: z.array(z.string()),
        accessibility: z.array(z.string()),
        others: z.array(z.string()).optional()
    }),
    houseRules: z.array(z.string()),
    safetyFeatures: z.array(z.string()),
    availableDates: z.array(z.date()),
    cancellationPolicy: z.object({
        type: z.string(),
        description: z.string(),
        refundableUntil: z.date()
    })
});

export type ListingFormData = z.infer<typeof listingFormSchema>;