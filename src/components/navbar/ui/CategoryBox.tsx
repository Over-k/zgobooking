"use client";

import { useSearchParams } from "next/navigation";
import React, { useCallback} from "react";
import { IconType } from "react-icons";
import { useSearch } from "@/context/SearchContext";

type Props = {
  icon: IconType;
  label: string;
  selected?: boolean;
};

function CategoryBox({ icon: Icon, label, selected }: Props) {
  const params = useSearchParams();

  const { searchParams, setSearchParams, setIsSearchActive } =
    useSearch();

  // Update category selection
  const handleCategoryClick = useCallback(() => {
    // Get current query params
    const updatedParams = new URLSearchParams(params.toString());

    // Toggle category
    if (selected) {
      updatedParams.delete("category");
    } else {
      updatedParams.set("category", label);
    }

    // Update search context while preserving existing params
    setSearchParams({
      ...searchParams,
      category: selected ? undefined : label,
    });
    setIsSearchActive(true);
    
  }, [
    label,
    params,
    searchParams,
    selected,
    setIsSearchActive,
    setSearchParams,
  ]);

  return (
    <div
      onClick={handleCategoryClick}
      className={`flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-neutral-800 transition cursor-pointer ${
        selected ? "border-b-neutral-800" : "border-transparent"
      } ${selected ? "text-neutral-800" : "text-neutral-500"}`}
    >
      <Icon size={18} />
      <div className="font-medium text-xs">{label}</div>
    </div>
  );
}

export { CategoryBox };
