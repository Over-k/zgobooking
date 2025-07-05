"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Shield, Bell, CreditCard, Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Personal Info",
    href: "/account/personal-info",
    icon: User,
  },
  {
    title: "Security & Login",
    href: "/account/security",
    icon: Shield,
  },
  {
    title: "Notifications",
    href: "/account/notifications",
    icon: Bell,
  },
  {
    title: "Payment & Payout",
    href: "/account/payments",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-card shadow-md hover:bg-card/90 fixed top-6 left-6 z-10"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Account
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === item.href
                    ? "bg-card text-foreground hover:bg-card/90"
                    : "text-muted-foreground hover:bg-card/50 hover:text-card-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
