import { isBefore } from "date-fns";
import { z } from "zod";

export type Role = "admin" | "user";

export const DateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .refine((data) => isBefore(data.from, data.to));
export type DateRange = z.infer<typeof DateRangeSchema>;

export type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Role | null;
};

export const PatientSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  id: z.string(),
});

export type Patient = z.infer<typeof PatientSchema>;

export const ReferenceRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  excl_min: z.number(),
  excl_max: z.number(),
  range: z.string(),
  color: z.string(),
  primary: z.boolean(),
});

export type ReferenceRange = z.infer<typeof ReferenceRangeSchema>;

export enum RawEventType {
  Observation = "Observation",
  Document = "Document",
  Medication = "Medication",
}

export const EventClusterSchema = z.object({
  id: z.string(),
  event: z.string(),
  patient_id: z.string(),
  type: z.nativeEnum(RawEventType),
  codes: z.record(z.string().array()),
  reference_ranges: ReferenceRangeSchema.array().optional(),
  unit: z.string(),
  abnormal_flags: z.string(),
  is_favorite: z.boolean(),
  is_line_disabled: z.boolean(),
  file: z.string().optional(),
  is_group: z.boolean().optional(),
  date: z.string(),
  value: z.number(),
  trend: z.number(),
  slope: z.number(),
  count: z.number(),
  ts: z.number(),
});

export const PatientEventAdditionalSchema = z.object({
  id: z.string(),
  event: z.string(),
  patient_id: z.string(),
  type: z.nativeEnum(RawEventType),
  source: z.string(),
  codes: z.record(z.string()),
  reference_ranges: ReferenceRangeSchema.array().optional(),
  unit: z.string(),
  abnormal_flags: z.string(),
  is_favorite: z.boolean(),
  is_line_disabled: z.boolean(),
  file: z.string().optional(),
  is_group: z.boolean().optional(),
  ts: z.number(),
});

export const PatientEventBaseSchema = z.object({
  date: z.string(),
  value: z.number(),
});

const MinMaxValueSchema = z.object({
  min: z.number(),
  max: z.number(),
});
export type MinMaxValue = z.infer<typeof MinMaxValueSchema>;

export const PatientEventBaseMinMaxSchema = z.object({
  date: z.string(),
  value: MinMaxValueSchema,
});

export const PatientEventSchema = PatientEventAdditionalSchema.merge(PatientEventBaseSchema);
export const PatientEventMinMaxSchema = PatientEventAdditionalSchema.merge(PatientEventBaseMinMaxSchema);

export type EventCluster = z.infer<typeof EventClusterSchema>;
export type PatientEvent = z.infer<typeof PatientEventSchema>;
export type PatientEventBase = z.infer<typeof PatientEventBaseSchema>;
export type PatientEventMinMax = z.infer<typeof PatientEventMinMaxSchema>;

export function isMinMaxPatientEvent(event: PatientEvent | PatientEventMinMax): event is PatientEventMinMax {
  if (event == null) {
    return false;
  }
  return event.value != null && typeof event.value === "object";
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export type ClusterMap = {
  [x: string]: EventCluster[];
};

export type SortMode = "date" | "deviation" | "favorability" | "unfavorability";

export type EventFilterTerm = {
  name: string;
  display_name: string;
  query: string;
  sortMode?: SortMode;
};

export type EventFilter = {
  name: string;
  display_name: string;
  terms: EventFilterTerm[];
};

export type Group = {
  name: string;
};

export type ActionState<T = any> = {
  message: string;
  data?: T;
  status: "success" | "error" | "unknown";
};
