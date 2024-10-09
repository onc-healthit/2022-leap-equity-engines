"use client";

import { Button, Input, useToast } from "@healthlab/ui";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@healthlab/ui";

import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { ActionState } from "@/lib/types";
import { uploadDocumentFile } from "@/lib/events";

const defaultActionState: ActionState = {
  message: "",
  data: null,
  status: "unknown",
};

interface SubmitButtonProps {
  disabled: boolean;
}

const SubmitButton = ({ disabled }: SubmitButtonProps) => {
  return (
    <Button type="submit" size="sm" disabled={disabled}>
      Submit
    </Button>
  );
};

interface ImportButtonStyleProps {
  buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
  buttonText?: string;
}

interface DocumentUploadProps {
  patientId: string;
  event?: string;
}

interface WithCallback {
  callback: () => void;
}

function DocumentFileInputAction({ patientId, event, callback }: DocumentUploadProps & WithCallback) {
  const toast = useToast();

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docEvent, setDocEvent] = useState<string>(event ?? "");

  const [state, action] = useFormState<ActionState, FormData>(uploadDocumentFile, defaultActionState);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsUploading(true);

    const formData = new FormData();

    if (!files || !docEvent) {
      return;
    }

    const file = files.item(0)!;

    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("event", docEvent);
    formData.append("patientId", patientId);

    action(formData);
  };

  useEffect(() => {
    setIsUploading(false);
    if (state.status === "success") {
      toast.toast({
        variant: "default",
        title: "Upload succesfull",
        description: state.message,
      });
      callback();
    } else if (state.status === "error") {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setFiles(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, callback]);

  const changeEventValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDocEvent(event.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <Input type="hidden" name="patientId" defaultValue={patientId} />
      <Input
        type={event == null ? undefined : "hidden"}
        name="event"
        defaultValue={event}
        onChange={changeEventValue}
        placeholder="Event name"
      />
      <Input
        type="file"
        required
        onChange={(event) => {
          if (event.target.files) {
            setFiles(event.target.files);
          }
        }}
        disabled={isUploading}
        ref={fileInputRef}
      />
      <SubmitButton disabled={isUploading || docEvent === "" || files == null} />
    </form>
  );
}

export const DocumentUpload = forwardRef(function ImportEvents(
  {
    patientId,
    event,
    buttonVariant = "ghost",
    buttonText = "Upload File",
  }: DocumentUploadProps & ImportButtonStyleProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [openDialog, setOpenDialog] = useState(false);

  const importCallback = () => {
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="flex-shrink-0" onClick={() => setOpenDialog(true)}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full md:max-w-xl" ref={ref}>
        <DialogHeader>
          <DialogTitle>{buttonText}</DialogTitle>
          <DialogDescription>Upload a document file and create a corresponding event</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <DocumentFileInputAction event={event} patientId={patientId} callback={importCallback} />
        </div>
      </DialogContent>
    </Dialog>
  );
});
