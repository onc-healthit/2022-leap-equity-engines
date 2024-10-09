"use client";

import { JourneysProvider as BaseJourneysProvider } from "@healthlab/journeys";

import React from "react";
import { useFirebase } from "@healthlab/firebase";
import { useConfig } from "./config-provider";

export function JourneysProvider({ children }: React.PropsWithChildren) {
  const { auth, db } = useFirebase();
  const { backendGraphQLUrl } = useConfig();

  return (
    <BaseJourneysProvider appName="avatar-portal" auth={auth} db={db} backendGraphQLUrl={backendGraphQLUrl}>
      {children}
    </BaseJourneysProvider>
  );
}
