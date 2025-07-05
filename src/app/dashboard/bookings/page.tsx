'use client';

import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { BookingWithRelations } from "@/types/booking";
import Image from "next/image";
import ViewBooking  from "@/components/booking/ViewBooking";
import CancelBooking from "@/components/booking/CancelBooking";
import EditBooking from "@/components/booking/EditBooking";
import ApproveBooking from "@/components/booking/ApproveBooking";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const statusColors = {
  confirmed: "bg-green-500",
  pending: "bg-yellow-500",
  cancelled: "bg-red-500",
};

export default function BookingsPage() {
  const { data: session } = useSession();
  // fetch bookings data from the API
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      // Filter bookings based on the selected status
      const filteredBookings = data.filter((booking: BookingWithRelations) => {
        return statusFilter === "all" || booking.status === statusFilter;
      });
      setBookings(filteredBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }finally {
      setIsFetching(false);
    }
  };

  // call the fetchBookings function when the component mounts
  useEffect(() => {
    fetchBookings();
    setIsLoading(false);
  }, [statusFilter]);


    // Navigate to the booking details page

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Breadcrumb />
          <h1 className="mt-2 text-3xl font-bold">Favorites</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb />
            <h1 className="mt-2 text-3xl font-bold">Bookings</h1>
          </div>

          {/* Actions: Filter + Refresh */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchBookings}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Booking count */}
        <p className="text-sm text-muted-foreground">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}{" "}
          found
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading bookings...</p>
                </TableCell>
              </TableRow>
            )}
            {bookings.length === 0 && !isFetching && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No bookings found.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => (
              <TableRow
                key={booking.id}
                className={`transition duration-300 ${
                  isFetching ? "opacity-50" : ""
                }`}
              >
                <TableCell>
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
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
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium line-clamp-1">
                      {booking.listing.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {booking.listing.description.substring(0, 40)}{" "}
                      {booking.listing.description.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {booking.listing.location?.city},{" "}
                    {booking.listing.location?.country}
                    <br />
                    <span className="text-muted-foreground">
                      {booking.listing.location?.address}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.checkInDate
                    ? new Date(booking.checkInDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>

                <TableCell>
                  {booking.checkInDate
                    ? new Date(booking.checkOutDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>

                <TableCell>
                  <Badge
                    className={`${
                      statusColors[booking.status as keyof typeof statusColors]
                    }`}
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {booking.total} {booking.currency}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ViewBooking booking={booking} />
                    {booking.guestId === session?.user?.id && (
                      <EditBooking booking={booking} />
                    )}
                    {booking.status === "pending" &&
                      booking.guestId === session?.user?.id && (
                        <CancelBooking booking={booking} />
                      )}
                    {booking.status === "pending" &&
                      booking.hostId === session?.user?.id && (
                        <ApproveBooking booking={booking} />
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 