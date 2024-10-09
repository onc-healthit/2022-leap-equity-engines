import Await from "@/components/await";
import PatientsTable, { PatientsTableSkeleton } from "@/components/patient/patients-table";
import { fetchPatients } from "@/lib/events";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const patientsPromise = fetchPatients();
  return (
    <>
      <Suspense fallback={<PatientsTableSkeleton />}>
        <Await promise={patientsPromise}>{(patients) => <PatientsTable patients={patients} />}</Await>
      </Suspense>
    </>
  );
}
