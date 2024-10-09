import { PatientEvent, ReferenceRange } from "@/lib/types";
import { cn, getColorFromRanges } from "@/lib/utils";
import { useMemo } from "react";
import { Dot } from "recharts";

export interface RangeDotProps {
  width?: number;
  height?: number;
  r?: number;
  cx?: number;
  cy?: number;
  warningFill?: string;
  warningWidth?: number;
  warningHeight?: number;
  payload?: PatientEvent;
  value?: number;
  index?: number;
  strokeWidth?: number;
  defaultColor?: string;
}

export type ReferenceRangeDotProps = RangeDotProps & {
  reference_ranges?: ReferenceRange[];
  isInTimeline?: boolean;
};

export const ReferenceRangeDot = ({
  cx,
  cy,
  r,
  payload,
  reference_ranges,
  strokeWidth,
  isInTimeline,
  defaultColor,
}: ReferenceRangeDotProps) => {
  const isEmptyRange = useMemo(() => Object.keys(reference_ranges?.[0] ?? {}).length == 0, [reference_ranges]);

  if (!cx || !cy || !r) return <></>;

  const x = cx;
  const y = isInTimeline ? cy + r / 2 - (r % 2) : cy;

  const stroke =
    payload != null && !isEmptyRange
      ? getColorFromRanges(payload.value, reference_ranges!, defaultColor)
      : defaultColor;

  const className = stroke ? undefined : "stroke-svgStroke dark:stroke-svgStroke-dark";

  return (
    <Dot
      className={cn("fill-svgFill  dark:fill-svgFill-dark ", className)}
      cx={x}
      cy={y}
      r={r}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};
