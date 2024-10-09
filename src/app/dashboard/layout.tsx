import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Avatar Search Dashboard",
  description: "View and manage patient medical records.",
};

export type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col gap-4 min-w-0 w-full">
      <div>
        <h1 className="text-2xl font-semibold">Patients</h1>
      </div>
      {children}
    </div>
  );
}
