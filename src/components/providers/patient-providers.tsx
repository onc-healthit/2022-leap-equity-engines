"use client";

import { SearchProvider } from "./search-provider";

export default function PatientProviders({ children, patientId }: { children: React.ReactNode; patientId: string }) {
  return <SearchProvider patientId={patientId}>{children}</SearchProvider>;
}
