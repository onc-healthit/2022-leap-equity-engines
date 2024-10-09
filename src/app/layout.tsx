import Header from "@/components/header";
import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import Progress from "@/components/progress";
import dynamic from "next/dynamic";
import { Toaster } from "@healthlab/ui";

const Providers = dynamic(() => import("@/components/providers"), { ssr: false });

export const metadata: Metadata = {
  title: "Avatar Search",
  description: "Search for your medical records.",
};

export type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Progress />
          <Header />
          <main className="container mx-auto my-8 flex flex-row gap-4 justify-center">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
