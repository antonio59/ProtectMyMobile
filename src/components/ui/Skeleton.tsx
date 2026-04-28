import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200",
        className
      )}
    />
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      
      <Skeleton className="h-[300px] sm:h-[350px] rounded-xl" />
    </div>
  );
}


