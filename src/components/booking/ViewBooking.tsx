import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {BookingWithRelations} from '@/types/booking';
export default function ViewBooking({booking}: {booking: BookingWithRelations}) {
        if (!booking) return;
        const getStatusColor = (status: string) => {
          switch (status) {
            case "approved":
              return "text-green-600 bg-green-50";
            case "pending":
              return "text-yellow-600 bg-yellow-50";
            case "declined":
              return "text-red-600 bg-red-50";
            case "cancelled":
              return "text-gray-600 bg-gray-50";
            case "completed":
              return "text-blue-600 bg-blue-50";
            default:
              return "text-gray-600 bg-gray-50";
          }
        };
    
        const getPaymentStatusColor = (status: string) => {
          switch (status) {
            case "paid":
              return "text-green-600 bg-green-50";
            case "pending":
              return "text-yellow-600 bg-yellow-50";
            case "refunded":
              return "text-blue-600 bg-blue-50";
            case "partially_refunded":
              return "text-orange-600 bg-orange-50";
            default:
              return "text-gray-600 bg-gray-50";
          }
        };
    
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon">
                  <Eye className="h-4 w-4" />
              </Button>
              </DialogTrigger>
              <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </DialogTitle>
              <DialogDescription>Booking ID: {booking.id}</DialogDescription>
            </DialogHeader>
    
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Property Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Property
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.listing.images.length > 0 ? (
                      <Image
                        src={booking.listing.images[0].url}
                        alt={booking.listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">
                      {booking.listing.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {booking.listing.location?.city},{" "}
                      {booking.listing.location?.country}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>
                        Host: {booking.host.firstName} {booking.host.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Stay Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Stay Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    <strong>{booking.nights}</strong> night
                    {booking.nights !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
    
              {/* Guest Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Guests
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Adults:</span>
                    <span className="font-medium">{booking.adults}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Children:</span>
                    <span className="font-medium">{booking.children}</span>
                  </div>
                  {booking.infants > 0 && (
                    <div className="flex justify-between">
                      <span>Infants:</span>
                      <span className="font-medium">{booking.infants}</span>
                    </div>
                  )}
                  {booking.pets > 0 && (
                    <div className="flex justify-between">
                      <span>Pets:</span>
                      <span className="font-medium">{booking.pets}</span>
                    </div>
                  )}
                </div>
              </div>
    
              {/* Pricing Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Pricing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      ${booking.nightlyRate.toFixed(2)} × {booking.nights} night
                      {booking.nights !== 1 ? "s" : ""}
                    </span>
                    <span>
                      ${(booking.nightlyRate * booking.nights).toFixed(2)}
                    </span>
                  </div>
                  {booking.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>${booking.cleaningFee.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.serviceFee > 0 && (
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>${booking.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.taxes > 0 && (
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>${booking.taxes.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total ({booking.currency})</span>
                    <span>${booking.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
    
              {/* Payment Status */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Payment
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Status:</span>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                      booking.paymentStatus
                    )}`}
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() +
                      booking.paymentStatus.slice(1).replace("_", " ")}
                  </div>
                </div>
                {booking.refundAmount && booking.refundAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Refund Amount:</span>
                    <span className="font-medium">
                      ${booking.refundAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
    
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <a
                      href={`mailto:${booking.contactEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <a
                      href={`tel:${booking.contactPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.contactPhone}
                    </a>
                  </div>
                </div>
              </div>
    
              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Special Requests
                  </h3>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
    
              {/* Cancellation Details */}
              {booking.status === "cancelled" && booking.cancelledAt && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Cancellation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cancelled by:</span>
                      <span className="font-medium capitalize">
                        {booking.cancelledBy}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled on:</span>
                      <span className="font-medium">
                        {new Date(booking.cancelledAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {booking.cancellationReason && (
                      <div className="space-y-1">
                        <span className="font-medium">Reason:</span>
                        <p className="bg-muted p-2 rounded text-xs">
                          {booking.cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
    
              {/* Booking Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Timeline
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Booked:</span>
                    <span>
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>
                      {new Date(booking.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
    
              {/* Review Status */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Review
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span>Review status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.hasReviewed
                        ? "text-green-600 bg-green-50"
                        : "text-gray-600 bg-gray-50"
                    }`}
                  >
                    {booking.hasReviewed ? "Reviewed" : "Not reviewed"}
                  </span>
                </div>
              </div>
            </div>
    
            <DialogFooter className="flex gap-2">
              {booking.messageThread && (
                <Button variant="outline" size="sm" onClick={() => {
                  window.location.href = `/messages/${booking.messageThread?.id} `;
                }}>
                  View Messages
                </Button>
              )}
              {booking.status === "completed" && !booking.hasReviewed && (
                <Button variant="outline" size="sm">
                  Write Review
                </Button>
              )}
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
                                </DialogContent>
                    </Dialog>
        );
    };