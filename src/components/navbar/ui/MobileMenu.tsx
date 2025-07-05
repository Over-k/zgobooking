"use client";

import React, { useRef, useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  X,
  MapPin,
  Users,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { destinations } from "../data/searchData";
import { useSearch } from "@/context/SearchContext";

const MobileMenu = () => {
  const { searchParams, setSearchParams, isSearchActive, setIsSearchActive } =
    useSearch();

  const [location, setLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<"checkIn" | "checkOut">("checkIn");
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const locationRef = useRef<HTMLInputElement>(null);
  const totalGuests = guests.adults + guests.children;

  // Load recent searches on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
  }, []);

  // Sync with search context when it changes
  useEffect(() => {
    if (isSearchActive) {
      setLocation(searchParams.location);
      setCheckInDate(searchParams.checkIn);
      setCheckOutDate(searchParams.checkOut);
      setGuests(searchParams.guests);
    }
  }, [isSearchActive, searchParams]);

  const saveRecentSearch = (loc: string) => {
    if (!loc) return;

    const updated = [loc, ...recentSearches.filter((s) => s !== loc)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = () => {

        saveRecentSearch(location);

        // Update search context
        setSearchParams({
          location,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
        });
        setIsSearchActive(true);

        // Close any open popovers
        setShowSuggestions(false);
        setIsDatePopoverOpen(false);
        setIsGuestPopoverOpen(false);;

    // Close any open popovers
    setShowSuggestions(false);
    setIsDatePopoverOpen(false);
    setIsGuestPopoverOpen(false);
  };

  const handleGuestChange = (type: keyof typeof guests, val: number) => {
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, val) }));
  };

  const guestSummary = () => {
    if (totalGuests === 0) return "";
    const parts = [`${totalGuests} guest${totalGuests > 1 ? "s" : ""}`];
    if (guests.infants)
      parts.push(`${guests.infants} infant${guests.infants > 1 ? "s" : ""}`);
    if (guests.pets)
      parts.push(`${guests.pets} pet${guests.pets > 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (dateRange === "checkIn") {
      setCheckInDate(date);
      setDateRange("checkOut");
      // Automatically set checkout date to the next day if not already set
      if (date && (!checkOutDate || checkOutDate <= date)) {
        setCheckOutDate(addDays(date, 1));
      }
    } else {
      setCheckOutDate(date);
      setDateRange("checkIn");
    }
  };

  const clearLocation = () => {
    setLocation("");
    locationRef.current?.focus();
  };

  const resetDates = () => {
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setDateRange("checkIn");
  };

  return (
    <div className="w-full p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Container */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch border shadow bg-background rounded-r-sm">
        {/* Location */}
        <div
          className="relative flex-1 px-4 py-2 border-b sm:border-b-0 sm:border-r"
          onClick={() => locationRef.current?.focus()}
        >
          <label className="text-xs font-medium mb-1 block">Where</label>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <input
              ref={locationRef}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search destination"
              className="w-full bg-transparent text-sm outline-none"
            />
            {location && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLocation();
                }}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {showSuggestions && (
            <div className="absolute z-50 top-full left-0 right-0 bg-background shadow-lg rounded-lg mt-1 text-sm max-h-80 overflow-y-auto">
              {location ? (
                destinations
                  .filter((d) =>
                    d.toLowerCase().includes(location.toLowerCase())
                  )
                  .map((dest, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:border-l-2 cursor-pointer flex items-center"
                      onClick={() => {
                        setLocation(dest);
                        setShowSuggestions(false);
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {dest}
                    </div>
                  ))
              ) : (
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Recent</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recentSearches.map((r, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              setLocation(r);
                              setShowSuggestions(false);
                            }}
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <h3 className="text-sm font-medium mb-2">Popular</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {destinations.slice(0, 6).map((d, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          setLocation(d);
                          setShowSuggestions(false);
                        }}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex-1 px-4 py-2 border-b sm:border-b-0 sm:border-r">
          <label className="text-xs font-medium mb-1 block">Dates</label>
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center w-full text-left text-sm outline-none"
                onClick={() => setIsDatePopoverOpen(true)}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {checkInDate && checkOutDate ? (
                  <>
                    {format(checkInDate, "MMM dd")} -{" "}
                    {format(checkOutDate, "MMM dd")}
                  </>
                ) : (
                  <span>Add dates</span>
                )}
                {(checkInDate || checkOutDate) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetDates();
                    }}
                    className="ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto rounded z-50">
              <div className="p-3 border-b">
                <h3 className="font-medium">Select your stay</h3>
                {checkInDate && checkOutDate && (
                  <p className="text-sm text-muted-foreground">
                    {Math.ceil(
                      (checkOutDate.getTime() - checkInDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    nights
                  </p>
                )}
              </div>
              <Calendar
                mode="range"
                numberOfMonths={1}
                selected={{ from: checkInDate, to: checkOutDate }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setCheckInDate(range.from);
                    setCheckOutDate(range.to);
                  } else if (range?.from) {
                    setCheckInDate(range.from);
                    setCheckOutDate(undefined);
                  }
                }}
                initialFocus
                captionLayout="dropdown"
                fromYear={1950}
                toYear={2050}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
              <div className="p-3 border-t flex justify-between">
                <Button variant="outline" onClick={resetDates}>
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    if (checkInDate && checkOutDate) {
                      setIsDatePopoverOpen(false);
                    }
                  }}
                  disabled={!checkInDate || !checkOutDate}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="flex-1 px-4 py-2">
          <label className="text-xs font-medium mb-1 block">Who</label>
          <Popover
            open={isGuestPopoverOpen}
            onOpenChange={setIsGuestPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button className="flex items-center text-sm w-full text-left">
                <Users className="w-4 h-4 mr-2" />
                {guestSummary() || "Add guests"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 rounded z-50">
              {[
                { key: "adults", label: "Adults", desc: "13 or older" },
                { key: "children", label: "Children", desc: "2–12" },
                { key: "infants", label: "Infants", desc: "Under 2" },
                { key: "pets", label: "Pets", desc: "Service animals allowed" },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex justify-between items-center mb-4"
                >
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={guests[key as keyof typeof guests] <= 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleGuestChange(
                          key as keyof typeof guests,
                          guests[key as keyof typeof guests] - 1
                        );
                      }}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">
                      {guests[key as keyof typeof guests]}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleGuestChange(
                          key as keyof typeof guests,
                          guests[key as keyof typeof guests] + 1
                        );
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <Button size="sm" onClick={() => setIsGuestPopoverOpen(false)}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-4 text-right sm:text-center">
        <Button className="w-full sm:w-auto px-6 py-2" onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>
    </div>
  );
};

export { MobileMenu };
