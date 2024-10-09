"use client";

import { Patient } from "@/lib/types";
import { useMemo, useState } from "react";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@healthlab/ui";
import Link from "next/link";
import { Button } from "@healthlab/ui";
import { ImportEvents } from "../events/events-import";
import { Skeleton } from "@healthlab/ui";

export type EventTableProps = {
  patients: Patient[];
};

const itemsPerPage = 20;

export default function PatientsTable({ patients }: EventTableProps) {
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const patientsForPage = useMemo(
    () =>
      patients
        .slice((page - 1) * itemsPerPage, page * itemsPerPage)
        .sort((a, b) => a.first_name.localeCompare(b.first_name) || a.last_name.localeCompare(b.last_name)),
    [patients, page],
  );

  return (
    <div className="flex flex-col gap-2 w-full items-center">
      <DesktopTable patients={patientsForPage} />
      <Pagination page={page} onPageChange={(page) => setPage(page)} totalPages={totalPages} />
    </div>
  );
}

function DesktopTable({ patients }: EventTableProps) {
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead></TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>{patient.first_name}</TableCell>
            <TableCell>{patient.last_name}</TableCell>
            <TableCell>
              <Link href={`/patient/${patient.id}`}>
                <Button size="sm" variant="default">
                  View Data
                </Button>
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/patient/${patient.id}/ingestion`}>
                <Button size="sm" variant="secondary">
                  Ingest Data
                </Button>
              </Link>
            </TableCell>
            <TableCell>
              <ImportEvents
                patientId={patient.id}
                handler="/api/snomed_import"
                imageSubmitType="base64"
                buttonVariant="secondary"
                buttonText="Import Labs"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PatientsTableSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 my-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
