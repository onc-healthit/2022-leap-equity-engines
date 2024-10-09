"use client";

import EventsTable from "./events-table";
import EventsTimeline from "./events-timeline";
import { useSearchContext } from "../providers/search-provider";
import JourneysView from "../journeys/journeys-view";
import { EventCluster } from "@/lib/types";

export type EventsViewProps = {
  patientId: string;
  clusters: EventCluster[];
  query: string;
  filter: string;
};

export default function EventsView({ patientId, clusters, query, filter }: EventsViewProps) {
  const { viewMode: mode } = useSearchContext();

  if (query.length > 0 && clusters.length === 0) {
    return <p>{`No search results for "${query}"`}</p>;
  }

  const shouldShowJourneys = patientId === "XGdUvztMu7XeojupVVETidMDMkv1";
  return (
    <div className="flex flex-row gap-4 w-full">
      <div className="flex-1">
        {mode === "table" && <EventsTable clusters={clusters} />}
        {mode === "timeline" && (
          <EventsTimeline clusters={clusters} patientId={patientId} query={query} filter={filter} />
        )}
      </div>
      {shouldShowJourneys && (
        <div className="w-[35%]">
          <JourneysView />
        </div>
      )}
    </div>
  );
}
