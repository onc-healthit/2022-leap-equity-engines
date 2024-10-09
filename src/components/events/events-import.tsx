import { Button, Input, InputWithButton, useToast } from "@healthlab/ui";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@healthlab/ui";

import { ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";
import { useFormState } from "react-dom";
import { ActionState, PatientEventBase } from "@/lib/types";
import { importEventData, uploadPublicFile } from "@/lib/events";
import { Bot, SendHorizontal, User } from "lucide-react";
import Markdown from "react-markdown";
import { cn, extractJsonFromMarkdown, toBase64 } from "@/lib/utils";
import Avatar from "../avatar";
import { useAuth } from "@healthlab/firebase";
import { Skeleton } from "@healthlab/ui";

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

interface ImportEventsProps {
  patientId: string;
  event?: string;
  handler: string;
  imageSubmitType: "base64" | "urlLink";
}

interface WithCallback {
  callback: () => void;
}

interface ChatBubbleProps {
  message: string;
  role: "user" | "assistant";
  userImage: string | null | undefined;
}

function ChatBubbleSkeleton({ role }: { role: "user" | "assistant" }) {
  return (
    <div className={cn("flex gap-4 px-1 w-11/12", role === "user" ? "flex-row-reverse" : "flex-row")}>
      <Skeleton className="h-7 w-7 rounded-full"></Skeleton>
      <Skeleton className="rounded-2xl h-7 w-80"></Skeleton>
    </div>
  );
}

function ChatBubble({ message, role, userImage }: ChatBubbleProps) {
  return (
    <div className={cn("flex gap-4 px-1", role === "user" ? "flex-row-reverse" : "flex-row")}>
      <div className="flex min-w-7 h-7 w-7 justify-center overflow-hidden rounded-full outline outline-1 mt-1">
        <div className="relative rounded-sm flex items-center justify-center h-7 w-7">
          {role === "assistant" ? (
            <Bot width={22} height={22} />
          ) : userImage ? (
            <Avatar className="h-7 w-7" src={userImage} alt="User Avatar" />
          ) : (
            <User width={22} height={22} />
          )}
        </div>
      </div>

      <span className="rounded-2xl bg-muted py-2 px-4 text-sm">{message}</span>
    </div>
  );
}

function FileInputAction({ patientId, event, callback, handler, imageSubmitType }: ImportEventsProps & WithCallback) {
  const toast = useToast();
  const user = useAuth();

  const { messages, input, handleSubmit, handleInputChange, isLoading, append } = useChat({
    api: handler,
  });

  const [isSubmittedFile, setIsSubmittedFile] = useState<boolean>(false);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isFinal, setIsFinal] = useState<boolean>(false);

  const [eventName, setEventName] = useState<string>(event ?? "");

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, action] = useFormState<ActionState, FormData>(uploadPublicFile, defaultActionState);

  const lastMessage = useMemo(() => {
    const filteredMessages = messages.filter((message) => message.role !== "user");
    if (filteredMessages.length < 1) {
      return null;
    }
    return filteredMessages[filteredMessages.length - 1];
  }, [messages]);

  const messagesWithoutJson = useMemo(() => {
    return messages.filter((message) => !message.content.startsWith("```json") && message.content !== "");
  }, [messages]);

  const jsonData: PatientEventBase[] = useMemo(() => {
    if (isFinal && !isLoading) {
      return extractJsonFromMarkdown(lastMessage!.content);
    }
    return [];
  }, [isFinal, lastMessage, isLoading]);

  const sendData = async () => {
    const result = await importEventData(patientId, jsonData, eventName);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
      setIsUploading(false);
    } else {
      callback();
    }
  };

  const handleURLFile = (file: File) => {
    if (!isSubmittedFile && !isFinal) {
      setIsFinal(false);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", patientId);
      formData.append("event", eventName);

      setIsUploading(true);

      action(formData);
    }
  };

  const handleBase64File = async (file: File) => {
    const base64File = await toBase64(file);

    append({
      role: "user",
      content: "",
      experimental_attachments: [{ name: file.name, url: base64File }],
    });

    setIsUploading(false);
    setIsSubmittedFile(true);
    setFiles(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!files) {
      if (isFinal) {
        setIsUploading(true);
        sendData();
      }
      return;
    }

    const file = files.item(0)!;

    switch (imageSubmitType) {
      case "urlLink":
        handleURLFile(file);
        break;

      case "base64":
        handleBase64File(file);
        break;
    }
  };

  const sendMessage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    handleSubmit(event);
  };

  useEffect(() => {
    setIsUploading(false);
    if (state.status === "success") {
      const url: string = state.data.url;
      const attachements = [{ name: url.split("/").pop(), url: url, contentType: "image/*" }];

      append({
        role: "user",
        content: "",
        experimental_attachments: attachements,
      });

      setIsSubmittedFile(true);
      setFiles(undefined);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (state.status === "error") {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });

      setIsSubmittedFile(false);
      setFiles(undefined);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.content.startsWith("```json")) {
      setIsFinal(true);
    } else {
      setIsFinal(false);
    }
  }, [lastMessage]);

  const changeEventValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEventName(event.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <Input type="hidden" name="patientId" defaultValue={patientId} />
      <Input
        type={event == null && !isSubmittedFile && imageSubmitType !== "base64" ? undefined : "hidden"}
        name="event"
        defaultValue={event}
        onChange={changeEventValue}
        placeholder="Event name"
        disabled={isUploading}
      />
      <Input type="hidden" name="event" defaultValue={event} />
      {!isSubmittedFile && (
        <Input
          type="file"
          required
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          disabled={isLoading || isUploading}
          ref={fileInputRef}
        />
      )}
      {isSubmittedFile && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-scroll py-4 max-w-full">
            {messagesWithoutJson &&
              messagesWithoutJson.length > 0 &&
              !isFinal &&
              messagesWithoutJson.map((message) => (
                <ChatBubble
                  userImage={message.role === "user" ? user?.user?.photoURL : null}
                  role={message.role === "user" ? "user" : "assistant"}
                  key={message.id}
                  message={message.content}
                />
              ))}
            {isFinal && (
              <div className="flex flex-col">
                <span className="text-sm">Data Preview</span>
                <Markdown>{lastMessage?.content}</Markdown>
              </div>
            )}
            {imageSubmitType === "base64" && isLoading && (
              <ChatBubbleSkeleton
                role={lastMessage ? (lastMessage.role === "user" ? "assistant" : "user") : "assistant"}
              />
            )}
          </div>
          <InputWithButton
            type="text"
            placeholder="Send message..."
            icon={SendHorizontal}
            value={input}
            onChange={handleInputChange}
            disabled={isLoading || isUploading || imageSubmitType === "base64"}
            buttonClick={sendMessage}
          />
        </div>
      )}
      {!(imageSubmitType === "base64" && isSubmittedFile) && (
        <SubmitButton
          disabled={
            isLoading ||
            isUploading ||
            (!isFinal && isSubmittedFile) ||
            (imageSubmitType === "base64" && isSubmittedFile) ||
            (imageSubmitType !== "base64" && !isSubmittedFile && eventName === "")
          }
        />
      )}
    </form>
  );
}

export const ImportEvents = forwardRef(function ImportEvents(
  {
    patientId,
    event,
    handler,
    imageSubmitType,
    buttonVariant = "ghost",
    buttonText = "Import",
  }: ImportEventsProps & ImportButtonStyleProps,
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
          <DialogDescription>Import data points using AI to the event {event}.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <FileInputAction
            event={event}
            patientId={patientId}
            callback={importCallback}
            handler={handler}
            imageSubmitType={imageSubmitType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});
