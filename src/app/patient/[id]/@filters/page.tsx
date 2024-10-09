import Await from "@/components/await";
import EventsFilterSidebar, { EventsFilterSidebarLoader } from "@/components/events/events-filter-sidebar";
import { fetchEventFilters } from "@/lib/events";
import { Suspense } from "react";

export default function Filters() {
  const filtersPromise = fetchEventFilters();
  return (
    <>
      <Suspense fallback={<EventsFilterSidebarLoader />}>
        <Await promise={filtersPromise}>{(filters) => <EventsFilterSidebar filters={filters} />}</Await>
      </Suspense>
    </>
  );
}
