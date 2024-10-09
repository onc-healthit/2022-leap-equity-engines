import Await from "@/components/await";
import { fetchPatient } from "@/lib/events";
import { Suspense } from "react";
import { Patient as PatientModel } from "@/lib/types";
import { Skeleton } from "@healthlab/ui";

function PatientContent({ patient }: { patient: PatientModel }) {
  return (
    <h3 className="text-2xl font-semibold leading-none tracking-tight">
      {patient.first_name} {patient.last_name}
    </h3>
  );
}

function PatientContentSkeleton() {
  return <Skeleton className="h-8 w-20" />;
}

export default function Patient({ params }: { params: { id: string } }) {
  const patientPromise = fetchPatient(params.id);

  return (
    <>
      <Suspense fallback={<PatientContentSkeleton />}>
        <Await promise={patientPromise}>{(patient) => <PatientContent patient={patient} />}</Await>
      </Suspense>
    </>
  );
}
