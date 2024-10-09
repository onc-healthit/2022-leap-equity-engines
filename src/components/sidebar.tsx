"use client";

import { Card, CardContent } from "@healthlab/ui";

export type SidebarProps = {
  children: React.ReactNode;
};

function Sidebar({ children }: SidebarProps) {
  return (
    <nav className="flex flex-col gap-2 lg:min-w-[250px] md:min-w-[150px]">
      <Card>
        <div className="mt-4" />
        <CardContent className="flex flex-col gap-2">{children}</CardContent>
      </Card>
    </nav>
  );
}

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLDivElement> {}

function SidebarItem({ className, children, ...props }: SidebarItemProps) {
  return <div {...props}>{children}</div>;
}

export { Sidebar, SidebarItem };
