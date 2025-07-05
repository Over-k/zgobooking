"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center hover:bg-background-200"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Button>
      </div>
    </div>
  );
}
