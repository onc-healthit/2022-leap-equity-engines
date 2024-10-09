"use client";

import { fetchBigDataPatientEvents } from "@/lib/events";
import { TimelineDirection, ChartSkeleton } from "./value-chart";
import ZoomableDraggableValueChart, { ZoomableDraggableValueChartProps } from "./zoomable-draggable-value-chart";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@healthlab/ui";
import { EventCluster, PatientEvent, PatientEventMinMax } from "@/lib/types";
import { addMinutes } from "date-fns";

/// unit: how many events per minute should be aggregated
const bigDataScale = [
  { scale: 10, name: "10m", unit: "m", units: 10 },
  { scale: 60, name: "1h", unit: "h", units: 1 },
  { scale: 1440, name: "3d", unit: "d", units: 1 },
  { scale: 10080, name: "1w", unit: "w", units: 1 },
] as const;
type dataScale = (typeof bigDataScale)[number];

export interface BigDataValueChartProps {
  initialCluster: EventCluster;
  yLabel?: string;
  syncId?: string;
  timelineDirection?: TimelineDirection;
  disableLine?: boolean;
}

function BigDataValueChart({
  initialCluster,
  yLabel,
  syncId,
  timelineDirection = TimelineDirection.Decreasing,
  disableLine,
}: BigDataValueChartProps) {
  const [data, setData] = useState<PatientEventMinMax[] | PatientEvent[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);

  const [scaleIndex, setScaleIndex] = useState<number>(0);
  const [scale, setScale] = useState<dataScale>(bigDataScale[scaleIndex]);

  const [queryEndTime, _setQueryEndTime] = useState<Date>(addMinutes(new Date(initialCluster.date), 2));

  const [graphStartTime, setGraphStartTime] = useState<string | undefined>(undefined);
  const [graphEndTime, setGraphEndTime] = useState<string | undefined>(initialCluster.date);

  const query = initialCluster.event;
  const queryKey = `${query}_bigData`;

  useEffect(() => {
    fetchBigDataPatientEvents(
      initialCluster.patient_id,
      initialCluster.event,
      bigDataScale[scaleIndex].scale,
      queryKey,
      queryEndTime.toISOString(),
      scaleIndex < 1,
    ).then((fetchData) => {
      if (!fetchData) return;
      if (fetchData.length === 0) {
        setIsDisabled(false);
        setLoading(false);
        return;
      }
      if (fetchData.length > 11) {
        setGraphEndTime(fetchData[fetchData.length - 1].date);
        setGraphStartTime(fetchData[fetchData.length - 11].date);
      }
      setData(fetchData);
      setLoading(false);
      setScale(bigDataScale[scaleIndex]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaleIndex, queryEndTime]);

  useEffect(() => {
    setIsDisabled(false);
  }, [data]);

  const changeViewScale = (scaleValue: string) => {
    if (!graphStartTime && !graphEndTime) return;

    const index = bigDataScale.findIndex((scale) => scale.scale === +scaleValue);

    setScaleIndex(index);
    setIsDisabled(true);
  };

  if (isLoading) return <ChartSkeleton />;

  return (
    <div className="flex flex-col items-center">
      <Tabs
        onValueChange={changeViewScale}
        value={bigDataScale[scaleIndex].scale.toString()}
        className="px-4 py-2 max-w-[450px] w-full"
      >
        <TabsList className="flex w-full flex-wrap">
          {bigDataScale.map((scaleTuple) => (
            <TabsTrigger
              key={scaleTuple.scale}
              value={scaleTuple.scale.toString()}
              className="flex-1 w-full sm:w-1/2 lg:w-1/4 capitalize"
            >
              {scaleTuple.unit}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <BigDataValueChartComponent
        data={data}
        yLabel={yLabel}
        syncId={syncId}
        timelineDirection={timelineDirection}
        disableLine={disableLine}
        initialStartTime={graphStartTime}
        initialEndTime={graphEndTime}
        hasHour={scaleIndex < 4}
        isDisabled={isDisabled}
        minDistanceInSeconds={bigDataScale[scaleIndex].scale * 60}
        preciseScale={scale}
      />
    </div>
  );
}

const BigDataValueChartComponent = ({
  data,
  yLabel,
  syncId,
  timelineDirection = TimelineDirection.Decreasing,
  disableLine,
  zoomCallback,
  initialEndTime,
  initialStartTime,
  hasHour,
  isDisabled,
  minDistanceInSeconds,
  preciseScale,
}: ZoomableDraggableValueChartProps) => {
  return (
    <ZoomableDraggableValueChart
      data={data}
      yLabel={yLabel}
      syncId={syncId}
      timelineDirection={timelineDirection}
      disableLine={disableLine}
      zoomCallback={zoomCallback}
      initialStartTime={initialStartTime}
      initialEndTime={initialEndTime}
      hasHour={hasHour}
      isDisabled={isDisabled}
      minDistanceInSeconds={minDistanceInSeconds}
      preciseScale={preciseScale}
      disableZoom
    />
  );
};

export default BigDataValueChart;
