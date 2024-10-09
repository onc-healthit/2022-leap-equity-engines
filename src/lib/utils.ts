import { type ClassValue, clsx } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { EventCluster, ReferenceRange } from "./types";
import moment, { normalizeUnits, unitOfTime } from "moment";

export const formatTime = (time: number | string) => moment(time).format("MM/DD/YYYY");
export const formatHour = (time: number | string) => moment(time).format("HH:mm");

export type Optional<T> = T | undefined;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const getColorFromRanges = (value: number, ranges: ReferenceRange[], defaultColor?: string) => {
  if (isInRange(value, ranges[0])) {
    return "green";
  }
  for (let i = 1; i < ranges.length; i++) {
    if (isInRange(value, ranges[i])) {
      return ranges[i].color;
    }
  }
  return defaultColor;
};

export const isInRange = (value: number, range: ReferenceRange) => {
  if (range.max && value > range.max) return false;
  if (range.min && value < range.min) return false;
  if (range.excl_max && value >= range.excl_max) return false;
  if (range.excl_min && value <= range.excl_min) return false;
  return true;
};

export const ensureInRange = (value: number, min?: number, max?: number) => {
  let result = value;
  if (min) result = Math.max(min, result);
  if (max) result = Math.min(max, result);
  return result;
};

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const round = (value: number, digits: number) =>
  Math.round((value + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits);

export type Bounds = {
  normalBounds: Optional<number>[];
  additionalBounds?: { min: Optional<number>; max: Optional<number>; color: string }[];
};

export const getNormalizedBounds = (eventRefRanges?: ReferenceRange[]): Bounds => {
  let min: Optional<number> = undefined,
    max: Optional<number> = undefined,
    rangeMin: Optional<number> = undefined,
    rangeMax: Optional<number> = undefined;

  const range = eventRefRanges?.[0];

  if (range?.min !== undefined) {
    rangeMin = Math.min(range.min, rangeMin ?? range.min);
  } else if (range?.excl_min !== undefined) {
    const tempMin = range.excl_min - 0.01;
    rangeMin = Math.min(tempMin, rangeMin ?? tempMin);
  }

  if (range?.max !== undefined) {
    rangeMax = Math.min(range.max, rangeMax ?? range.max);
  } else if (range?.excl_max !== undefined) {
    const tempMax = range.excl_max - 0.01;
    rangeMax = Math.min(tempMax, rangeMax ?? tempMax);
  }

  let additionalMin: Optional<number> = undefined,
    additionalMax: Optional<number> = undefined;
  const ranges = eventRefRanges
    ?.slice(1)
    ?.sort((range) => range.min ?? range.excl_min)
    .map((range) => {
      let rangeMin: Optional<number> = undefined,
        rangeMax: Optional<number> = undefined;

      if (range?.min !== undefined) {
        rangeMin = Math.min(range.min, rangeMin ?? range.min);
      } else if (range?.excl_min !== undefined) {
        const tempMin = range.excl_min - 0.01;
        rangeMin = Math.min(tempMin, rangeMin ?? tempMin);
      }

      if (range?.max !== undefined) {
        rangeMax = Math.min(range.max, rangeMax ?? range.max);
      } else if (range?.excl_max !== undefined) {
        const tempMax = range.excl_max - 0.01;
        rangeMax = Math.min(tempMax, rangeMax ?? tempMax);
      }

      if (rangeMin != null) additionalMin = Math.min(rangeMin, additionalMin ?? rangeMin);
      if (rangeMax != null) additionalMax = Math.max(rangeMax, additionalMax ?? rangeMax);

      return { min: rangeMin, max: rangeMax, color: range.color };
    })
    .flat(1);

  // We have both range values:
  // - Middle section takes 60%
  // - Left section takes 20%
  // - Right section takes 20%
  if (rangeMin !== undefined && rangeMax !== undefined) {
    const contextMin = Math.min(additionalMin ?? rangeMin, rangeMin);
    const contextMax = Math.max(additionalMax ?? rangeMax, rangeMax);

    const len = contextMax - contextMin;

    min = contextMin - (len * 0.2) / 0.6;
    max = contextMax + (len * 0.2) / 0.6;
  }
  // We only have the upper bound:
  // - Left section takes 80%
  // - Right section takes 20%
  else if (rangeMax !== undefined) {
    rangeMin = 0;

    const contextMax = Math.max(additionalMax ?? rangeMax, rangeMax);
    max = contextMax + (contextMax * 0.2) / 0.8;
  }
  // We only have the lower bound:
  // - Left section takes 20%
  // - Right section takes 80%
  else if (rangeMin !== undefined) {
    min = 0;

    const contextMin = Math.min(additionalMin ?? rangeMin, rangeMin);
    rangeMax = contextMin + (contextMin * 0.8) / 0.2;
  }

  return {
    normalBounds: [min, rangeMin, rangeMax, max],
    additionalBounds: ranges,
  };
};

export const formatTimeAsExplicitDuration = (time: number | string, unit: unitOfTime.Diff, noUnits = 1) => {
  const format = (diff: number, unit: string) => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "unit",
      unit,
      unitDisplay: "long",
      maximumFractionDigits: 1,
    });
    return formatter.format(diff) + " ago";
  };

  const diff = moment().diff(time, unit, true);
  if (diff / noUnits >= 1) return format(diff, normalizeUnits(unit));

  return "Today";
};

export const formatTimeAsDuration = (time: number | string) => {
  const format = (diff: number, unit: string) => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "unit",
      unit,
      unitDisplay: "long",
      maximumFractionDigits: 1,
    });
    return formatter.format(diff) + " ago";
  };

  const yearDiff = moment().diff(time, "years", true);
  if (yearDiff >= 1) return format(yearDiff, "year");

  const monthDiff = moment().diff(time, "months", true);
  if (monthDiff >= 1) return format(monthDiff, "month");

  const weekDiff = moment().diff(time, "weeks", true);
  if (weekDiff >= 1) return format(weekDiff, "week");

  const dayDiff = moment().diff(time, "days", true);
  if (dayDiff >= 1) return format(dayDiff, "day");

  return "Today";
};

export const getNormalRangeDeviation = (event: EventCluster) => {
  const value = event.value;
  if (!value) return value;

  const [min, rangeMin, rangeMax, max] = getNormalizedBounds(event.reference_ranges).normalBounds;
  let finalValue = ensureInRange(value, min, max);

  if (min !== undefined && max !== undefined) {
    finalValue = ((finalValue - min) / (max - min)) * 100;
    return Math.abs(50 - finalValue);
  } else if (rangeMax !== undefined && rangeMin !== undefined && max !== undefined) {
    let normalized = ((finalValue - rangeMin) / (max - rangeMin)) * 100;
    if (finalValue >= rangeMin && finalValue <= rangeMax) {
      normalized = normalized * (3 / 4) + 20;
      return Math.abs(50 - normalized);
    }
    return normalized - 50;
  } else if (min !== undefined && rangeMax !== undefined && rangeMin !== undefined) {
    let normalized = ((finalValue - min) / (rangeMax - min)) * 100;
    if (finalValue <= rangeMax && finalValue >= rangeMin) {
      normalized = (normalized - 20) * (3 / 4) + 20;
      return Math.abs(50 - normalized);
    }
    return 30 + (20 - normalized);
  }
  return finalValue;
};

export const normalizeValue = (value: number, max: number, min: number) => {
  return (value - min) / (max - min);
};

export const getSlope = (data: EventCluster[]) => {
  if (data.length < 2) return 0;
  const first = data[0];
  const a = data[data.length - 2];
  const b = data[data.length - 1];

  if (!first.date) return 0;
  if (!a || !b) return 0;
  if (!a.value || !b.value) return 0;
  if (!a.date || !b.date) return 0;

  const [min, rangeMin, rangeMax, max] = getNormalizedBounds(a.reference_ranges).normalBounds;
  let minValue = min || rangeMin;
  let maxValue = max || rangeMax;
  if (typeof minValue === "undefined" || typeof maxValue === "undefined") return 0;

  minValue = Math.min(minValue, a.value, b.value);
  maxValue = Math.max(maxValue, a.value, b.value);

  const aValue = normalizeValue(a.value, maxValue, minValue);
  const bValue = normalizeValue(b.value, maxValue, minValue);

  const minDate = moment(first.date).unix();
  const maxDate = moment(b.date).unix();
  const aDate = normalizeValue(moment(a.date).unix(), maxDate, minDate);
  const bDate = normalizeValue(moment(b.date).unix(), maxDate, minDate);

  const slope = (bValue - aValue) / (bDate - aDate);

  return slope;
};

export const getTrend = (data: EventCluster[]) => {
  const slope = getSlope(data);
  const absSlope = Math.abs(slope);
  const a = data[data.length - 2];
  const b = data[data.length - 1];

  if (!a || !a.value) return 0;
  if (!b || !b.value) return 0;

  const [min, minRange, maxRange, max] = getNormalizedBounds(data[0].reference_ranges).normalBounds;

  if (typeof min === "undefined" && slope < 0) return absSlope;
  if (typeof max === "undefined" && slope > 0) return absSlope;

  if (typeof minRange === "undefined" || typeof maxRange === "undefined") return 0;

  if (slope < 0 && a.value > maxRange && b.value >= minRange) return absSlope;
  if (slope > 0 && a.value < minRange && b.value <= maxRange) return absSlope;

  return -absSlope;
};

export const extractJsonFromMarkdown = (markdown: string) => {
  const jsonRegex = /```json([\s\S]*?)```/;
  const match = markdown.match(jsonRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  return null;
};

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result!.toString().split(",")[1]);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};
