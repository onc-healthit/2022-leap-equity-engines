"use client";

import { MoveRight, TrendingDown, TrendingUp } from "lucide-react";
import { EventCluster } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@healthlab/ui";

export type EventTrendIndicatorProps = {
  cluster: EventCluster;
};

export default function EventTrendIndicator({ cluster }: EventTrendIndicatorProps) {
  const trend = cluster.trend;
  const slope = cluster.slope;

  let color: string | undefined;
  let title = "Flat Trend";
  if (trend > 0) {
    color = "rgb(102, 187, 106)";
    title = "Favorable Trend";
  } else if (trend < 0) {
    color = "red";
    title = "Unfavorable Trend";
  }

  let slopeIcon = <MoveRight width={24} color={color} />;
  if (slope > 0) slopeIcon = <TrendingUp width={24} color={color} />;
  else if (slope < 0) slopeIcon = <TrendingDown width={24} color={color} />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{slopeIcon}</TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
