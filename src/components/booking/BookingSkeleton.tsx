"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Booking Form */}
        <div className="lg:col-span-2">
          <Skeleton className="h-8 w-3/4 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Right side - Booking Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border shadow-md p-6 sticky top-24">
            <Skeleton className="h-8 w-1/2 mb-6" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-6 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
} 