import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-3/4 mb-4" />
      <Skeleton className="h-20 w-full mb-8" />
      <Skeleton className="h-60 w-full mb-8" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
} 