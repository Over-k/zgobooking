"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlignJustify, LogOut, User as UserIcon, Bell, MessageCircle, LayoutDashboard, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserSkeleton from "./UserSkeleton";
import { AuthModel } from "@/lib/models/auth";
import { ModeToggle } from "@/components/modeToggle";
import { useEffect, useState } from "react";
import { User, Notification, Message } from "@prisma/client";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User & { notifications: Notification[], messagesReceived: Message[] } | null>(null);
  const handleNavigate = (path: string) => {
    router.push(path);
  };
  //fetch user info 
  const userDate = async ()=>{
    const response = await fetch("/api/account/profile");
    const data = await response.json();
    setUser(data);
    return data;
  }
useEffect(() => {
  userDate();
}, []); 
const userMenuItems = [
    {
        label: "Account",
        icon: UserIcon,
        path: "/account",
    },
    {
        label: "Notifications",
        icon: Bell,
        path: "/notifications",
        badgeCount: user?.notifications?.filter(notification => !notification.isRead).length || null,
    },
    {
        label: "Messages",
        icon: MessageCircle,
        path: "/messages",
        badgeCount: user?.messagesReceived?.filter(message => !message.isRead).length || null,
    },
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
    },
];

  if (status === "loading") {
    return <UserSkeleton />;
  }

  if (!session) {
    return (
      <div className="flex gap-3 p-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
          onClick={() => router.push(AuthModel.getPath("signin"))}
        >
          <span className="hidden sm:inline">Sign in</span>
          <span className="sm:hidden">Login</span>
        </Button>
        <Button
          variant="default"
          className="flex items-center gap-2 shadow-sm hover:shadow transition-shadow"
          onClick={() => router.push(AuthModel.getPath("signup"))}
        >
          Sign up
        </Button>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" aria-label="User Menu">
            <AlignJustify className="h-4 w-4 mr-2" aria-hidden="true" />
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.profileImage || session.user.image?.toString()}
                alt="User Avatar"
              />
              <AvatarFallback>
                {user?.firstName.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {user?.firstName + " " + user?.lastName || "Guest"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {user?.isAdmin && (
            <>
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {userMenuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <DropdownMenuItem
                key={index}
                onClick={() => handleNavigate(item.path)}
                className={isActive ? "bg-muted" : ""}
              >
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="flex items-center">
                  {item.label}
                  {item.badgeCount && item.badgeCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {item.badgeCount}
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />

          <ThemeToggle />

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
