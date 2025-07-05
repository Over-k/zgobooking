"use client";

import { useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CategoryBox } from "@/components/navbar/ui/CategoryBox";
import { categories } from "@/components/navbar/data/categoriesData";
import { FilterModal } from "@/components/navbar/ui/FilterModal"; // Import the components we just created
import { FilterButton } from "@/components/navbar/ui/FilterButton"; // Import the components we just created

type CategoriesProps = {};

function Categories({}: CategoriesProps) {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();

  // State for filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Count active filters
  const countActiveFilters = useCallback((): number => {
    if (!params) return 0;

    let count = 0;
    if (params.get("minPrice") || params.get("maxPrice")) count++;
    if (params.get("beds")) count++;
    if (params.get("bathrooms")) count++;
    if (params.get("wifi") === "true") count++;
    if (params.get("kitchen") === "true") count++;
    if (params.get("privateBathroom") === "true") count++;

    return count;
  }, [params]);

  const isMainPage = pathname === "/";

  if (!isMainPage) {
    return null;
  }

  return (
    <>
      <div className="pt-2 flex flex-row items-center justify-center overflow-x-auto max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-2">
        <div className="flex flex-row items-center overflow-x-auto">
          {categories.map((items, index) => (
            <CategoryBox
              key={index}
              icon={items.icon}
              label={items.label}
              selected={category === items.label}
            />
          ))}
        </div>

        {/* Filter button */}
        <div className="px-4">
          <FilterButton
            onClick={() => setIsFilterModalOpen(true)}
            activeFilters={countActiveFilters()}
          />
        </div>
      </div>

      {/* Filter modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={() => setIsFilterModalOpen(false)}
      />
    </>
  );
}

export { Categories };
