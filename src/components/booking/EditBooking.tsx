import { BookingWithRelations } from "@/types/booking";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { Pencil } from "lucide-react";

export default function EditBooking({booking}: {booking: BookingWithRelations}) {
    const [editForm, setEditForm] = useState({
      checkInDate: "",
      checkOutDate: "",
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
      specialRequests: "",
      contactPhone: "",
      contactEmail: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form with booking data when booking changes
    useEffect(() => {
      if (booking) {
        setEditForm({
          checkInDate: new Date(booking.checkInDate).toISOString().split("T")[0],
          checkOutDate: new Date(booking.checkOutDate).toISOString().split("T")[0],
          adults: booking.adults,
          children: booking.children,
          infants: booking.infants,
          pets: booking.pets,
          specialRequests: booking.specialRequests || "",
          contactPhone: booking.contactPhone,
          contactEmail: booking.contactEmail,
        });
      }
    }, [booking]);

    if (!booking) return null;

    // Only allow editing for pending or approved bookings
    const canEdit = ["pending", "approved"].includes(booking.status);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (new Date(editForm.checkInDate) >= new Date(editForm.checkOutDate)) {
        newErrors.checkOutDate = "Check-out date must be after check-in date";
      }

      if (new Date(editForm.checkInDate) < new Date()) {
        newErrors.checkInDate = "Check-in date cannot be in the past";
      }

      if (editForm.adults < 1) {
        newErrors.adults = "At least 1 adult is required";
      }

      if (
        !editForm.contactEmail ||
        !/\S+@\S+\.\S+/.test(editForm.contactEmail)
      ) {
        newErrors.contactEmail = "Valid email is required";
      }

      if (!editForm.contactPhone) {
        newErrors.contactPhone = "Phone number is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);

      try {
        // Prepare the update data
        const updateData = {
          ...editForm,
          checkInDate: new Date(editForm.checkInDate).toISOString(),
          checkOutDate: new Date(editForm.checkOutDate).toISOString(),
        };

        // API call to update booking
        const response = await fetch(`/api/bookings/${booking.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update booking");
        }
        toast.success(
          "Booking updated successfully! Host will review the changes."
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update booking. Please try again."
        );
        console.error("Edit booking error:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!canEdit) {
      return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                          <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Edit Booking</DialogTitle>
            <DialogDescription>
              This booking cannot be edited because it is {booking.status}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm text-muted-foreground">
              Only pending or approved bookings can be modified.
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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isSubmitting || !canEdit}>
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Modify your booking details. Changes will require host approval.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[60vh] overflow-y-auto"
        >
          {/* Property Info (Read-only) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Property
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
                  {booking.listing.location?.city},{" "}
                  {booking.listing.location?.country}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Dates
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in</label>
                <input
                  type="date"
                  value={editForm.checkInDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      checkInDate: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-md ${
                    errors.checkInDate ? "border-red-500" : "border-gray-300"
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.checkInDate && (
                  <p className="text-xs text-red-500">{errors.checkInDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out</label>
                <input
                  type="date"
                  value={editForm.checkOutDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      checkOutDate: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-md ${
                    errors.checkOutDate ? "border-red-500" : "border-gray-300"
                  }`}
                  min={editForm.checkInDate}
                />
                {errors.checkOutDate && (
                  <p className="text-xs text-red-500">{errors.checkOutDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Guests
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adults</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.adults}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      adults: parseInt(e.target.value) || 1,
                    }))
                  }
                  className={`w-full p-2 border rounded-md ${
                    errors.adults ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.adults && (
                  <p className="text-xs text-red-500">{errors.adults}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Children</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.children}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      children: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Infants</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.infants}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      infants: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pets</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.pets}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      pets: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-md ${
                    errors.contactEmail ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-500">{errors.contactEmail}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-md ${
                    errors.contactPhone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.contactPhone && (
                  <p className="text-xs text-red-500">{errors.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Special Requests
            </h3>
            <textarea
              value={editForm.specialRequests}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  specialRequests: e.target.value,
                }))
              }
              placeholder="Any special requests or requirements..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    );
} 