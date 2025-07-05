"use client";
import { useRef, useState, useEffect } from "react";
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
import { destinations } from "../data/searchData";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/context/SearchContext";

const DesktopMenu = () => {
  const { searchParams, setSearchParams, isSearchActive, setIsSearchActive } =
    useSearch();

  const [location, setLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
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
  const dateRef = useRef<HTMLButtonElement>(null);
  const guestRef = useRef<HTMLButtonElement>(null);

  const totalGuests = guests.adults + guests.children;

  // Load recent searches on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
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

  const saveRecentSearch = (location: string) => {
    if (!location) return;

    const updatedSearches = [
      location,
      ...recentSearches.filter((search) => search !== location),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const guestSummary = () => {
    if (totalGuests === 0) return "";
    let summary = `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`;
    if (guests.infants)
      summary += `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}`;
    if (guests.pets)
      summary += `, ${guests.pets} pet${guests.pets > 1 ? "s" : ""}`;
    return summary;
  };

  const handleGuestChange = (type: keyof typeof guests, value: number) => {
    const updatedGuests = { ...guests, [type]: Math.max(0, value) };
    setGuests(updatedGuests);
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
    setIsGuestPopoverOpen(false);
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

  const applyDates = () => {
    setIsDatePopoverOpen(false);
  };

  const applyGuests = () => {
    setIsGuestPopoverOpen(false);
  };

  return (
    <div className="hidden sm:flex flex-col items-center mx-2 w-full relative">
      <div className="flex w-full max-w-3xl items-center justify-between border rounded-md shadow backdrop-blur-md  bg-card border-border">
        {/* WHERE */}
        <div
          className="relative flex-1 px-2 py-1 border-r cursor-pointer"
          onClick={() => locationRef.current?.focus()}
        >
          <label className="text-xs font-medium block mb-1">Where</label>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <input
              ref={locationRef}
              type="text"
              placeholder="Search destination"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full text-sm focus:outline-none"
            />
            {location && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearLocation();
                }}
                className="ml-1 p-1"
              >
                <X className="w-3 h-3 text-gray-500" />
              </Button>
            )}
          </div>

          {showSuggestions && (
            <div
              className="absolute z-50 bg-background top-full left-0 right-0 w-full max-w-3xl rounded-lg shadow-lg max-h-80 overflow-y-auto text-sm"
              onClick={(e) => e.stopPropagation()}
              style={{ display: showSuggestions ? "block" : "none" }}
            >
              {location.length > 0 ? (
                <ul>
                  {destinations
                    .filter((dest) =>
                      dest.toLowerCase().includes(location.toLowerCase())
                    )
                    .map((dest, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 cursor-pointer flex items-center hover:border-l-2"
                        onClick={() => {
                          setLocation(dest);
                          setShowSuggestions(false);
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        {dest}
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-sm mb-2">
                        Recent searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              setLocation(search);
                              setShowSuggestions(false);
                            }}
                          >
                            {search}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <h3 className="font-medium text-sm mb-2">
                    Popular destinations
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {destinations.slice(0, 6).map((dest, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          setLocation(dest);
                          setShowSuggestions(false);
                        }}
                      >
                        {dest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CHECK-IN / CHECK-OUT */}
        <div className="flex-1 px-2 py-1 border-r cursor-pointer">
          <label className="text-xs font-medium block mb-1">
            Check-in / Check-out
          </label>

          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                className="text-sm w-full text-left bg-transparent outline-none flex items-center"
                onClick={() => setIsDatePopoverOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsDatePopoverOpen(true);
                  }
                }}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {checkInDate && checkOutDate ? (
                  <div className="flex gap-1">
                    <span>{format(checkInDate, "MMM dd")}</span>
                    <span>-</span>
                    <span>{format(checkOutDate, "MMM dd")}</span>
                  </div>
                ) : (
                  <span>Add dates</span>
                )}

                {(checkInDate || checkOutDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetDates();
                    }}
                    className="ml-1 p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent
              className="p-0 rounded w-auto z-50"
              onClick={(e) => e.stopPropagation()} // prevent auto-close when selecting dates
            >
              <div className="p-3 border-b">
                <h3 className="font-medium">Select your stay</h3>
                {checkInDate && checkOutDate && (
                  <p className="text-sm text-muted-foreground">
                    Your stay:{" "}
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
                numberOfMonths={2}
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
                      applyDates();
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

        {/* WHO */}
        <div
          className="flex-1 px-2 py-1 border-r cursor-pointer"
          onClick={() => guestRef.current?.click()}
        >
          <label className="text-xs font-medium block mb-1">Who</label>
          <Popover
            open={isGuestPopoverOpen}
            onOpenChange={setIsGuestPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button
                ref={guestRef}
                className="text-sm w-full text-left bg-transparent outline-none flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                {guestSummary() || "Add guests"}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 rounded z-50"
              sideOffset={5}
              side="bottom"
              collisionPadding={10}
            >
              {[
                { key: "adults", label: "Adults", desc: "Ages 13 or above" },
                { key: "children", label: "Children", desc: "Ages 2–12" },
                { key: "infants", label: "Infants", desc: "Under 2" },
                { key: "pets", label: "Pets", desc: "Service animals allowed" },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex justify-between items-center my-4 pb-4 border-b last:border-none"
                >
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  <div className="flex items-center space-x-3">
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
                      className="h-8 w-8 rounded-full"
                    >
                      -
                    </Button>
                    <span className="w-5 text-center">
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
                      className="h-8 w-8 rounded-full"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-4">
                <Button size="sm" onClick={applyGuests}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* SEARCH */}
        <div className="px-2 py-1">
          <button
            onClick={handleSearch}
            className="primary p-3 rounded-full hover:scale-105 transition-all flex items-center"
          >
            <Search className="w-4 h-4" />
            <span className="ml-1">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export { DesktopMenu };
