import PatientProviders from "@/components/providers/patient-providers";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Avatar Search Patients",
  description: "Search for patient medical records.",
};

export type DashboardLayoutProps = {
  children: React.ReactNode;
  events: React.ReactNode;
  filters: React.ReactNode;
  patient: React.ReactNode;
  params: {
    id: string;
  };
};

export default async function PatientLayout({ children, events, filters, params, patient }: DashboardLayoutProps) {
  return (
    <PatientProviders patientId={params.id}>
      <div className="flex flex-col gap-4 min-w-0 w-full">
        {patient}
        <div className="flex flex-row gap-4 min-w-0">
          <div className="hidden md:block">{filters}</div>
          <div className="flex flex-col gap-4 min-w-0 w-full">
            {children}
            {events}
          </div>
        </div>
      </div>
    </PatientProviders>
  );
}
