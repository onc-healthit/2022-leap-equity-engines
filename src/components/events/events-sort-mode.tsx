"use client";

import { SortMode } from "@/lib/types";
import { useSearchContext } from "../providers/search-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@healthlab/ui";

export type EventsSortModeProps = {};

const sortModes = [
  { value: "date", label: "Date" },
  { value: "deviation", label: "Deviation" },
  { value: "favorability", label: "Favorability" },
  { value: "unfavorability", label: "Unfavorability" },
];

export default function EventsSortMode({}: EventsSortModeProps) {
  const { sortMode, setSortMode } = useSearchContext();

  const onChange = (value: string) => {
    setSortMode(value as SortMode);
  };

  return (
    <Select value={sortMode} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Sort Mode" />
      </SelectTrigger>
      <SelectContent>
        {sortModes.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
