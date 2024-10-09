"use client";

import { PatientEvent } from "@/lib/types";
import { Button, Skeleton } from "@healthlab/ui";
import { BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@healthlab/ui";
import { Suspense, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { DialogDescription } from "@radix-ui/react-dialog";
import { differenceInCalendarDays, subDays } from "date-fns";
import { Separator } from "@healthlab/ui";
import { DatePickerWithRange, DatePickerRelative } from "@healthlab/ui";
import { fetchPatientEvents } from "@/lib/events";
import Await from "../await";

export type EventsSummaryProps = {
  patientId: string;
  eventName: string;
};

interface SummaryDateProps {
  start: Date;
  end: Date;
  unit: string;
  data: PatientEvent[];
  storageKey: string;
}

const AbsoluteSummary = ({ storageKey, start, end, data, unit }: SummaryDateProps) => {
  const event = data[0].event;

  const localStorageKey = useMemo(() => {
    return `summary-absolute-${event}-${storageKey}`.replaceAll(" ", "_");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optimisticRange = useMemo(() => {
    if (typeof window !== "undefined") {
      const storageString = localStorage.getItem(localStorageKey);
      if (!storageString) {
        return null;
      }
      const relativeRangeOptimistic = JSON.parse(storageString);

      return {
        from: new Date(relativeRangeOptimistic.from),
        to: new Date(relativeRangeOptimistic.to),
      };
    }
    return null;
  }, [localStorageKey]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: optimisticRange?.from || start,
    to: optimisticRange?.to || end,
  });

  useEffect(() => {
    if (date?.from && date?.to) {
      const range = {
        from: date.from,
        to: date.to ?? end,
      };
      localStorage.setItem(localStorageKey, JSON.stringify(range));
    }
  }, [date, end, localStorageKey]);

  const filteredData = useMemo(() => {
    return filterEventsForDateInterval(data, date?.from, date?.to);
  }, [data, date?.from, date?.to]);

  return (
    <div className="flex flex-col gap-4">
      <DatePickerWithRange className="self-center mb-4" date={date} onSelect={setDate} />
      <p>
        <b>Average Value: </b>
        {computeAverage(filteredData).toFixed(2) + "(" + unit + ")"}
      </p>
      <p>
        <b>Out of Range: </b>
        {computeOutOfRange(filteredData).toFixed(2)}(%)
      </p>
    </div>
  );
};

const RelativeSummary = ({
  storageKey,
  start,
  end,
  data,
  unit,
  referenceDate,
}: SummaryDateProps & { referenceDate: Date }) => {
  const event = data[0].event;

  const localStorageKey = useMemo(() => {
    return `summary-relative-${event}-${storageKey}`.replaceAll(" ", "_");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optimisticRange = useMemo(() => {
    if (typeof window !== "undefined") {
      const storageString = localStorage.getItem(localStorageKey);
      if (!storageString) {
        return null;
      }
      const relativeRangeOptimistic = JSON.parse(storageString);

      return {
        from: subDays(end, relativeRangeOptimistic.from),
        to: subDays(end, relativeRangeOptimistic.to),
      };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorageKey]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: optimisticRange?.from || start,
    to: optimisticRange?.to || end,
  });

  useEffect(() => {
    if (date?.from && date?.to) {
      const range = {
        from: differenceInCalendarDays(end, date.from),
        to: differenceInCalendarDays(end, date.to) ?? 0,
      };
      localStorage.setItem(localStorageKey, JSON.stringify(range));
    }
  }, [date, end, localStorageKey]);

  const filteredData = useMemo(() => {
    return filterEventsForDateInterval(data, date?.from, date?.to);
  }, [data, date?.from, date?.to]);

  return (
    <div className="flex flex-col gap-4">
      <DatePickerRelative
        className="justify-center mb-4"
        dateRange={date}
        onSelect={setDate}
        referenceDate={referenceDate}
      />
      <p>
        <b>Average Value: </b>
        {computeAverage(filteredData).toFixed(2) + "(" + unit + ")"}
      </p>
      <p>
        <b>Out of Range: </b>
        {computeOutOfRange(filteredData).toFixed(2)}(%)
      </p>
    </div>
  );
};

function SummaryContentSkeleton() {
  return <Skeleton className="w-full h-52" />;
}

function SummaryContent({ events }: { events: PatientEvent[] }) {
  const unit = events[0]?.unit || "";

  const start = events.length > 0 ? new Date(events[0].ts) : new Date();
  const end = events.length > 0 ? new Date(events[events.length - 1].ts) : new Date();

  return (
    <div className="grid grid-cols-2 gap-x-12">
      <b className="col-span-2 mb-4 text-center">Absolute dates</b>
      <AbsoluteSummary storageKey="absolute-l" start={start} end={end} unit={unit} data={events} />
      <AbsoluteSummary storageKey="absolute-r" start={start} end={end} unit={unit} data={events} />
      <Separator className="col-span-2 mt-4" />
      <b className="col-span-2 my-4 text-center">Relative dates to today&#96;s day</b>
      <RelativeSummary
        storageKey="relative-l-1"
        start={start}
        end={end}
        unit={unit}
        data={events}
        referenceDate={new Date()}
      />
      <RelativeSummary
        storageKey="relative-r-1"
        start={start}
        end={end}
        unit={unit}
        data={events}
        referenceDate={new Date()}
      />
      <Separator className="col-span-2 mt-4 " />
      <b className="col-span-2 my-4 text-center">Relative dates to the last data point</b>
      <RelativeSummary
        storageKey="relative-l-2"
        start={start}
        end={end}
        unit={unit}
        data={events}
        referenceDate={end}
      />
      <RelativeSummary
        storageKey="relative-r-2"
        start={start}
        end={end}
        unit={unit}
        data={events}
        referenceDate={end}
      />
    </div>
  );
}

function EventSummaryDialogContent({ eventName, patientId }: EventsSummaryProps) {
  const eventsPromise = fetchPatientEvents(patientId, eventName);

  return (
    <Suspense fallback={<SummaryContentSkeleton />}>
      <Await promise={eventsPromise}>{(events) => <SummaryContent events={events} />}</Await>
    </Suspense>
  );
}

export default function EventsSummary({ eventName, patientId }: EventsSummaryProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="max-md:hidden">
          <BarChart width={24} className="shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Summary Statistics</DialogTitle>
          <DialogDescription>
            Select a date range for which the stats should be computed. By default, the stats are computed for the
            entire time interval.
          </DialogDescription>
        </DialogHeader>
        <EventSummaryDialogContent eventName={eventName} patientId={patientId} />
      </DialogContent>
    </Dialog>
  );
}

function filterEventsForDateInterval(
  events: PatientEvent[],
  start: Date | undefined,
  end: Date | undefined,
): PatientEvent[] {
  const result = events.filter((value) => {
    const date = new Date(value.ts);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  });
  return result;
}

function computeAverage(events: PatientEvent[]): number {
  const sum = events.reduce((prev, curr) => curr.value + prev, 0);
  return sum / events.length;
}

function computeOutOfRange(events: PatientEvent[]): number {
  const isOutOfRange = (event: PatientEvent): boolean => {
    const value = event.value;
    const max = event.reference_ranges?.[0]?.excl_max || event.reference_ranges?.[0]?.max;
    const min = event.reference_ranges?.[0]?.excl_min || event.reference_ranges?.[0]?.min;
    if (min && value < min) return true;
    if (max && value > max) return true;
    return false;
  };

  const total = events.reduce((prev, curr) => prev + (isOutOfRange(curr) ? 1 : 0), 0);
  return total / events.length;
}
