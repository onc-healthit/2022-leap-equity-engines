"use client";

import { Button, Input, useToast } from "@healthlab/ui";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { ActionState } from "@/lib/types";
import { ingestFile } from "@/lib/events";
import { Checkbox } from "@healthlab/ui";
import { ComboBox, ComboboxValue } from "@healthlab/ui";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      Submit
    </Button>
  );
};

const defaultActionState: ActionState = {
  message: "",
  data: null,
  status: "unknown",
};

export type DataIngestionProps = {
  patientId: string;
};

const ingestionTypes: ComboboxValue[] = [
  { value: "universal", label: "Universal" },
  { value: "fhir", label: "FHIR" },
  { value: "twisle", label: "Twisle" },
];

export default function DataIngestion({ patientId }: DataIngestionProps) {
  const toast = useToast();
  const [ingestionType, setIngestionType] = useState<ComboboxValue>();
  const [state, action] = useFormState<ActionState, FormData>(ingestFile, defaultActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.toast({
        title: "Success",
        description: state.message,
      });
    } else if (state.status === "error") {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-2">
      <Input type="hidden" name="patientId" defaultValue={patientId} />
      <Input type="file" name="file" required />
      <div className="flex items-center gap-4">
        <ComboBox
          name="ingestionType"
          value={ingestionType}
          values={ingestionTypes}
          onChange={setIngestionType}
          placeholder="Select data type..."
        />
        <div className="flex items-center space-x-2">
          <Checkbox id="erase" name="erase" />
          <label
            htmlFor="erase"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none"
          >
            Erase existing data
          </label>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
