"use client";

import { PatientEventMinMax } from "@/lib/types";
import { formatTimeAsDuration, formatTimeAsExplicitDuration, getNormalizedBounds, notEmpty, round } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ReferenceArea,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { unitOfTime } from "moment";
import { MinMaxBar } from "./indicators/min-max-bar";
import TimestampTooltip from "./tooltip/timestamp-tooltip";

export enum TimelineDirection {
  Increasing,
  Decreasing,
}

export interface MinMaxValueChartProps {
  data: PatientEventMinMax[];
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

const MinMaxValueChart = ({
  data,
  yLabel,
  syncId,
  timelineDirection = TimelineDirection.Decreasing,
  disableLine,
  disableAnimation,
  hasHour,
  preciseScale,
}: MinMaxValueChartProps) => {
  const unit = data[0]?.unit;

  const ranges = useMemo(() => {
    return data[0]?.reference_ranges?.map((range) => {
      return range;
    });
  }, [data]);

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
    () =>
      timelineDirection === TimelineDirection.Increasing
        ? data.map((data) => ({ ...data, value: [data.value.min, data.value.max], ts: -data.ts }))
        : data.map((data) => ({ ...data, value: [data.value.min, data.value.max] })),
    [timelineDirection, data],
  );

  if (data.length === 0) {
    return <></>;
  }

  const bounds = getNormalizedBounds(data[0].reference_ranges).normalBounds.filter(notEmpty);
  const graphMin = bounds.length > 0 ? round(Math.min(...bounds), 1) : undefined;
  const graphMax = bounds.length > 0 ? round(Math.max(...bounds), 1) : undefined;

  const minPointSize = 25;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart syncMethod="value" syncId={syncId} data={sortedData} margin={{ top: 10, right: 20 }}>
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
        <Bar
          className="fill-svgFill stroke-svgStroke dark:fill-svgFill-dark dark:stroke-svgStroke-dark"
          radius={Array(4).fill(+(minPointSize / 2).toFixed()) as [number, number, number, number]}
          dataKey="value"
          isAnimationActive={!disableAnimation && !disableLine}
          key={dataVersion}
          name={unit ? `value (${unit})` : "value"}
          type="monotone"
          barSize={14}
          shape={<MinMaxBar strokeWidth={2} />}
          activeBar={<MinMaxBar strokeWidth={3} />}
          maxBarSize={minPointSize}
          minPointSize={(value, _) => {
            if (value === 0) return 0;
            return minPointSize;
          }}
        />
        <XAxis
          name="time"
          dataKey="ts"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(time) =>
            preciseScale
              ? formatTimeAsExplicitDuration(Math.abs(time), preciseScale.unit, preciseScale.units)
              : formatTimeAsDuration(Math.abs(time))
          }
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          name={yLabel}
          domain={[
            (dataMin: number) => (graphMin === undefined ? dataMin : Math.min(graphMin, dataMin)),
            (dataMax: number) => (graphMax === undefined ? dataMax : Math.max(graphMax, dataMax)),
          ]}
          tickFormatter={(value) => Math.ceil(value).toString()}
        />
        <Tooltip cursor={{ fill: "transparent" }} content={<TimestampTooltip hasHour={hasHour} />} />
        <Legend />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MinMaxValueChart;
