import EventsView from "@/components/events/events-view";
import { Suspense } from "react";
import EventsSkeleton from "@/components/events/events-skeleton";
import Await from "@/components/await";
import { fetchEventClusters } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function Events({
  searchParams,
  params,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { q: query = "", f: filter = "" } = searchParams as { [key: string]: string };
  const eventsPromise = fetchEventClusters(params.id, query, filter);

  return (
    <div className="flex flex-row gap-2">
      <Suspense key={query} fallback={<EventsSkeleton />}>
        <Await promise={eventsPromise}>
          {(events) => <EventsView patientId={params.id} query={query} filter={filter} clusters={events} />}
        </Await>
      </Suspense>
    </div>
  );
}
