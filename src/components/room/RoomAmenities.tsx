"use client";

import { JSX, useState } from "react";
import {
  Wifi,
  Utensils,
  Snowflake,
  AlarmSmoke,
  ShieldCheck,
  DoorOpen,
  Tv,
  MoveRight,
  Drill,
  Flower,
  LayoutPanelLeft,
  Bath,
  Ban,
  X,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoomAmenitiesProps {
  amenities: {
    essential?: string[];
    safety?: string[];
    features?: string[];
    outdoor?: string[];
    accessibility?: string[];
    others?: string[];
  };
}

interface AllAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: {
    essential?: string[];
    safety?: string[];
    features?: string[];
    outdoor?: string[];
    accessibility?: string[];
    others?: string[];
  };
}

// ICONS MAPPING
const amenityIcons: Record<string, JSX.Element> = {
  wifi: <Wifi className="h-6 w-6" />,
  kitchen: <Utensils className="h-6 w-6" />,
  "air conditioning": <Snowflake className="h-6 w-6" />,
  "smoke alarm": <AlarmSmoke className="h-6 w-6" />,
  "fire extinguisher": <ShieldCheck className="h-6 w-6" />,
  "private entrance": <DoorOpen className="h-6 w-6" />,
  tv: <Tv className="h-6 w-6" />,
  "step-free entrance": <MoveRight className="h-6 w-6" />,
  "bbq grill": <Drill className="h-6 w-6" />,
  garden: <Flower className="h-6 w-6" />,
  patio: <LayoutPanelLeft className="h-6 w-6" />,
  "private bathroom": <Bath className="h-6 w-6" />,
};

// Utility to get icon
const getAmenityIcon = (name: string) => {
  return amenityIcons[name.toLowerCase()] || <Ban className="h-6 w-6" />;
};

// Amenity Item
const AmenityItem = ({ amenity }: { amenity: string }) => (
  <div className="flex items-center p-2">
    <div className="text-muted-foreground">{getAmenityIcon(amenity)}</div>
    <span className="ml-4 capitalize">{amenity}</span>
  </div>
);

// Modal Component
const AllAmenitiesModal = ({
  isOpen,
  onClose,
  amenities,
}: AllAmenitiesModalProps) => {
  // First problem: Your data structure has categories in lowercase
  // but your display categories are capitalized
  const categories: Record<string, string[]> = {
    Essentials: [],
    Safety: [],
    Features: [],
    Outdoor: [],
    Others: [],
  };

  // Map your data structure to the display categories
  if (amenities.essential) {
    categories.Essentials = amenities.essential;
  }
  if (amenities.safety) {
    categories.Safety = amenities.safety;
  }
  if (amenities.features) {
    categories.Features = amenities.features;
  }
  if (amenities.outdoor) {
    categories.Outdoor = amenities.outdoor;
  }
  if (amenities.accessibility) {
    // You need to decide where accessibility items go
    // For now, I'll put them in Features
    categories.Features = [
      ...categories.Features,
      ...(amenities.accessibility || []),
    ];
  }
  if (amenities.others) {
    categories.Others = amenities.others;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            All amenities
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {Object.entries(categories).map(([category, items]) =>
            items.length > 0 ? (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  {/* Second problem: No need to filter here anymore */}
                  {items.map((item, idx) => (
                    <AmenityItem key={idx} amenity={item} />
                  ))}
                </div>
                {category !== "Others" && <Separator className="mt-6" />}
              </div>
            ) : null
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function RoomAmenities({ amenities }: RoomAmenitiesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allAmenities = Object.values(amenities).flatMap(
    (categoryAmenities) => categoryAmenities || []
  );
  const displayedAmenities = allAmenities.slice(0, 6);
  const hasMoreAmenities = allAmenities.length > 6;

  return (
    <div className="p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">What this place offers</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {displayedAmenities.map((amenity, idx) => (
          <AmenityItem key={idx} amenity={amenity} />
        ))}
      </div>

      {hasMoreAmenities && (
        <Button
          variant="outline"
          className="mt-4 border hover:bg-base-100"
          onClick={() => setIsModalOpen(true)}
        >
          Show all {allAmenities.length} amenities
        </Button>
      )}

      <AllAmenitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amenities={amenities}
      />

      <Separator className="my-8" />
    </div>
  );
}
