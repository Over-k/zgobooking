// src/components/room/RoomLocation.tsx
"use client";

import { MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Prisma } from "@prisma/client";

interface RoomLocationProps {
  room: Prisma.ListingGetPayload<{
    include: {
      location: true;
    };
  }>;
}

export default function RoomLocation({ room }: RoomLocationProps) {
  const [isMapHovered, setIsMapHovered] = useState(false);
  const location = room.location;

  // Handle string or object location types
  const city = typeof location === "object" && location !== null ? location.city : "Unknown";
  const state =
    typeof location === "object" && location !== null ? (location as any).state || "" : "";
  const address = typeof location === "object" && location !== null ? location.address : "";
  const zipCode =
    typeof location === "object" && location !== null ? (location as any).zipCode || "" : "";
  const country = typeof location === "object" && location !== null ? location.country : "";
  const neighborhood =
    typeof location === "object" && location !== null ? (location as any).neighborhood || "" : "";

  // Use coordinates if available
  const coordinates =
    typeof location === "object" && (location as any).coordinates
      ? (location as any).coordinates
      : { latitude: 10.7769, longitude: 106.7009 };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Where you will be</h2>

      <div
        className="rounded-lg overflow-hidden h-64 bg-muted mb-4 relative cursor-pointer"
        onMouseEnter={() => setIsMapHovered(true)}
        onMouseLeave={() => setIsMapHovered(false)}
      >
        {/* Static map background with minimal styling */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
          {/* Grid lines to simulate a map */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
            {Array.from({ length: 48 }).map((_, index) => (
              <div
                key={index}
                className="border border-blue-200 opacity-20"
              ></div>
            ))}
          </div>

          {/* Main location marker */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-rose-500 rounded-full animate-pulse"></div>
              <MapPin className="h-12 w-12 text-rose-600 drop-shadow-md relative z-10" />

              {/* Ripple effect */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-rose-500 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>

          {/* Zoom controls to simulate map UI */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button className="bg-background w-8 h-8 rounded-md shadow-md flex items-center justify-center text-foreground font-bold">
              +
            </button>
            <button className="bg-background w-8 h-8 rounded-md shadow-md flex items-center justify-center text-foreground font-bold">
              −
            </button>
          </div>
        </div>

        {/* Location label */}
        <div className="absolute bottom-4 left-4 bg-white py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105">
          <p className="font-medium">
            {city}
            {state ? `, ${state}` : ""}
          </p>
        </div>

        {/* Hover overlay with instructions */}
        {isMapHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white py-3 px-6 rounded-lg shadow-lg text-center">
              <p className="font-medium">View in map application</p>
              <p className="text-sm text-muted-foreground">
                {coordinates.latitude.toFixed(4)},{" "}
                {coordinates.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        )}
      </div>

      {address && <p className="text-foreground mb-2">{address}</p>}

      <p className="text-foreground mb-2">
        {neighborhood && `${neighborhood}, `}
        {city}
        {state ? `, ${state}` : ""} {zipCode && zipCode}, {country}
      </p>

      <p className="text-foreground mb-4">
        Great location - 94% of recent guests gave the location a 5-star rating
      </p>

      <Separator className="my-8" />
    </div>
  );
}
