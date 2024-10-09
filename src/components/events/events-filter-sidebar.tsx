import { Sidebar } from "../sidebar";
import { EventFilter } from "@/lib/types";
import FilterItem from "./event-filter-item";
import { Skeleton } from "@healthlab/ui";

export type EventsFilterSidebarProps = {
  filters: EventFilter[];
};

export default function EventsFilterSidebar({ filters }: EventsFilterSidebarProps) {
  return (
    <Sidebar>
      {filters.map((filter) => (
        <FilterItem filter={filter} key={filter.name} />
      ))}
    </Sidebar>
  );
}

export function EventsFilterSidebarLoader() {
  return (
    <Sidebar>
      <Skeleton className="h-6 w-30" />
      <Skeleton className="h-6 w-30" />
      <Skeleton className="h-6 w-30" />
      <Skeleton className="h-6 w-30" />
    </Sidebar>
  );
}
