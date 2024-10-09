"use client";

import { EventCluster } from "@/lib/types";
import { formatTimeAsDuration, round } from "@/lib/utils";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@healthlab/ui";
import { useMemo } from "react";
import { useSearchState } from "../providers/search-provider";

export type EventTableProps = {
  clusters: EventCluster[];
};

const itemsPerPage = 10;

export default function EventTable({ clusters: events }: EventTableProps) {
  const { searchState, setSearchState } = useSearchState();
  const page = searchState.page;
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const eventsForPage = useMemo(() => events.slice((page - 1) * itemsPerPage, page * itemsPerPage), [events, page]);

  const displayUnit = (value: number, unit: string) => {
    if (unit === "") {
      return "N/A";
    }
    return `${round(value, 2)} ${unit}`;
  };
  return (
    <div className="flex flex-col gap-2 items-center">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Value</TableHead>
            <TableHead>Abnormal Flag</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventsForPage.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.event}</TableCell>
              <TableCell>{formatTimeAsDuration(event.date)}</TableCell>
              <TableCell>{event.type}</TableCell>
              <TableCell>{displayUnit(event.value, event.unit)}</TableCell>
              <TableCell>{event.abnormal_flags || "N"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        onPageChange={(page) => setSearchState({ ...searchState, page })}
        totalPages={totalPages}
      />
    </div>
  );
}
