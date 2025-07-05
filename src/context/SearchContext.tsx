"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Listing } from "@/types/listing";

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
  setFilteredListings: (listings: Listing[]) => void;
}

const defaultSearchParams: SearchParams = {
  location: "",
  checkIn: undefined,
  checkOut: undefined,
  guests: {
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  },
  minPrice: undefined,
  maxPrice: undefined,
  beds: undefined,
  bathrooms: undefined,
  amenities: {
    essential: [],
    safety: [],
    features: [],
    accessibility: [],
  },
  category: undefined,
  wifi: undefined,
  kitchen: undefined,
  privateBathroom: undefined,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParamsState] =
    useState<SearchParams>(defaultSearchParams);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  const setSearchParams = (params: Partial<SearchParams>) => {
    setSearchParamsState((prev) => ({ ...prev, ...params }));
  };

  const resetSearchParams = () => {
    setSearchParamsState(defaultSearchParams);
    setIsSearchActive(false);
    setFilteredListings([]);
  };

  const buildSearchQueryParams = (searchParams: SearchParams): URLSearchParams => {
    const queryParams = new URLSearchParams();

    const paramMappings = {
      location: searchParams.location,
      minPrice: searchParams.minPrice?.toString(),
      maxPrice: searchParams.maxPrice?.toString(),
      category: searchParams.category,
      beds: searchParams.beds?.toString(),
      bathrooms: searchParams.bathrooms?.toString(),
      wifi: searchParams.wifi ? 'true' : undefined,
      kitchen: searchParams.kitchen ? 'true' : undefined,
      privateBathroom: searchParams.privateBathroom ? 'true' : undefined,
      guests: (searchParams.guests.adults + searchParams.guests.children) > 0 
        ? (searchParams.guests.adults + searchParams.guests.children).toString() 
        : undefined
    };

    Object.entries(paramMappings).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.set(key, value);
      }
    });

    return queryParams;
  };

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        setSearchParams,
        resetSearchParams,
        isSearchActive,
        setIsSearchActive,
        filteredListings,
        setFilteredListings,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
