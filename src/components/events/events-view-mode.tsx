"use client";

import { useSearchContext } from "../providers/search-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@healthlab/ui";

export type ViewMode = "table" | "timeline";

export type EventsViewModeProps = {};

const viewModes = [
  { value: "table", label: "Table" },
  { value: "timeline", label: "Timeline" },
];

export default function EventsViewMode({}: EventsViewModeProps) {
  const { viewMode, setViewMode } = useSearchContext();

  const onChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  return (
    <Select value={viewMode} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="View Mode" />
      </SelectTrigger>
      <SelectContent>
        {viewModes.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
