import EventsSortMode from "./events/events-sort-mode";
import EventsViewMode from "./events/events-view-mode";
import EventSearch from "./event-search";
import { EventsExtra } from "./events/events-actions";

export type ActionsBarProps = {
  patientId: string;
};

export default function ActionsBar({ patientId }: ActionsBarProps) {
  return (
    <div className="flex flex-col items-center sm:flex-row gap-4 flex-wrap lg:flex-nowrap">
      <EventSearch patientId={patientId} />
      <EventsViewMode />
      <EventsSortMode />
      <EventsExtra patientId={patientId} />
    </div>
  );
}
