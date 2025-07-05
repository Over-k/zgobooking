// src/components/user/UserHeader.tsx
import { User, HostInfo } from "@prisma/client";
import Image from "next/image";
import { Calendar, MapPin, Flag, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserHeaderProps {
  user: User & { hostInfo: HostInfo | null };
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
      <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={user.profileImage || "/api/placeholder/128/128"}
          alt={user.firstName}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="flex-grow">
        <h1 className="text-3xl font-bold mb-2">Hi, I am {user.firstName} {user.lastName}</h1>

        <div className="flex flex-col md:flex-row md:items-center gap-y-2 md:gap-x-4 text-muted-foreground mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Joined in {user.joinDate.toLocaleDateString()}</span>
          </div>

            {user.city && user.country && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{user.city}, {user.country}</span>
            </div>
          )}
        </div>

        {user.hostInfo?.superhost && (
          <div className="flex items-center mb-3">
            <Medal className="h-5 w-5 mr-2" />
            <span className="font-medium">Superhost</span>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Flag className="h-4 w-4" />
            <span>Report this profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
