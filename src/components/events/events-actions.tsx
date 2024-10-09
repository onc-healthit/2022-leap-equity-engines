"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/main";
import { EllipsisVertical } from "lucide-react";
import { DocumentUpload } from "../documents/documents-upload";
import { EventsGroup } from "./events-group";
import { ImportEvents } from "./events-import";

export interface EventsExtraProps {
  patientId: string;
}

export function EventsExtra({ patientId }: EventsExtraProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-auto">
        <EllipsisVertical width={24} className="shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2">
          <DropdownMenuItem asChild>
            <EventsGroup patientId={patientId} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ImportEvents
              patientId={patientId}
              handler="/api/snomed_import"
              imageSubmitType="base64"
              buttonText="Import Labs"
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <DropdownMenuItem asChild>
              <ImportEvents
                patientId={patientId}
                handler="/api/chat"
                imageSubmitType="urlLink"
                buttonText="Import Event"
              />
            </DropdownMenuItem>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <DocumentUpload patientId={patientId} />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
