// src/components/room/BackButton.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/context/BookingContext";

export default function BackButton() {
  const router = useRouter();
  const { priceDetails, totalNights } = useBooking();
  const { roomId } = useParams();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceDetails.currency || 'MAD',
      currencyDisplay: 'code'
    }).format(price).replace('MAD', 'MAD');
  };

  const showPriceInfo = totalNights > 0 && priceDetails.total > 0;

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

        <div className="ml-auto flex items-center space-x-4">
          {showPriceInfo && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">
                {formatPrice(priceDetails.total)}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                for {totalNights} {totalNights === 1 ? 'night' : 'nights'}
              </span>
            </div>
          )}
          <Button 
            className="bg-primary"
            onClick={() => router.push(`/booking/${roomId}`)}
            disabled={!showPriceInfo}
          >
            Reserve
          </Button>
        </div>
      </div>
    </div>
  );
}
