import { fetchPatientEvents } from "@/lib/events";
import ValueChart, { BaseChartProps, ChartSkeleton } from "./value-chart";
import { Suspense, useMemo } from "react";
import Await from "../await";

export type LoadingValueChartProps = BaseChartProps & {
  eventName: string;
  patientId: string;
  isGroup?: boolean;
  query: string;
  filter: string;
};

function LoadingValueChart({
  patientId,
  eventName,
  yLabel,
  syncId,
  timelineDirection,
  disableLine,
  disableAnimation,
  hasHour,
  preciseScale,
  query,
  filter,
}: LoadingValueChartProps) {
  const eventsPromise = useMemo(
    () => fetchPatientEvents(patientId, eventName, filter, query),
    [patientId, eventName, query, filter],
  );

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <Await promise={eventsPromise}>
        {(events) => (
          <ValueChart
            yLabel={yLabel}
            syncId={syncId}
            timelineDirection={timelineDirection}
            disableLine={disableLine}
            disableAnimation={disableAnimation}
            hasHour={hasHour}
            preciseScale={preciseScale}
            data={events}
          />
        )}
      </Await>
    </Suspense>
  );
}

export default LoadingValueChart;
