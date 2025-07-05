import { Skeleton } from "@/components/ui/skeleton";

export default function UserSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}
