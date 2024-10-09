import { ResponsiveContainer, XAxis, Tooltip, Scatter, ScatterChart, Cell, ReferenceArea } from "recharts";
import { ensureInRange, getNormalizedBounds, notEmpty, round } from "@/lib/utils";
import { EventCluster } from "@/lib/types";
import TimestampTooltip from "./tooltip/timestamp-tooltip";
import { useTheme } from "next-themes";
import { ReferenceRangeDot } from "./indicators/ref-range-dot";
import { useMemo } from "react";

export interface EventChartProps {
  cluster: EventCluster;
  name: string;
  onItemSelected?: (event: EventCluster) => void;
  isBigData?: boolean;
}

const IndicatorChart = ({ cluster, name, onItemSelected, isBigData }: EventChartProps) => {
  const { resolvedTheme } = useTheme();

  const value = cluster.value;

  const bounds = useMemo(() => getNormalizedBounds(cluster.reference_ranges), [cluster]);
  const normalBounds = useMemo(() => bounds.normalBounds, [bounds]);
  const uniqueBounds = useMemo(
    () =>
      Array.from(
        new Set(
          normalBounds.concat(...(bounds.additionalBounds?.map((bound) => [bound.min, bound.max].flat(1)) ?? [])),
        ),
      ),
    [normalBounds, bounds],
  );

  if (!value) return <></>;

  const [min, rangeMin, rangeMax, max] = normalBounds;
  const finalValue = ensureInRange(value, min, max);
  const dataItem = [{ ...cluster, rangeValue: finalValue, y: 1 }];
  const ticks = uniqueBounds.filter(notEmpty);

  const formatTick = (tick: number) => {
    const maxTick = Math.max(...ticks);
    const symbol = tick >= maxTick ? "+" : "";
    return `${round(tick, 1)}${symbol}`;
  };

  const axisStroke = resolvedTheme === "dark" ? "#d1d5db" : "#4b5563";

  return (
    <ResponsiveContainer height={55}>
      <ScatterChart margin={{ top: 20, right: 25, left: 20 }}>
        <XAxis
          stroke={axisStroke}
          name="value"
          dataKey="rangeValue"
          type="number"
          ticks={ticks}
          domain={["dataMin", "dataMax"]}
          interval={0}
          strokeWidth={0}
          fontSize={14}
          tickFormatter={formatTick}
        />
        <Tooltip
          cursor={{ stroke: "", strokeDasharray: "" }}
          content={<TimestampTooltip includeValue={true} hasHour={isBigData} />}
        />
        {min !== undefined && <ReferenceArea ifOverflow="extendDomain" x1={min} x2={rangeMin} fill="red" y2={1} />}
        <ReferenceArea x1={rangeMin} x2={rangeMax} fill="green" y2={1} />
        {max !== undefined && <ReferenceArea x1={rangeMax} x2={max} fill="red" y2={1} />}
        {bounds.additionalBounds?.map((bound, index) => (
          <ReferenceArea key={index} x1={bound.min} x2={bound.max} fill={bound.color} y2={1} fillOpacity={1} />
        ))}
        <Scatter
          data={dataItem}
          dataKey="y"
          name={name}
          shape={<ReferenceRangeDot strokeWidth={3} r={7} isInTimeline />}
        >
          {dataItem.map((entry, index) => (
            <Cell width={30} height={30} key={`cell-${index}`} onClick={() => onItemSelected?.(entry)} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default IndicatorChart;
