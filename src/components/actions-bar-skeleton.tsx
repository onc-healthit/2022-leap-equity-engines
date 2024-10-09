import { Skeleton } from "@healthlab/ui";

export default function ActionsBarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <Skeleton className="h-8 w-full sm:w-[600px]" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
