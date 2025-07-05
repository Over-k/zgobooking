// src/components/room/MeetYourHost.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Prisma } from "@prisma/client";
import { ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface MeetYourHostProps {
  room: Prisma.ListingGetPayload<{
    include: {
      host: {
        include: {
          hostInfo: true;
        };
      };
    };
  }>;
}

export default function MeetYourHost({ room }: MeetYourHostProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-medium mb-6">Meet your host</h2>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="shadow-md rounded-lg p-6 text-center w-80 bg-card">
            {/* Host Image */}
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
              {room.host.profileImage ? (
                <Image
                  src={room.host.profileImage}
                  alt={room.host.firstName + " " + room.host.lastName || "Host"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-muted h-full w-full flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Host Name */}
            <h3 className="text-2xl font-bold mb-1">{room.host.firstName} {room.host.lastName}</h3>

            {/* Superhost */}
            {room.host.hostInfo?.superhost && (
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm mb-6">
                <ShieldCheck className="h-4 w-4" /> Superhost
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-around items-center border-t border-border pt-4 mb-6">
              <div>
                <p className="text-xl font-semibold">{room.host.hostInfo?.totalReviews || 0}</p>
                <p className="text-muted-foreground text-xs">Reviews</p>
              </div>
              <div className="h-8 w-px bg-border"></div>{" "}
              {/* Vertical divider */}
              <div>
                <p className="text-xl font-semibold">
                  {room.host.hostInfo?.averageRating?.toFixed(2) || "0.00"}★
                </p>
                <p className="text-muted-foreground text-xs">Rating</p>
              </div>
              <div className="h-8 w-px bg-border"></div>{" "}
              {/* Vertical divider */}
              <div>
                <p className="text-xl font-semibold">{new Date(room.host.hostInfo?.hostSince || new Date()).getFullYear() || 0}</p>
                <p className="text-muted-foreground text-xs">Years hosting</p>
              </div>
            </div>

            {/* Message Button */}
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push(`/users/show/${room.hostId}`)}
            >
              Message host
            </Button>
          </div>
        </div>

        <div className="flex-grow">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {room.host.firstName} {room.host.lastName} is a Superhost
            </h3>
            <p className="text-foreground">
              Superhosts are experienced, highly rated hosts who are committed
              to providing great stays for guests.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Host details</h3>
            <p>Response rate: {room.host.hostInfo?.responseRate || 0}%</p>
            <p>Responds within {room.host.hostInfo?.responseTime || "a day"}</p>
          </div>

          {room.host.bio && (
            <div className="mb-4">
              <p className="text-foreground">{room.host.bio}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              variant="ghost"
              className="text-foreground underline pl-0 hover:bg-transparent hover:text-primary"
              onClick={() => router.push(`/users/show/${room.hostId}`)}
            >
              Show more
            </Button>
          </div>
        </div>
      </div>
      <Separator className="my-8" />
    </div>
  );
}