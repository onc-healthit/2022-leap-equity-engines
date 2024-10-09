import { Rectangle } from "recharts";

export interface MinMaxBarProps {
  radius?: [number, number, number, number];
  fill?: string;
  stroke?: string;
  height?: number;
  width?: number;
  x?: number;
  y?: number;
  strokeWidth?: number;
}

export function MinMaxBar({ x, y, fill, stroke, width, height, strokeWidth, radius }: MinMaxBarProps) {
  if (!x || !y || !width || !height) return <></>;

  return (
    <Rectangle
      x={x}
      y={y}
      fill={fill}
      stroke={stroke}
      width={width}
      height={height}
      strokeWidth={strokeWidth}
      radius={radius}
    />
  );
}
