"use client";

import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2, Eye, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

// Use Prisma generated types
type FavoriteWithListing = Prisma.FavoriteGetPayload<{
  include: {
    listing: {
      include: {
        images: true;
        location: true;
        host: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            profileImage: true;
          };
        };
      };
    };
  };
}>;

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch favorites from API
  const fetchFavorites = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/favorites?page=${page}&limit=10`);

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();

      if (data.success) {
        setFavorites(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (listingId: string) => {
    try {
      setToggleLoading(listingId);

      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update favorite");
      }

      if (data.success) {
        if (data.action === "removed") {
          // Remove from favorites list
          setFavorites((prev) =>
            prev.filter((fav) => fav.listing.id !== listingId)
          );
          toast.success("Removed from favorites");
        } else {
          toast.success("Added to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    } finally {
      setToggleLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Load favorites on component mount
  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Breadcrumb />
          <h1 className="mt-2 text-3xl font-bold">Favorites</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="mt-2 text-3xl font-bold">Favorites</h1>
        {pagination && (
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.totalCount} favorite
            {pagination.totalCount !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {favorites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-2">
                    <Heart className="h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No favorites yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start exploring and save your favorite listings
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              favorites.map((favorite) => (
                <TableRow key={favorite.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      {favorite.listing.images.length > 0 ? (
                        <Image
                          src={favorite.listing.images[0].url}
                          alt={favorite.listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">
                        {favorite.listing.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {favorite.listing.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {favorite.listing.location?.city},{" "}
                      {favorite.listing.location?.country}
                      <br />
                      <span className="text-muted-foreground">
                        {favorite.listing.location?.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {favorite.listing.host.profileImage ? (
                        <Image
                          src={favorite.listing.host.profileImage}
                          alt={`${favorite.listing.host.firstName} ${favorite.listing.host.lastName}`}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {favorite.listing.host.firstName[0]}
                            {favorite.listing.host.lastName[0]}
                          </span>
                        </div>
                      )}
                      <span className="text-sm">
                        {favorite.listing.host.firstName}{" "}
                        {favorite.listing.host.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(favorite.listing.status)}>
                      {favorite.listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(favorite.listing.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /night
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/rooms/${favorite.listing.id}`}>
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(favorite.listing.id)}
                        disabled={toggleLoading === favorite.listing.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {toggleLoading === favorite.listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4 fill-current" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}{" "}
            of {pagination.totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
