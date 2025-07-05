"use client";

import { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { FiMinus, FiPlus } from "react-icons/fi";
import { BiWifi } from "react-icons/bi";
import { MdOutlineKitchen } from "react-icons/md";
import { FaBath } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSearch } from "@/context/SearchContext";

// Define types
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

interface PriceRangeType {
  min: number;
  max: number;
}

interface AmenitiesType {
  wifi: boolean;
  kitchen: boolean;
  privateBathroom: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const { searchParams, setSearchParams, setIsSearchActive } = useSearch();

  // Filter states
  const [priceRange, setPriceRange] = useState<PriceRangeType>({
    min: 50,
    max: 1000,
  });
  const [beds, setBeds] = useState<number>(0);
  const [bathrooms, setBathrooms] = useState<number>(0);
  const [amenities, setAmenities] = useState<AmenitiesType>({
    wifi: false,
    kitchen: false,
    privateBathroom: false,
  });

  // Load existing filters from search context
  useEffect(() => {
    if (searchParams.minPrice !== undefined) setPriceRange(prev => ({ ...prev, min: searchParams.minPrice! }));
    if (searchParams.maxPrice !== undefined) setPriceRange(prev => ({ ...prev, max: searchParams.maxPrice! }));
    if (searchParams.beds !== undefined) setBeds(searchParams.beds);
    if (searchParams.bathrooms !== undefined) setBathrooms(searchParams.bathrooms);
    setAmenities({
      wifi: searchParams.amenities.essential?.includes("wifi") || false,
      kitchen: searchParams.amenities.essential?.includes("kitchen") || false,
      privateBathroom: searchParams.amenities.features?.includes("private_bathroom") || false,
    });
  }, [searchParams]);

  const handleApplyFilters = useCallback(() => {
    // Update search params in context
    setSearchParams({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      beds: beds > 0 ? beds : undefined,
      bathrooms: bathrooms > 0 ? bathrooms : undefined,
      wifi: amenities.wifi || undefined,
      kitchen: amenities.kitchen || undefined,
      privateBathroom: amenities.privateBathroom || undefined,
    });
    
    setIsSearchActive(true);
    onApply();
  }, [priceRange, beds, bathrooms, amenities, setSearchParams, setIsSearchActive, onApply]);

  const handleClearAll = (): void => {
    setPriceRange({ min: 50, max: 1000 });
    setBeds(0);
    setBathrooms(0);
    setAmenities({
      wifi: false,
      kitchen: false,
      privateBathroom: false,
    });
  };

  // Price range handlers
  const incrementPrice = (key: keyof PriceRangeType): void => {
    setPriceRange((prev) => ({
      ...prev,
      [key]: prev[key] + 100,
    }));
  };

  const decrementPrice = (key: keyof PriceRangeType): void => {
    setPriceRange((prev) => ({
      ...prev,
      [key]: Math.max(key === "min" ? 0 : prev.min, prev[key] - 100),
    }));
  };

  // Beds and bathrooms handlers
  const increment = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ): void => {
    setter((prev) => prev + 1);
  };

  const decrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number
  ): void => {
    if (value > 0) {
      setter((prev) => prev - 1);
    }
  };

  // Amenity toggle handler
  const toggleAmenity = (key: keyof AmenitiesType, value: boolean): void => {
    setAmenities((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2 rounded-full">
            <IoClose size={24} />
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-1">Price range</h3>

            <div className="flex justify-between gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Minimum</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => decrementPrice("min")}
                    className="p-2 flex items-center justify-center border-r"
                    disabled={priceRange.min <= 0}
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-2 text-center outline-none"
                  />
                  <button
                    onClick={() => incrementPrice("min")}
                    className="p-2 flex items-center justify-center border-l"
                    disabled={priceRange.min >= priceRange.max - 100}
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm mb-1">Maximum</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => decrementPrice("max")}
                    className="p-2 flex items-center justify-center border-r"
                    disabled={priceRange.max <= priceRange.min + 100}
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: parseInt(e.target.value) || prev.min + 100,
                      }))
                    }
                    className="w-full p-2 text-center outline-none"
                  />
                  <button
                    onClick={() => incrementPrice("max")}
                    className="p-2 flex items-center justify-center border-l"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Price range: ${priceRange.min} - $
              {priceRange.max >= 1000 ? "1000+" : priceRange.max}
            </div>
          </div>

          {/* Beds and Bathrooms */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Beds and bathrooms</h3>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span>Beds</span>
                <div className="flex items-center">
                  <button
                    onClick={() => decrement(setBeds, beds)}
                    className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                      beds === 0 ? "text-gray-300" : "text-gray-600"
                    }`}
                    disabled={beds === 0}
                  >
                    <FiMinus />
                  </button>
                  <span className="mx-4 min-w-10 text-center">
                    {beds === 0 ? "Any" : beds}
                  </span>
                  <button
                    onClick={() => increment(setBeds)}
                    className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span>Bathrooms</span>
                <div className="flex items-center">
                  <button
                    onClick={() => decrement(setBathrooms, bathrooms)}
                    className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                      bathrooms === 0 ? "text-gray-300" : "text-gray-600"
                    }`}
                    disabled={bathrooms === 0}
                  >
                    <FiMinus />
                  </button>
                  <span className="mx-4 min-w-10 text-center">
                    {bathrooms === 0 ? "Any" : bathrooms}
                  </span>
                  <button
                    onClick={() => increment(setBathrooms)}
                    className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Amenities</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BiWifi size={18} />
                  <Label htmlFor="wifi-toggle">Wifi</Label>
                </div>
                <Switch
                  id="wifi-toggle"
                  checked={amenities.wifi}
                  onCheckedChange={(checked: boolean) =>
                    toggleAmenity("wifi", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdOutlineKitchen size={18} />
                  <Label htmlFor="kitchen-toggle">Kitchen</Label>
                </div>
                <Switch
                  id="kitchen-toggle"
                  checked={amenities.kitchen}
                  onCheckedChange={(checked: boolean) =>
                    toggleAmenity("kitchen", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBath size={16} />
                  <Label htmlFor="bathroom-toggle">
                    Private attached bathroom
                  </Label>
                </div>
                <Switch
                  id="bathroom-toggle"
                  checked={amenities.privateBathroom}
                  onCheckedChange={(checked: boolean) =>
                    toggleAmenity("privateBathroom", checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button
            variant="link"
            onClick={handleClearAll}
            className="font-semibold"
          >
            Clear all
          </Button>

          <Button
            variant="default"
            onClick={handleApplyFilters}
            className="px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary/90"
          >
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
};

export { FilterModal };
