'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingWithRelations } from "@/types/booking";

export function RecentBookings() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if ((bookings || []).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={booking.listing.images[0].url}
                alt={`${booking.listing.title}`}
              />
              <AvatarFallback>
                {booking.host.firstName[0]}
                {booking.host.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">
                  {booking.listing.title}
                </h3>
                <Badge
                  variant={
                    booking.status === 'approved'
                      ? 'default'
                      : booking.status === 'pending'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {booking.status}
                </Badge>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {format(new Date(booking.checkInDate), 'MMM dd')} -{' '}
                    {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>
                    {booking.total.toLocaleString()} {booking.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 