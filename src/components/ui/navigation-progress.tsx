"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset progress on route change
    setIsLoading(false);
    setProgress(100);

    const timeout = setTimeout(() => {
      setProgress(0);
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);

      // Start fake progress increment
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 15;
          return next >= 90 ? 90 : next;
        });
      }, 200);
    };

    const handleEnd = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    };

    const handleNavigation = () => {
      const html = document.querySelector("html");
      const state = html?.getAttribute("data-nextjs-router-state");

      if (state === "loading") {
        handleStart();

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (
              mutation.attributeName === "data-nextjs-router-state" &&
              html?.getAttribute("data-nextjs-router-state") !== "loading"
            ) {
              observer.disconnect();
              handleEnd();
            }
          }
        });

        if (html) observer.observe(html, { attributes: true });
      }
    };

    document.addEventListener("click", handleNavigation);
    return () => {
      document.removeEventListener("click", handleNavigation);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-opacity duration-300",
        isLoading || progress > 0 ? "opacity-100" : "opacity-0"
      )}
    >
      <Progress
        value={progress}
        className="h-1 w-full rounded-none bg-background/20"
        indicatorClassName="bg-primary transition-all duration-300 ease-in-out"
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
