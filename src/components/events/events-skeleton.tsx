"use client";

import { useSearchContext } from "../providers/search-provider";
import { Card, CardContent, CardHeader } from "@healthlab/ui";
import { Skeleton } from "@healthlab/ui";

export function TimelineEventSkeleon() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="h-4 w-[50px]" />
      </CardHeader>
      <CardContent>
        <div className="h-[60px]">
          <Skeleton className="h-6 my-[35px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableEventSkeleon() {
  return <Skeleton className="h-8 w-full" />;
}

export default function EventsSkeleton() {
  const { viewMode: mode } = useSearchContext();

  if (mode === "table") {
    return (
      <div className="flex flex-1 flex-col gap-4 my-2">
        <TableEventSkeleon />
        <TableEventSkeleon />
        <TableEventSkeleon />
        <TableEventSkeleon />
        <TableEventSkeleon />
        <TableEventSkeleon />
        <TableEventSkeleon />
      </div>
    );
  } else if (mode === "timeline") {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <TimelineEventSkeleon />
        <TimelineEventSkeleon />
        <TimelineEventSkeleon />
        <TimelineEventSkeleon />
      </div>
    );
  }
}
