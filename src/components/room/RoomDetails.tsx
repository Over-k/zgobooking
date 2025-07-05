"use client";
import Image from "next/image";
import { User, Medal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";

interface RoomDetailsProps {
  room: Prisma.ListingGetPayload<{
    include: {
      host: {
        include: {
          hostInfo: true,
        };
      };
      location: true;
    };
  }>;
}

export default function RoomDetails({ room }: RoomDetailsProps) {
  const router = useRouter();
  return (
    <div className="mb-8">
      <div className="flex justify-between flex-col md:flex-row">
        <div className="mb-6 md:mb-0 md:pr-12 md:w-2/3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {room.host.hostInfo?.superhost ? "Superhost" : "Hosted"} by <p className="inline font-bold underline hover:cursor-pointer" onClick={() => router.push(`/users/show/${room.hostId}`)}> {room.host.firstName} {room.host.lastName}</p>
              </h2>
              <p className="text-muted-foreground">
                {room.maxAdults + room.maxChildren + room.maxInfants} guests ·{" "}
                {room.beds} bed{room.beds !== 1 ? "s" : ""} · {room.bathrooms}{" "}
                bath{room.bathrooms !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              {room.host.profileImage ? (
                <Image
                  src={room.host.profileImage}
                  alt={room.host.firstName + " " + room.host.lastName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-muted h-full w-full flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {room.host.hostInfo?.superhost && (
            <div className="flex items-start mb-6">
              <Medal className="h-8 w-8 mr-4 mt-1" />
              <div>
                <h3 className="font-bold">{room.host.firstName} {room.host.lastName} is a Superhost</h3>
                <p className="text-muted-foreground">
                  Superhosts are experienced, highly rated hosts who are
                  committed to providing great stays for guests.
                </p>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="mb-6">
            <h3 className="font-bold mb-2">About this place</h3>
            <p className="text-foreground whitespace-pre-line">
              {room.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
