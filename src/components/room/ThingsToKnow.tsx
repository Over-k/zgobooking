"use client";

import { Prisma } from "@prisma/client";
import { Clock, ShieldCheck, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ThingsToKnowProps {
  room: Prisma.ListingGetPayload<{
    include: {
      houseRules: true;
      cancellationPolicy: true;
      safetyFeatures: true;
    };
  }>;
}

export default function ThingsToKnow({ room }: ThingsToKnowProps) {
  const { houseRules = [] } = room;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-6">Things to know</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        {/* House rules */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            House rules
          </h3>
          <ul className="space-y-3 text-foreground">
            {houseRules.slice(0, 5).map((rule, index) => (
              <li key={index}>{rule.rule}</li>
            ))}
          </ul>
        </div>

        {/* Safety & property */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2" />
            Safety & property
          </h3>
          <ul className="space-y-3 text-foreground">
            {(room.safetyFeatures ?? []).map((safetyItem, index) => (
              <li key={index}>{safetyItem.feature}</li>
            ))}
          </ul>
        </div>

        {/* Cancellation policy */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            Cancellation policy
          </h3>
          <div className="space-y-3 text-foreground">
            {room.cancellationPolicy && <p>{room.cancellationPolicy.description}.</p>}
          </div>
        </div>
      </div>

      <Separator className="my-8" />
    </div>
  );
}
