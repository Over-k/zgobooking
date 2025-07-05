"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {Button} from "@/components/ui/button";
import Heading from "@/components/Heading";

type Props = {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
};

function EmptyState({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  showReset,
}: Props) {
  const router = useRouter();

  return (
    <div className="h-[60vh] flex flex-col gap-2 justify-center items-center"
    >
      <Heading center title={title} subtitle={subtitle} />
      <div className="w-48 mt-4">
        {showReset && (
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          />
        )}
      </div>
    </div>
  );
}

export default EmptyState;
