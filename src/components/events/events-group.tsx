"use client";

import { addToGroup, createGroup, fetchGroups, removeGroup } from "@/lib/events";
import { Button, Input, useToast } from "@healthlab/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@healthlab/ui";

import { ForwardedRef, forwardRef, useEffect, useState } from "react";
import { Group } from "@/lib/types";
import { Skeleton } from "@healthlab/ui";
import { ComboBox, ComboboxValue } from "@healthlab/ui";

const NewGroup = ({ patientId }: { patientId: string }) => {
  const toast = useToast();

  async function formAction(data: FormData) {
    const groupName = data.get("groupName")?.toString();
    if (!groupName) return;

    const result = await createGroup(patientId, groupName);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
    } else {
      toast.toast({ variant: "default", title: "Success", description: "Group created!" });
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input type="text" name="groupName" required />
      <DialogClose asChild>
        <Button variant="secondary" type="submit">
          Create
        </Button>
      </DialogClose>
    </form>
  );
};

function EventGroupsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 my-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

function EventGroups({ patientId, event }: { patientId: string; event: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [group, setGroup] = useState<Group | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await fetchGroups(patientId);
        setGroups(result ?? []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [patientId]);

  if (isLoading) {
    return <EventGroupsSkeleton />;
  }

  const values: ComboboxValue[] = groups.map((group) => ({
    value: group.name,
    label: group.name,
  }));

  const value: ComboboxValue | undefined = group ? { value: group.name, label: group.name } : undefined;

  const onGroupChange = (value?: ComboboxValue) => {
    setGroup(() => groups.find((g) => g.name == value?.value));
  };

  const onConfirm = async () => {
    if (!group) return;

    const result = await addToGroup(patientId, group.name, event);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
    } else {
      toast.toast({ variant: "default", title: "Success", description: "Event added to group!" });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      <ComboBox
        name="group"
        values={values}
        value={value}
        onChange={onGroupChange}
        placeholder="Select virtual group"
        className="w-full"
      />
      <DialogClose asChild>
        <Button disabled={!group} onClick={onConfirm}>
          Select
        </Button>
      </DialogClose>
    </div>
  );
}

export const AddToGroup = forwardRef(function AddToGroup(
  { patientId, event }: { patientId: string; event: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex-shrink-0">
          Add to Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full md:max-w-xl" ref={ref}>
        <DialogHeader>
          <DialogTitle>Add Event to Virtual Group</DialogTitle>
          <DialogDescription>Add the event to an existing virtual group.</DialogDescription>
        </DialogHeader>
        <EventGroups patientId={patientId} event={event} />
      </DialogContent>
    </Dialog>
  );
});

export const RemoveGrop = forwardRef(function RemoveGrop(
  { patientId, group }: { patientId: string; group: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const onRemoveGroup = async () => {
    setIsRemoving(true);
    const result = await removeGroup(patientId, group);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
    } else {
      toast.toast({ variant: "default", title: "Success", description: "Group removed!" });
    }
    setIsRemoving(false);
  };

  return (
    <Button disabled={isRemoving} variant="ghost" className="flex-shrink-0" onClick={onRemoveGroup}>
      Remove Group
    </Button>
  );
});

export type EventsGroupProps = {
  patientId: string;
};

export function EventsGroup({ patientId }: EventsGroupProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex-shrink-0 w-full md:w-auto">
          + Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Virtual Group</DialogTitle>
          <DialogDescription>
            Create a new virtual group that allows you to group related events together.
          </DialogDescription>
        </DialogHeader>
        <NewGroup patientId={patientId} />
      </DialogContent>
    </Dialog>
  );
}
