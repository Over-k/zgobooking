"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Account</h2>
        </div>
        <nav className="mt-8 flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                pathname === item.href
                  ? "bg-card text-foreground hover:bg-card/90"
                  : "text-muted-foreground hover:bg-card/50 hover:text-card-foreground",
              )}
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
