import { PatientEvent, PatientEventMinMax, isMinMaxPatientEvent } from "@/lib/types";
import ValueChart, { TimelineDirection } from "./value-chart";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import MinMaxValueChart from "./min-max-value-chart";
import { unitOfTime } from "moment";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts";
import { useTheme } from "next-themes";

export interface ZoomableDraggableValueChartProps {
  data: PatientEvent[] | PatientEventMinMax[];
  yLabel?: string;
  syncId?: string;
  timelineDirection?: TimelineDirection;
  disableLine?: boolean;
  zoomCallback?: (zoomTotalEventsValue: number, startTime: number, endTime: number) => void;
  initialStartTime?: string;
  initialEndTime?: string;
  hasHour?: boolean;
  isDisabled?: boolean;
  minDistanceInSeconds?: number;
  preciseScale?: {
    unit: unitOfTime.Diff;
    units: number;
  };
  disableZoom?: boolean;
  disableDrag?: boolean;
}

const DRAG_STEP = 0.1;
const SCROLL_DRAG_STEP = 0.01;

const ZoomableDraggableValueChart = ({
  data: initialData,
  yLabel,
  syncId,
  timelineDirection = TimelineDirection.Decreasing,
  disableLine,
  zoomCallback,
  initialStartTime,
  initialEndTime,
  hasHour,
  isDisabled,
  minDistanceInSeconds,
  preciseScale,
  disableZoom,
  disableDrag,
}: ZoomableDraggableValueChartProps) => {
  const { resolvedTheme } = useTheme();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isInvertedDrag, setIsInvertedDrag] = useState<boolean>(false);

  const [startTime, setStartTime] = useState<string | null>(null);
  const [startTimeIndex, setStartTimeIndex] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [endTimeIndex, setEndTimeIndex] = useState<number | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const originalData = useMemo<PatientEvent[] | PatientEventMinMax[]>(() => {
    return initialData;
  }, [initialData]);

  const extractIndexesFromDates = (start: string, end: string, data: PatientEvent[] | PatientEventMinMax[]) => {
    let startIndex = data.findIndex((data) => data.date === start);
    if (startIndex === -1) {
      const initialDataStartTime = new Date(start).getTime();
      startIndex = data
        .map((data) => data.ts)
        .sort((date1, date2) => Math.abs(date1 - initialDataStartTime) - Math.abs(date2 - initialDataStartTime))[0];
    }
    setStartTimeIndex(startIndex);

    let endIndex = data.findIndex((data) => data.date === end);
    if (endIndex === -1) {
      const initialDataEndTime = new Date(end).getTime();
      endIndex = data
        .map((data) => data.ts)
        .sort((date1, date2) => Math.abs(date1 - initialDataEndTime) - Math.abs(date2 - initialDataEndTime))[0];
    }
    setEndTimeIndex(endIndex);

    return {
      startIndex,
      endIndex,
    };
  };

  useEffect(() => {
    if (initialData?.length) {
      const start = initialStartTime ?? initialData[0].date;
      const end = initialEndTime ?? initialData[initialData.length - 1].date;

      setStartTime(start);
      setEndTime(end);

      const { startIndex, endIndex } = extractIndexesFromDates(start, end, initialData);

      setStartTimeIndex(startIndex);
      setEndTimeIndex(endIndex);
    }
  }, [initialData, initialStartTime, initialEndTime]);

  const zoomedData = useMemo(() => {
    if (!startTime || !endTime) {
      return originalData;
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const dataPointsInRange = originalData.filter((dataPoint) => dataPoint.ts >= start && dataPoint.ts <= end) as
      | PatientEvent[]
      | PatientEventMinMax[];

    if (dataPointsInRange.length > 1) {
      const result = dataPointsInRange;
      zoomCallback?.(result.length, new Date(startTime).getTime(), new Date(endTime).getTime());
      return result;
    }

    const result =
      Math.abs(end - originalData[originalData.length - 1].ts) < Math.abs(start - originalData[0].ts)
        ? originalData.slice(-2, originalData.length)
        : originalData.slice(0, 2);
    zoomCallback?.(result.length, result[0].ts, result[1].ts);

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, originalData]);

  const onChart = () => {
    document.body.style.overflow = "hidden";
  };
  const outsideChart = () => {
    document.body.style.overflow = "";

    endDrag();
  };

  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttleZoom = useCallback(
    _.throttle(
      (
        e: React.WheelEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
        startTime: string | null,
        endTime: string | null,
        originalData: PatientEvent[] | PatientEventMinMax[],
        minDistanceInSeconds?: number,
        isDisabled?: boolean,
      ) => {
        if (isDisabled) {
          return;
        }
        if (!originalData.length || !chartRef.current) return;

        const firstDate = new Date(originalData[0].date);
        const lastDate = new Date(originalData[originalData.length - 1].date);

        let zoomFactor = 0.05;
        let direction = 0;
        let clientX = 0;

        if ("deltaY" in e) {
          const delta = Math.abs(e.deltaY);
          /// Is trackpad
          if (delta < 50) {
            zoomFactor = 0.02;
          }
          // Mouse wheel event
          direction = e.deltaY < 0 ? 1 : -1;
          clientX = e.clientX;
        } else if (e.touches.length === 2) {
          // Pinch zoom
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

          if ((e as any).lastTouchDistance) {
            direction = currentDistance > (e as any).lastTouchDistance ? 1 : -1;
          }
          (e as any).lastTouchDistance = currentDistance;

          clientX = (touch1.clientX + touch2.clientX) / 2;
        } else {
          return;
        }

        const currentRange =
          new Date(endTime || originalData[originalData.length - 1].date).getTime() -
          new Date(startTime || originalData[0].date).getTime();
        const zoomAmount = currentRange * zoomFactor * direction;

        const chartMarginLeft = 60,
          chartMarginRight = 20;

        const chartRect = chartRef.current.getBoundingClientRect();
        const mouseX = clientX - (chartRect.left + chartMarginLeft);
        const mouseXRelativeRight = clientX - (chartRect.right - chartMarginRight);
        if (mouseX < 0 || mouseXRelativeRight > 0) {
          return;
        }
        const chartWidth = chartRect.width - (chartMarginRight + chartMarginLeft);
        const mousePercentage = (mouseX - chartMarginRight) / chartWidth;

        const currentStartTime = new Date(startTime || originalData[0].date).getTime();
        const currentEndTime = new Date(endTime || originalData[originalData.length - 1].date).getTime();

        const nowTime = new Date().getTime();
        if (Math.abs(zoomAmount * (1 - mousePercentage)) >= nowTime) {
          return;
        }

        let newStartTime = new Date(currentStartTime + zoomAmount * mousePercentage);
        if (newStartTime.getTime() <= firstDate.getTime()) {
          newStartTime = firstDate;
        }
        let newEndTime = new Date(currentEndTime - zoomAmount * (1 - mousePercentage));
        if (newEndTime.getTime() >= lastDate.getTime()) {
          newEndTime = lastDate;
        }

        if (newStartTime.getTime() > newEndTime.getTime()) {
          const aux = newStartTime;
          newStartTime = newEndTime;
          newEndTime = aux;
        }

        const newRange = newEndTime.getTime() - newStartTime.getTime();
        if (
          newStartTime.getTime() === newEndTime.getTime() ||
          (minDistanceInSeconds && newRange <= minDistanceInSeconds * 1000 && zoomAmount > 0)
        ) {
          return;
        }

        setStartTime(newStartTime.toISOString());
        setEndTime(newEndTime.toISOString());
      },
      20,
    ),
    [],
  );

  const getClientX = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): number | null => {
    if ("clientX" in e) {
      return (e as React.MouseEvent<HTMLDivElement>).clientX;
    } else if ((e as React.TouchEvent<HTMLDivElement>).touches.length === 2) {
      return (e as React.TouchEvent<HTMLDivElement>).touches[0].clientX;
    } else {
      return null;
    }
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const clientX = getClientX(e);
    if (!clientX) return;
    setDragStart(clientX);
    setIsDragging(true);
    setIsInvertedDrag(false);
  };

  const getMousePercentage = (ref: RefObject<HTMLDivElement>, clientX: number | null) => {
    if (!ref.current || !clientX) return;
    const chartMarginLeft = 60,
      chartMarginRight = 20;

    const chartRect = ref.current.getBoundingClientRect();
    const mouseX = clientX - (chartRect.left + chartMarginLeft);
    const mouseXRelativeRight = clientX - (chartRect.right - chartMarginRight);
    if (mouseX < 0 || mouseXRelativeRight > 0) {
      return;
    }
    const chartWidth = chartRect.width - (chartMarginRight + chartMarginLeft);

    return (mouseX - chartMarginRight) / chartWidth;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttleDrag = useCallback(
    _.throttle(
      (
        e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
        isDragging: boolean,
        startTimeIndex: number | null,
        endTimeIndex: number | null,
        originalData: PatientEvent[] | PatientEventMinMax[],
        isInvertedDrag: boolean,
        isDisabled?: boolean,
        dragStartPercentage?: number,
      ) => {
        if (
          !isDragging ||
          isDisabled ||
          !originalData.length ||
          !chartRef.current ||
          dragStartPercentage == null ||
          startTimeIndex == null ||
          endTimeIndex == null
        ) {
          return;
        }

        const clientX = getClientX(e);
        const currentPercentage = getMousePercentage(chartRef, clientX);

        if (currentPercentage == null) return;

        const delta = Math.abs(dragStartPercentage - currentPercentage);
        const direction = Math.sign((dragStartPercentage - currentPercentage) * (isInvertedDrag ? -1 : 1));

        if ((direction === 1 && endTimeIndex === 99) || (direction === -1 && startTimeIndex === 0)) {
          return;
        }

        const dragStep = isInvertedDrag ? SCROLL_DRAG_STEP : DRAG_STEP;

        if (delta / dragStep < 1) {
          return;
        }

        let newStartTimeIndex = +(startTimeIndex + (delta / dragStep) * direction).toFixed();
        let newEndTimeIndex = +(endTimeIndex + (delta / dragStep) * direction).toFixed();

        if (newEndTimeIndex > 99) {
          return;
        }
        if (newStartTimeIndex < 0) {
          return;
        }

        setStartTime(originalData[newStartTimeIndex].date);
        setEndTime(originalData[newEndTimeIndex].date);
      },
      20,
    ),
    [],
  );

  const endDrag = () => {
    setIsDragging(false);
    setDragStart(null);
    setIsInvertedDrag(false);

    if (startTime && endTime) {
      const { startIndex, endIndex } = extractIndexesFromDates(startTime, endTime, initialData);

      setStartTimeIndex(startIndex);
      setEndTimeIndex(endIndex);
    }
  };

  const handleZoom = useCallback(
    (e: React.WheelEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      throttleZoom(e, startTime, endTime, originalData, minDistanceInSeconds, isDisabled);
    },
    [endTime, isDisabled, originalData, startTime, throttleZoom, minDistanceInSeconds],
  );

  const handleDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const startPercentage = getMousePercentage(chartRef, dragStart);

      throttleDrag(
        e,
        isDragging,
        startTimeIndex,
        endTimeIndex,
        originalData,
        isInvertedDrag,
        isDisabled,
        startPercentage,
      );
    },
    [isDragging, isDisabled, throttleDrag, originalData, dragStart, startTimeIndex, endTimeIndex, isInvertedDrag],
  );

  const startScrollDrag = (e: any) => {
    const event: { points: { x: number; y: number }[] } = e;
    const xAvg = (event.points[0].x + e.points[event.points.length - 1].x) / 2;

    if (!scrollRef.current) return;

    const cursorX = xAvg + scrollRef.current.getBoundingClientRect().x;
    setDragStart(cursorX);
    setIsDragging(true);
    setIsInvertedDrag(true);
  };

  const scrollFill = resolvedTheme === "dark" ? "#fff" : "#000";
  const scrollBGFill = resolvedTheme === "dark" ? "#212121" : "#dedede";

  return (
    <div className="w-full select-none" onMouseOver={onChart} onMouseLeave={outsideChart}>
      <div
        ref={chartRef}
        className="w-full"
        onWheel={!disableZoom ? handleZoom : undefined}
        onMouseDown={!disableDrag ? startDrag : undefined}
        onTouchStart={!disableDrag ? startDrag : undefined}
        onTouchMove={!disableDrag ? handleDrag : undefined}
        onMouseMove={!disableDrag ? handleDrag : undefined}
        onMouseUp={!disableDrag ? endDrag : undefined}
        onTouchEnd={!disableDrag ? endDrag : undefined}
        onTouchCancel={!disableDrag ? endDrag : undefined}
      >
        {(!isMinMaxPatientEvent(zoomedData[0]) && (
          <ValueChart
            data={zoomedData as PatientEvent[]}
            yLabel={yLabel}
            syncId={syncId}
            timelineDirection={timelineDirection}
            disableLine={disableLine}
            disableAnimation
            hasHour={hasHour}
            preciseScale={preciseScale}
          />
        )) || (
          <MinMaxValueChart
            data={zoomedData as PatientEventMinMax[]}
            yLabel={yLabel}
            syncId={syncId}
            timelineDirection={timelineDirection}
            disableLine={disableLine}
            disableAnimation
            hasHour={hasHour}
            preciseScale={preciseScale}
          />
        )}
      </div>

      <div
        ref={scrollRef}
        onTouchMove={!disableDrag ? handleDrag : undefined}
        onMouseMove={!disableDrag ? handleDrag : undefined}
      >
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={zoomedData} stackOffset="expand" margin={{ right: 20, left: 60, top: 10 }}>
            <CartesianGrid strokeDasharray={0} stroke="transparent" fill={scrollBGFill} />
            <Area
              isAnimationActive={false}
              dataKey={(_) => 1}
              fill={scrollFill}
              stroke={scrollFill}
              fillOpacity={1}
              onMouseDown={!disableDrag ? startScrollDrag : undefined}
              onTouchStart={!disableDrag ? startScrollDrag : undefined}
              onMouseUp={!disableDrag ? endDrag : undefined}
              onTouchEnd={!disableDrag ? endDrag : undefined}
            />
            <XAxis
              height={10}
              name="time"
              dataKey="ts"
              type="number"
              domain={(_dataMin, _dataMax) => [originalData[0].ts, originalData[originalData.length - 1].ts]}
              tickFormatter={(time) => ""}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ZoomableDraggableValueChart;
