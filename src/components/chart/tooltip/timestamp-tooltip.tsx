import { Card } from "@healthlab/ui";
import { formatHour, formatTime, round } from "@/lib/utils";

export interface TimestampTooltipProps {
  active?: boolean;
  payload?: any;
  includeValue?: boolean;
  hasHour?: boolean;
}

const TimestampTooltip = ({ active, payload, includeValue = true, hasHour }: TimestampTooltipProps) => {
  if (active && payload && payload.length) {
    const time = formatTime(payload[0].payload.ts);
    const hour = formatHour(payload[0].payload.ts);

    const isMultipleValue = Array.isArray(payload[0]?.payload?.value);

    const min = isMultipleValue ? round(Math.min(...payload[0]?.payload?.value), 2) : 0;
    const max = isMultipleValue ? round(Math.max(...payload[0]?.payload?.value), 2) : 0;

    const noData = min === 0 && max === 0;

    return (
      <Card className="p-4 z-50">
        <b>Date: {time}</b>
        {hasHour && (
          <p>
            <b>Hour: {hour}</b>
          </p>
        )}
        {!isMultipleValue && includeValue && <p>Value: {round(payload[0]?.payload?.value, 2)}</p>}
        {isMultipleValue && includeValue && noData && <p>No data</p>}
        {isMultipleValue && includeValue && !noData && <p>Min: {round(min, 2)}</p>}
        {isMultipleValue && includeValue && !noData && <p>Max: {round(max, 2)}</p>}
      </Card>
    );
  }

  return null;
};

export default TimestampTooltip;
