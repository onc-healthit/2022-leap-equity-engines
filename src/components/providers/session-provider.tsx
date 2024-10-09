import { AuthProvider } from "@healthlab/firebase";
import React from "react";

export default function SessionProvider({ children }: React.PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
