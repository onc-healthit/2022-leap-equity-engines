"use client";

import { PatientEvent } from "@/lib/types";
import { formatTimeAsDuration, formatTimeAsExplicitDuration, getNormalizedBounds, notEmpty, round } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ReferenceArea,
  Tooltip,
} from "recharts";
import { useTheme } from "next-themes";
import TimestampTooltip from "./tooltip/timestamp-tooltip";
import { ReferenceRangeDot } from "./indicators/ref-range-dot";
import { unitOfTime } from "moment";
import { Skeleton } from "@ui/components";

export enum TimelineDirection {
  Increasing,
  Decreasing,
}

export interface BaseChartProps {
  yLabel?: string;
  syncId?: string;
  timelineDirection?: TimelineDirection;
  disableLine?: boolean;
  domain?: [number, number];
  disableAnimation?: boolean;
  hasHour?: boolean;
  preciseScale?: {
    unit: unitOfTime.Diff;
    units: number;
  };
}

export type ValueChartProps = BaseChartProps & {
  data: PatientEvent[];
};

export function ChartSkeleton() {
  return <Skeleton className="w-full h-[300px]" />;
}

const ValueChart = ({
  data,
  yLabel,
  syncId,
  timelineDirection = TimelineDirection.Decreasing,
  disableLine,
  disableAnimation,
  hasHour,
  preciseScale,
}: ValueChartProps) => {
  const unit = data[0]?.unit;

  const ranges = useMemo(() => {
    return data[0]?.reference_ranges?.map((range) => {
      return range;
    });
  }, [data]);

  const { resolvedTheme } = useTheme();

  const stroke = resolvedTheme === "dark" ? "#fff" : "#000";

  const [dataVersion, setDataVersion] = useState<number>(0);
  useEffect(() => {
    setDataVersion((value) => value + 1);
  }, [data, disableLine]);

  const dots = useMemo(() => {
    return ranges?.map((range) => {
      const dotMin = range.min ? range.min : range.excl_min ? range.excl_min - 0.01 : undefined;
      const dotMax = range.max ? range.max : range.excl_max ? range.excl_max - 0.01 : undefined;

      return { dotMin, dotMax, color: range.color };
    });
  }, [ranges]);

  const sortedData = useMemo(
    () => (timelineDirection === TimelineDirection.Increasing ? data.map((data) => ({ ...data, ts: -data.ts })) : data),
    [timelineDirection, data],
  );

  if (data.length === 0) {
    return <></>;
  }

  const bounds = getNormalizedBounds(data[0].reference_ranges).normalBounds.filter(notEmpty);
  const graphMin = bounds.length > 0 ? round(Math.min(...bounds), 1) : undefined;
  const graphMax = bounds.length > 0 ? round(Math.max(...bounds), 1) : undefined;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart syncMethod="value" syncId={syncId} data={sortedData} margin={{ top: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        {dots?.map((dot, index) => (
          <ReferenceArea
            key={index}
            ifOverflow="extendDomain"
            y1={dot.dotMin}
            y2={dot.dotMax}
            fill={dot.color ?? "green"}
          />
        ))}
        <Line
          isAnimationActive={!disableAnimation && !disableLine}
          stroke={stroke}
          height={300}
          key={dataVersion}
          name={unit ? `value (${unit})` : "value"}
          connectNulls
          type="monotone"
          dataKey="value"
          strokeWidth={disableLine ? 0 : 2}
          dot={<ReferenceRangeDot width={17} height={17} r={7} strokeWidth={2} reference_ranges={ranges} />}
          activeDot={<ReferenceRangeDot strokeWidth={3} width={17} height={17} r={7} reference_ranges={ranges} />}
          strokeDasharray="3 3"
        />
        <XAxis
          name="time"
          dataKey="ts"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(time) =>
            preciseScale
              ? formatTimeAsExplicitDuration(Math.abs(time), preciseScale.unit, preciseScale.units)
              : formatTimeAsDuration(Math.abs(time))
          }
          interval="preserveStartEnd"
        />
        <YAxis
          name={yLabel}
          domain={[
            (dataMin: number) => (graphMin === undefined ? dataMin : Math.min(graphMin, dataMin)),
            (dataMax: number) => (graphMax === undefined ? dataMax : Math.max(graphMax, dataMax)),
          ]}
          tickFormatter={(value) => Math.ceil(value).toString()}
        />
        <Tooltip content={<TimestampTooltip hasHour={hasHour} />} />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ValueChart;
