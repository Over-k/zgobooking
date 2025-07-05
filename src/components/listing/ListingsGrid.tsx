"use client";
import { ListingCard } from "./ListingCard";
import { useSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Listing } from "@/types/listing";
import { Loader2 } from "lucide-react";

interface SearchParams {
  location: string;
  checkIn?: Date;
  checkOut?: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  bathrooms?: number;
  amenities: {
    essential?: string[];
    safety?: string[];
    features?: string[];
    accessibility?: string[];
  };
  category?: string;
  wifi?: boolean;
  kitchen?: boolean;
  privateBathroom?: boolean;
}
interface SearchContextType {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  resetSearchParams: () => void;
  isSearchActive: boolean;
  setIsSearchActive: (value: boolean) => void;
  filteredListings: Listing[];
  isLoading: boolean;
  executeSearch: () => void;
}

export const ListingsGrid = () => {
  const {
    searchParams,
    isSearchActive,
    setIsSearchActive,
    filteredListings,
    setFilteredListings,
    resetSearchParams
  } = useSearch();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoadingAllListings, setIsLoadingAllListings] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Fetch all listings on component mount
  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        setIsLoadingAllListings(true);
        const response = await fetch("/api/listings");
        if (!response.ok) throw new Error("Failed to fetch listings");
        const data = await response.json();
        const shuffledData = Array.isArray(data)
          ? [...data].sort(() => Math.random() - 0.5)
          : [];
        setAllListings(shuffledData);
      } catch (error) {
        console.error("Error fetching all listings:", error);
        setAllListings([]);
      } finally {
        setIsLoadingAllListings(false);
      }
    };

    if (!isSearchActive) {
      fetchAllListings();
    }
  }, [isSearchActive]);

  // Execute search function
  const executeSearch = async () => {
    if (!isSearchActive) return;

    setIsSearchLoading(true);

    try {
      const queryParams = new URLSearchParams();

      // Location is now optional
      if (searchParams.location) {
        queryParams.set("location", searchParams.location);
      }

      // Optional guest parameters
      const totalGuests = searchParams.guests.adults + 
                          searchParams.guests.children + 
                          searchParams.guests.infants + 
                          searchParams.guests.pets;
      if (totalGuests > 0) {
        queryParams.set("guests", totalGuests.toString());
      }

      // Optional additional filters
      if (searchParams.minPrice !== undefined) {
        queryParams.set("minPrice", searchParams.minPrice.toString());
      }

      if (searchParams.maxPrice !== undefined) {
        queryParams.set("maxPrice", searchParams.maxPrice.toString());
      }

      if (searchParams.category) {
        queryParams.set("category", searchParams.category);
      }

      if (searchParams.beds !== undefined) {
        queryParams.set("beds", searchParams.beds.toString());
      }

      if (searchParams.bathrooms !== undefined) {
        queryParams.set("bathrooms", searchParams.bathrooms.toString());
      }

      if (searchParams.wifi) {
        queryParams.set("wifi", "true");
      }

      if (searchParams.kitchen) {
        queryParams.set("kitchen", "true");
      }

      if (searchParams.privateBathroom) {
        queryParams.set("privateBathroom", "true");
      }

      const response = await fetch(`/api/listings/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const searchResults = await response.json();
      setFilteredListings(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setFilteredListings([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Trigger search when search is active
  useEffect(() => {
    if (isSearchActive) {
      executeSearch();
    }
  }, [isSearchActive, searchParams]);

  const getActiveFiltersDescription = () => {
    const filters = [
      searchParams.location && `Location: ${searchParams.location}`,
      searchParams.checkIn && searchParams.checkOut && 
        `Dates: ${searchParams.checkIn.toLocaleDateString()} - ${searchParams.checkOut.toLocaleDateString()}`,
      (searchParams.guests.adults + searchParams.guests.children > 0) && 
        `Guests: ${searchParams.guests.adults + searchParams.guests.children}`,
      searchParams.category && `Category: ${searchParams.category}`,
      searchParams.minPrice && `Min price: ${searchParams.minPrice}`,
      searchParams.maxPrice && `Max price: ${searchParams.maxPrice}`,
      searchParams.beds && `Beds: ${searchParams.beds}`,
      searchParams.bathrooms && `Bathrooms: ${searchParams.bathrooms}`,
      searchParams.wifi && "Wifi",
      searchParams.kitchen && "Kitchen",
      searchParams.privateBathroom && "Private bathroom"
    ].filter(Boolean).join(" · ");

    return filters;
  };

  // Determine which listings to show and if we're in a loading state
  const listings = isSearchActive ? filteredListings : allListings;
  const currentlyLoading = isSearchActive ? isSearchLoading : isLoadingAllListings;

  if (currentlyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading listings...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      {isSearchActive ? (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredListings.length}{" "}
              {filteredListings.length === 1 ? "listing" : "listings"} found
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSearchParams}
              className="flex items-center gap-1"
            >
              <X size={14} />
              Clear search
            </Button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {getActiveFiltersDescription()}
          </p>
        </div>
      ) : (
        <h2 className="mb-6 text-xl font-semibold">
          Popular stays around the world
        </h2>
      )}

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              images={listing.images || []}
              location={listing?.location}
              rating={listing.rating}
              hostName={listing.host?.firstName}
              hostId={listing.host?.id}
              propertyType={listing.propertyType}
              price={listing.price}
              currency={listing.currency}
              hostYears={listing.host?.joinDate ? new Date().getFullYear() - new Date(listing.host.joinDate).getFullYear() : 0}
              hostImage={listing.host?.profileImage}
              dates={listing.dates}
              nights={listing.nights}
              favorites={listing.favorites}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold mb-2">No listings found</h3>
          <p className="text-gray-500 mb-4 text-base max-w-md">
            Try adjusting your search criteria or filters to see more results.
          </p>
          <Button onClick={resetSearchParams} className="w-full sm:w-auto">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};
