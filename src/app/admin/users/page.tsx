"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  MoreVertical,
  Search,
  Filter,
  Users,
  Shield,
  Home,
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  Eye,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage: string;
  bio?: string;
  city?: string;
  country?: string;
  joinDate: Date;
  dateOfBirth?: Date;
  isHost: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  governmentIdVerified: boolean;
  identityVerified: boolean;
}

type UserRole = "all" | "admin" | "host" | "user";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(
        `User ${isActive ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent.trim(),
          recipientId: selectedUser.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully");
      setMessageContent("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const getUserRole = (user: User) => {
    if (user.isAdmin) return "admin";
    if (user.isHost) return "host";
    return "user";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" || getUserRole(user) === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "host":
        return <Home className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "host":
        return "default";
      default:
        return "secondary";
    }
  };

  const getVerificationScore = (user: User) => {
    const verifications = [
      user.emailVerified,
      user.phoneVerified,
      user.governmentIdVerified,
      user.identityVerified,
    ];
    return verifications.filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor user accounts ({filteredUsers.length} of{" "}
            {users.length} users)
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value: UserRole) => setRoleFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </div>
            </SelectItem>
            <SelectItem value="host">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Host
              </div>
            </SelectItem>
            <SelectItem value="user">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                User
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">Avatar</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const role = getUserRole(user);
                const verificationScore = getVerificationScore(user);

                return (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Avatar className="relative">
                        <AvatarImage
                          src={user.profileImage || "/default-avatar.png"}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <AvatarFallback className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.city && user.country && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {user.city}, {user.country}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getRoleBadgeVariant(role)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getRoleIcon(role)}
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {user.isActive ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              verificationScore === 4
                                ? "bg-green-500"
                                : verificationScore >= 2
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {verificationScore}/4
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(user.joinDate), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setMessageContent("");
                              setIsDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(
                                user.id,
                                user.isAdmin ? "USER" : "ADMIN"
                              )
                            }
                          >
                            {user.isAdmin ? (
                              <>
                                <ShieldX className="h-4 w-4 mr-2 text-red-500" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(user.id, !user.isActive)
                            }
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2 text-red-500" />
                                Deactivate User
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Complete user information and verification status
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage
                    src={selectedUser.profileImage || "/default-avatar.png"}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <AvatarFallback className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
                    {selectedUser.firstName.charAt(0)}
                    {selectedUser.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <Badge
                    variant={getRoleBadgeVariant(getUserRole(selectedUser))}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getRoleIcon(getUserRole(selectedUser))}
                    {getUserRole(selectedUser).charAt(0).toUpperCase() +
                      getUserRole(selectedUser).slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Contact Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.city && selectedUser.country && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedUser.city}, {selectedUser.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Account Status
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Account Status</span>
                        <Badge
                          variant={
                            selectedUser.isActive ? "default" : "destructive"
                          }
                        >
                          {selectedUser.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Verification Score</span>
                        <span className="text-sm font-medium">
                          {getVerificationScore(selectedUser)}/4
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Verification Status
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Verified</span>
                        {selectedUser.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Phone Verified</span>
                        {selectedUser.phoneVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Government ID</span>
                        {selectedUser.governmentIdVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Identity Verified</span>
                        {selectedUser.identityVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Account Details
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Joined</span>
                        <span className="text-sm">
                          {format(
                            new Date(selectedUser.joinDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                      {selectedUser.dateOfBirth && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Date of Birth</span>
                          <span className="text-sm">
                            {format(
                              new Date(selectedUser.dateOfBirth),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Biography
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Message Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Send Message
                </h4>
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder={`Send a message to ${selectedUser.firstName}...`}
                      className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                      disabled={sendingMessage}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {messageContent.length}/500
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sendingMessage}
                    className="w-full"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
