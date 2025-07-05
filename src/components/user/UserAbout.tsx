// src/components/user/UserAbout.tsx
import { User, HostInfo } from "@prisma/client";
import { MessageSquare, Star, Globe, Briefcase } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserAboutProps {
  user: User & { hostInfo: HostInfo | null };
}

export default function UserAbout({ user }: UserAboutProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">About</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {user.hostInfo?.hostSince && (
          <div className="flex items-start">
            <div className="mt-1 mr-3">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Hosting since {user.hostInfo?.hostSince.toLocaleDateString()}</p>
              {user.hostInfo?.superhost && (
                <p className="text-muted-foreground">Superhost status earned</p>
              )}
            </div>
          </div>
        )}

        {user.hostInfo?.responseRate && (
          <div className="flex items-start">
            <div className="mt-1 mr-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{user.hostInfo?.responseRate}% response rate</p>
              {user.hostInfo?.responseTime && (
                <p className="text-muted-foreground">Responds in {user.hostInfo?.responseTime}</p>
              )}
            </div>
          </div>
        )}

        {user.hostInfo?.languages && user.hostInfo?.languages.length > 0 && (
          <div className="flex items-start">
            <div className="mt-1 mr-3">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Languages</p>
              <p className="text-muted-foreground">{user.hostInfo?.languages.join(", ")}</p>
            </div>
          </div>
        )}

        {user.hostInfo?.averageRating && (
          <div className="flex items-start">
            <div className="mt-1 mr-3">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Work</p>
              <p className="text-muted-foreground">{user.hostInfo?.averageRating}</p>
            </div>
          </div>
        )}
      </div>

      {user.bio && (
        <div className="mb-6">
          <p className="whitespace-pre-line text-foreground">{user.bio}</p>
        </div>
      )}

      <Separator className="my-8" />
    </div>
  );
}
