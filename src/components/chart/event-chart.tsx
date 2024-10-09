"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, XAxis, Tooltip, Scatter, ScatterChart, Cell, Dot } from "recharts";
import React from "react";
import { TimelineDirection } from "./value-chart";
import { EventCluster } from "@/lib/types";
import { formatTimeAsDuration } from "@/lib/utils";
import TimestampTooltip from "./tooltip/timestamp-tooltip";
import { useTheme } from "next-themes";

export interface EventChartProps {
  data: EventCluster[];
  name: string;
  onItemSelected?: (event: EventCluster) => void;
  timelineDirection?: TimelineDirection;
}

const EventChart = ({
  data,
  name,
  onItemSelected,
  timelineDirection = TimelineDirection.Increasing,
}: EventChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const sortedData = useMemo(
    () => (timelineDirection === TimelineDirection.Decreasing ? data.map((data) => ({ ...data, ts: -data.ts })) : data),
    [timelineDirection, data],
  );

  const { resolvedTheme } = useTheme();

  const axisStroke = resolvedTheme === "dark" ? "#d1d5db" : "#4b5563";

  return (
    <ResponsiveContainer width="100%" height={60}>
      <ScatterChart margin={{ right: 20, left: 20, bottom: 5 }}>
        <XAxis
          stroke={axisStroke}
          name="time"
          dataKey="ts"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(time) => formatTimeAsDuration(Math.abs(time))}
          interval="preserveStartEnd"
          strokeWidth={4}
          fontSize={14}
          tickMargin={6}
        />
        <Tooltip cursor={{ stroke: "", strokeDasharray: "" }} content={<TimestampTooltip includeValue={false} />} />
        <Scatter
          activeIndex={activeIndex}
          data={sortedData}
          dataKey="value"
          name={name}
          shape={
            <Dot
              className="fill-svgFill stroke-svgStroke dark:fill-svgFill-dark dark:stroke-svgStroke-dark"
              r={7}
              strokeWidth={3}
            />
          }
          activeShape={
            <Dot
              className="fill-svgFill stroke-svgStroke dark:fill-svgFill-dark dark:stroke-svgStroke-dark"
              strokeWidth={4}
              r={7}
              cursor="pointer"
              strokeDasharray=""
            />
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              onMouseLeave={() => setActiveIndex(undefined)}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => onItemSelected?.(entry)}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default EventChart;
