import { User } from "@prisma/client";
import {
  BadgeCheck,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IdentityBadgeProps {
  user: User
}

export default function IdentityBadge({ user }: IdentityBadgeProps) {
  const verifiedCount =
    Object.values(user.identityVerified).filter(Boolean).length;

  const iconColor = (isVerified: boolean) =>
    isVerified ? "text-green-500" : "text-muted-foreground";

  const labelColor = (isVerified: boolean) =>
    isVerified ? "text-foreground" : "text-muted-foreground";

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BadgeCheck className="h-5 w-5 mr-2 text-green-500" />
          Identity verification
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center">
            <Mail className={`h-5 w-5 mr-3 ${iconColor(user.emailVerified)}`} />
            <span className={labelColor(user.emailVerified)}>
              Email address
              {user.emailVerified && (
                <span className="text-green-500 ml-2">Verified</span>
              )}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center">
            <Phone className={`h-5 w-5 mr-3 ${iconColor(user.phoneVerified)}`} />
            <span className={labelColor(user.phoneVerified)}>
              Phone number
              {user.phoneVerified && (
                <span className="text-green-500 ml-2">Verified</span>
              )}
            </span>
          </div>

          {/* Government ID */}
          <div className="flex items-center">
            <ShieldCheck
              className={`h-5 w-5 mr-3 ${iconColor(
                user.governmentIdVerified
              )}`}
            />
            <span
              className={labelColor(user.governmentIdVerified)}
            >
              Government ID
              {user.governmentIdVerified && (
                <span className="text-green-500 ml-2">Verified</span>
              )}
            </span>
          </div>

          {/* Identity */}
          <div className="flex items-center">
            <UserCheck
              className={`h-5 w-5 mr-3 ${iconColor(
                Boolean(user.identityVerified)
              )}`}
            />
            <span className={labelColor(Boolean(user.identityVerified))}>
              Identity
              {user.identityVerified && (
                <span className="text-green-500 ml-2">Verified</span>
              )}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {verifiedCount > 0
            ? `${user.firstName} has confirmed ${verifiedCount} identity verification method${
                verifiedCount !== 1 ? "s" : ""
              }`
            : `${user.firstName} hasn't confirmed any identity verification methods yet`}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Learn more about{" "}
          <span className="underline cursor-pointer">
            identity verification on Airbnb
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
