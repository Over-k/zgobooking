"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Home,
  PlusCircle,
  BarChart3,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "favorites",
    href: "/dashboard/favorites",
    icon: Heart,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Listings",
    href: "/dashboard/listings",
    icon: Home,
  },
  {
    title: "Add Listing",
    href: "/dashboard/listings/new",
    icon: PlusCircle,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🏠</span>
          <span>Dashboard</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isActive ? "bg-accent" : "transparent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 