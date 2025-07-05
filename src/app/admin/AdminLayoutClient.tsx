'use client';

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  User,
  LogOut,
  Shield,
  Activity,
  Archive,
  FileBarChart,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
export default function AdminLayoutClient({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats: {
    currentUser: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string;
    } | null;
    totalUsers: number;
    totalHostRequests: number;
    totalNotifications: number;
  };
}) {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      badge: stats.totalUsers.toString(),
    },
    {
      title: "Host Requests",
      href: "/admin/host-requests",
      icon: FileText,
      badge: stats.totalHostRequests.toString(),
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: FileBarChart,
      badge: null,
    },
    {
      title: "System",
      href: "/admin/system",
      icon: Settings,
      badge: null,
      children: [
        {
          title: "Status",
          href: "/admin/system/status",
          icon: Activity,
        },
        {
          title: "Backups",
          href: "/admin/system/backups",
          icon: Archive,
        },
        {
          title: "Logs",
          href: "/admin/system/logs",
          icon: FileText,
        },
        {
          title: "Security",
          href: "/admin/system/security",
          icon: Shield,
        },
      ],
    },
  ];
  const pathname = usePathname();
  const route = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "system",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(stats.totalNotifications || 0);

  // Auto-expand parent sections based on current path
  useEffect(() => {
    sidebarItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.href
        );
        if (hasActiveChild && !expandedSections.includes(item.href)) {
          setExpandedSections((prev) => [...prev, item.href]);
        }
      }
    });
  }, [pathname, expandedSections, sidebarItems]);

  const toggleSection = (href: string) => {
    setExpandedSections((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const filteredItems = sidebarItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.children &&
        item.children.some((child) =>
          child.title.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-64";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="shadow-lg"
        >
          {isSidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarWidth,
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-primary">
          {!isSidebarCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="ml-3 text-lg font-bold text-primary-foreground">
                Admin Panel
              </h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isSidebarCollapsed ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4">
            {/* Search */}
            {!isSidebarCollapsed && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredItems.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleSection(item.href)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground group",
                          expandedSections.includes(item.href) &&
                            "bg-accent text-accent-foreground"
                        )}
                        title={isSidebarCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          {!isSidebarCollapsed && (
                            <span className="ml-3 text-foreground">
                              {item.title}
                            </span>
                          )}
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex items-center">
                            {expandedSections.includes(item.href) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </button>
                      {expandedSections.includes(item.href) &&
                        !isSidebarCollapsed && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground group",
                                  pathname === child.href &&
                                    "bg-accent text-accent-foreground"
                                )}
                              >
                                {child.icon && (
                                  <child.icon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                )}
                                <span className="text-muted-foreground group-hover:text-foreground">
                                  {child.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground group",
                        pathname === item.href &&
                          "bg-accent text-accent-foreground"
                      )}
                      title={isSidebarCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        {!isSidebarCollapsed && (
                          <span className="ml-3 text-foreground">
                            {item.title}
                          </span>
                        )}
                      </div>
                      {!isSidebarCollapsed && item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* User Card at Bottom */}
        {!isSidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {stats?.currentUser?.firstName}{" "}
                  {stats?.currentUser?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {stats?.currentUser?.email}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-foreground">
                {pathname === "/admin"
                  ? "Dashboard"
                  : pathname
                      .split("/")
                      .pop()
                      ?.replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative"
                onClick={() => route.push('/notifications')}>
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {stats?.currentUser?.firstName}{" "}
                        {stats?.currentUser?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {stats?.currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => route.push('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => route.push('/account/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                   onClick={() =>
                                signOut({
                                  callbackUrl: "/",
                                })
                              }>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto p-6">
          <div className="bg-card rounded-xl shadow-sm border min-h-[calc(100vh-10rem)]">
            <div className="p-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
