"use client";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Listing } from "@/types/listing";
import { Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function ListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    const fetchListings = async () => {
      try {
        const response = await fetch(`/api/listings/host`);
        if (response.ok) {
          const data = await response.json();
          setListings(data);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [session, status, router, deleting]);
  const confirmDelete = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true)
  }
  const handleDeleteListing = async (listingId: string) => {
    setDeleting(listingId);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: listingId }),
      });
      if (!response.ok) throw new Error("Failed to delete Listing");
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting Listing:", error);
      toast.error("Failed to delete Listing");
    } finally {
      setDeleting(null);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
      </div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb />
          <h1 className="mt-2 text-3xl font-bold">Listings</h1>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing: any) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    {listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
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
                    <p className="font-medium line-clamp-1">{listing.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {listing.price} {listing.currency}/night
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      listing.status.toLowerCase() === "active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  >
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/rooms/${listing.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(listing.id)}
                      disabled={deleting === listing.id}
                    >
                      {deleting === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              listing file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                listingToDelete && handleDeleteListing(listingToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}