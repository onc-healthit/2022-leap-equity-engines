import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  spacing?: "none" | "sm" | "md" | "lg";
  leading?: boolean;
};

const spacingToGap = {
  none: "",
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-3",
};

export default function WithIcon({ children, icon, className, leading = false, spacing = "md" }: Props) {
  const gap = spacingToGap[spacing];
  const reverse = !!leading ? "flex-row-reverse" : "";
  return (
    <div className={cn("flex items-center", className, gap, reverse)}>
      <div className="flex-shrink-0">{icon}</div>
      <span>{children}</span>
    </div>
  );
}
