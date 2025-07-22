import { BookingWithRelations } from "@/types/booking"
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
    Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

export default function CancelBooking({booking}: {booking: BookingWithRelations}) {
    const [cancellationReason, setCancellationReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [canceled, setCanceled] = useState(false);
    const [isCancelLoading, setIsCancelLoading] = useState<string | null>(null);
    
    if (!booking) return null;
    
    const canCancel = ["pending", "approved", "completed"].includes(booking.status);

    const calculateRefund = () => {
      const now = new Date();
      const checkInDate = new Date(booking.checkInDate);
      const daysUntilCheckIn = Math.ceil(
        (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Refund policy logic
      if (daysUntilCheckIn >= 14) {
        return booking.total; // Full refund
      } else if (daysUntilCheckIn >= 7) {
        return booking.total * 0.5; // 50% refund
      } else if (daysUntilCheckIn >= 1) {
        return booking.total * 0.1; // 10% refund
      } else {
        return 0; // No refund
      }
    };

    const refundAmount = calculateRefund();
    const refundPercentage = ((refundAmount / booking.total) * 100).toFixed(0);

    const handleConfirmCancel = async () => {
      setIsSubmitting(true);

      try {
        // API call to cancel booking
        const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cancellationReason: cancellationReason || "No reason provided",
            refundAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to cancel booking");
        }
        const result = await response.json();
        toast.success(result.message);
         setShowConfirmation(false);
         setCanceled(true);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to cancel booking. Please try again."
        );
        console.error("Cancel booking error:", error);
      } finally {
        setIsSubmitting(false);
      }
    };
    
        if (!canCancel) {
          return (
                <Dialog >
                    <DialogTrigger asChild>
                        <Button
                        variant="outline"
                        size="sm"
                        disabled={isCancelLoading === booking.listing.id || !canCancel}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                        {isCancelLoading === booking.listing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4 fill-current" />
                        )}
                        Cancel Booking
                        </Button>
                    </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cannot Cancel Booking</DialogTitle>
                <DialogDescription>
                  This booking cannot be cancelled because it is {booking.status}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <p className="text-sm text-muted-foreground">
                  Only pending or approved bookings can be cancelled.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
                                  </DialogContent>
                    </Dialog>
          );
        }
    
        if (!showConfirmation) {
          return (
                  <Dialog >
                      <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCancelLoading === booking.listing.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isCancelLoading === booking.listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 fill-current" />
                      )}
                      Cancel Booking
                    </Button>
                      </DialogTrigger>
                      <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogDescription>
                  Please review the cancellation details below.
                </DialogDescription>
              </DialogHeader>
    
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Booking Details
                  </h3>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      {booking.listing.images.length > 0 ? (
                        <Image
                          src={booking.listing.images[0].url}
                          alt={booking.listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{booking.listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.checkInDate).toLocaleDateString()} -{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: ${booking.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
    
                {/* Refund Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Refund Information
                  </h3>
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Original Payment:</span>
                      <span className="font-medium">
                        ${booking.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Refund Amount:</span>
                      <span
                        className={`font-medium ${
                          refundAmount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${refundAmount.toFixed(2)} ({refundPercentage}%)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const daysUntilCheckIn = Math.ceil(
                          (new Date(booking.checkInDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        if (daysUntilCheckIn >= 14) {
                          return "Full refund available (14+ days before check-in)";
                        } else if (daysUntilCheckIn >= 7) {
                          return "50% refund available (7-13 days before check-in)";
                        } else if (daysUntilCheckIn >= 1) {
                          return "Only fees refunded (less than 7 days before check-in)";
                        } else {
                          return "No refund available (check-in date has passed)";
                        }
                      })()}
                    </div>
                  </div>
                </div>
    
                {/* Cancellation Reason */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Reason for Cancellation
                  </h3>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
                    placeholder="Please let us know why you're cancelling (optional)"
                  />
                </div>
    
                {/* Warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Important:</p>
                      <p className="text-amber-700 mt-1">
                        This action cannot be undone. The host will be notified
                        immediately, and refunds will be processed according to the
                        cancellation policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
    
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting}>
                    Keep Booking
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => setShowConfirmation(true)}
                  disabled={isSubmitting}
                >
                  Continue Cancellation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          );
        }
    
        // Confirmation step
        if(showConfirmation && !canceled){
          return (
                              <Dialog >
                      <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCancelLoading === booking.listing.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isCancelLoading === booking.listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 fill-current" />
                      )}
                      Cancel Booking
                    </Button>
                      </DialogTrigger>
                      <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Confirm Cancellation
              </DialogTitle>
              <DialogDescription>
                Are you absolutely sure you want to cancel this booking?
              </DialogDescription>
            </DialogHeader>
    
            <div className="py-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Final confirmation:</strong> You are about to cancel your
                  booking and
                  {refundAmount > 0
                    ? ` receive a refund of $${refundAmount.toFixed(2)}.`
                    : " you will not receive any refund."}
                </p>
              </div>
            </div>
    
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Go Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Cancelling..." : "Yes, Cancel Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  );}
};
