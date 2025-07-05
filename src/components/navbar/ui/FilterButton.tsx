"use client";

import { FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterButtonProps {
  onClick: () => void;
  activeFilters?: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  activeFilters = 0,
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2 px-4 py-2 rounded-full hover:shadow-md transition"
    >
      <FiFilter size={16} />
      <span>Filters</span>
      {activeFilters > 0 && (
        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-black text-white">
          {activeFilters}
        </Badge>
      )}
    </Button>
  );
};

export { FilterButton };
