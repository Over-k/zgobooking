"use client";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { SearchProvider } from "@/context/SearchContext";
import { BookingProvider } from "@/context/BookingContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProgress />
          <SearchProvider>
            <BookingProvider>{children}</BookingProvider>
          </SearchProvider>
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </Suspense>
  );
}
