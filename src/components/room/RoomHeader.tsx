'use client'
import { Star, Share, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RoomHeaderProps {
  room: {
    location: {
      city: string;
      country: string;
    } | null;
    rating: number;
    reviewsCount: number;
    title?: string;
    id: string;
  };
}

export default function RoomHeader({ room }: RoomHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [isLodingFavorites, setIsLodingFavorites] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the listing is in favorites on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const { data } = await response.json();
          const isFavorite = data.some((fav: any) => fav.listingId === room.id);
          setSaved(isFavorite);
          setIsLodingFavorites(false);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [session?.user, room.id]);

  // Handle share button
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText('');
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link!");
    }
  };

  // Handle save button
  const handleSave = async () => {
    setIsLodingFavorites(true);
    if (!session?.user) {
      toast.error("Please sign in to save listings");
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: room.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSaved(data.action === 'added');
        setIsLodingFavorites(false);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to update favorite status');
      }
    } catch (error) {
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">{room.title || room.location?.city}</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2 flex-wrap text-sm">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 font-medium">{room.rating.toFixed(2)}</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="underline font-medium">
            {room.reviewsCount ?? 0} reviews
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium">
            {room.location?.city}, {room.location?.country}
          </span>
        </div>

        <div className="flex mt-2 md:mt-0 space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-md flex items-center">
                <Share className="h-4 w-4 mr-1" />Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share link</DialogTitle>
                <DialogDescription>
                  Anyone who has this link will be able to view this.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    Link
                  </Label>
                  <Input
                    id="link"
                    defaultValue={`${process.env.NEXT_PUBLIC_APP_URL}/rooms/${room.id}`}
                    readOnly
                  />
                </div>
                <Button type="submit" size="sm" className="px-3" onClick={handleShare}>
                  <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {isLodingFavorites ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-md flex items-center"
            disabled={true}
          >
            <Heart className={`h-4 w-4 mr-1`} />
            <span>Loading...</span>
          </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md flex items-center"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 mr-1 ${saved ? "fill-red-500" : "fill-none"}`} />
              <span>{saved ? "Saved" : "Save"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
