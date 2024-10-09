"use client";

import { ThemeProvider } from "./theme-provider";

import { ConfigProvider } from "./config-provider";
import { config } from "@/lib/config";
import { FirebaseProvider } from "@healthlab/firebase";

import SessionProvider from "./session-provider";
import { JourneysProvider } from "./journeys-provider";
import { TooltipProvider } from "@healthlab/ui";

export type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ConfigProvider value={config}>
        <FirebaseProvider options={config.firebaseConfig}>
          <SessionProvider>
            <JourneysProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </JourneysProvider>
          </SessionProvider>
        </FirebaseProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
