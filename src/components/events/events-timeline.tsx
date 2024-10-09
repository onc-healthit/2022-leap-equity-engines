"use client";

import { ClusterMap, EventCluster, RawEventType, SortMode } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useToast,
} from "@healthlab/ui";
import { getNormalRangeDeviation, getTrend, round } from "@/lib/utils";
import IndicatorChart from "../chart/indicator-chart";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@healthlab/ui";
import { Button } from "@healthlab/ui";
import { ForwardedRef, forwardRef, useEffect, useMemo, useOptimistic, useState } from "react";
import { useSearchContext, useSearchState } from "../providers/search-provider";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Pin,
  Star,
  TestTube2,
  FileText,
  Pill,
  User,
  EllipsisVertical,
} from "lucide-react";
import { disableLineEvent, favoriteEvent, getDocumentData, getMedlineUrl, removeEvents } from "@/lib/events";
import EventTrendIndicator from "./event-trend";
import WithIcon from "../with-icon";
import { Separator } from "@healthlab/ui";
import { Pagination } from "@healthlab/ui";
import EventChart from "../chart/event-chart";
import EventsSummary from "./events-summary";
import { AddToGroup, RemoveGrop } from "./events-group";
import { ImportEvents } from "./events-import";
import BigDataValueChart from "../chart/big-data-value-chart";
import { GenericFileViewer, GenericFileViewerSkeleton } from "@ui/components";
import { config } from "@/lib/config";
import LoadingValueChart from "../chart/loading-value-chart";
import { DocumentUpload } from "../documents/documents-upload";

export type TimelineItemProps = {
  patientId: string;
  cluster: EventCluster;
  clusters: EventCluster[];
  isPinned?: boolean;
  onPinStateChanged?: (event: EventCluster, pinned: boolean) => void;
  query: string;
  filter: string;
};

const FavoriteButton = ({
  patientId,
  isFavorite,
  event,
}: {
  patientId: string;
  isFavorite: boolean;
  event: string;
}) => {
  const toast = useToast();
  const [isFavoriteOptimistic, setFavoriteOptimistic] = useOptimistic(isFavorite);

  async function formAction(_: FormData) {
    setFavoriteOptimistic((state) => !state);
    const result = await favoriteEvent(patientId, event, !isFavoriteOptimistic);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  return (
    <form action={formAction}>
      <Button type="submit" size="icon" variant="ghost" aria-label={isFavoriteOptimistic ? "Unfavorite" : "Favorite"}>
        {isFavoriteOptimistic ? <Star fill="orange" strokeWidth={0} width={16} /> : <Star width={16} />}
      </Button>
    </form>
  );
};

const LineButton = ({
  patientId,
  isLineDisabled,
  event,
  callback,
}: {
  patientId: string;
  isLineDisabled: boolean;
  event: string;
  callback: (action: boolean) => void;
}) => {
  const [isLineDisabledOptimistic, setLineDisabledOptimistic] = useOptimistic(isLineDisabled);

  const toast = useToast();

  async function formRequest() {
    const result = await disableLineEvent(patientId, event, !isLineDisabledOptimistic);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
      callback(isLineDisabledOptimistic);
      return;
    }
    callback(!isLineDisabledOptimistic);
  }

  function formAction() {
    setLineDisabledOptimistic((state: boolean) => !state);
    formRequest();
  }

  return (
    <form action={formAction}>
      <Button
        type="submit"
        className="flex-shrink-0 w-full"
        variant="ghost"
        aria-label={isLineDisabledOptimistic ? "Enable Line" : "Disable Line"}
      >
        {isLineDisabledOptimistic ? "Enable Line" : "Disable Line"}
      </Button>
    </form>
  );
};

export const RemoveEvents = forwardRef(function RemoveGrop(
  { patientId, event }: { patientId: string; event: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const onRemoveEvents = async () => {
    setIsRemoving(true);
    const result = await removeEvents(patientId, event);
    if (result.status === "error") {
      toast.toast({ variant: "destructive", title: "Error", description: result.message });
    } else {
      toast.toast({ variant: "default", title: "Success", description: "Events removed!" });
    }
    setIsRemoving(false);
  };

  return (
    <Button disabled={isRemoving} variant="ghost" className="flex-shrink-0" onClick={onRemoveEvents}>
      Remove Events
    </Button>
  );
});

const ItemActions = ({
  patientId,
  event,
  isGroup,
  setIsLineDisabled,
  isLineDisabled,
  type,
}: {
  type: string;
  patientId: string;
  event: string;
  isGroup: boolean;
  isLineDisabled: boolean;
  setIsLineDisabled: (value: boolean) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical width={24} className="shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Event Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2">
          {!isGroup && (
            <>
              <DropdownMenuItem asChild>
                <AddToGroup patientId={patientId} event={event} />
              </DropdownMenuItem>
              {type === RawEventType.Observation && (
                <DropdownMenuItem asChild>
                  <ImportEvents patientId={patientId} event={event} handler="/api/chat" imageSubmitType="urlLink" />
                </DropdownMenuItem>
              )}
              {type !== RawEventType.Observation && (
                <DropdownMenuItem asChild>
                  <DocumentUpload patientId={patientId} event={event} />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <LineButton
                  patientId={patientId}
                  isLineDisabled={isLineDisabled}
                  event={event}
                  callback={setIsLineDisabled}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <RemoveEvents patientId={patientId} event={event} />
              </DropdownMenuItem>
            </>
          )}
          {isGroup && (
            <DropdownMenuItem asChild>
              <RemoveGrop patientId={patientId} group={event} />
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function TimelineItem({
  patientId,
  cluster,
  clusters,
  onPinStateChanged,
  isPinned,
  query,
  filter,
}: TimelineItemProps) {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const [isLineDisabled, setIsLineDisabled] = useState(cluster.is_line_disabled);

  const [medlineUrl, setMedlineUrl] = useState<string | undefined>(undefined);

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [fileData, setFileData] = useState<Uint8Array | null>(null);

  const isBigData = useMemo(() => {
    return cluster.count > 100;
  }, [cluster]);

  const itemSelect = (event: EventCluster) => {
    if (event.file == null || event.file == "") {
      toast({ variant: "warning", title: "No File", description: "No file URL found!" });
      return;
    }
    setIsPreviewOpen(true);
    setIsOpen(true);
    setFilePreview(event.file);
  };

  useEffect(() => {
    if (isPreviewOpen && filePreview)
      (async () => {
        const data = await getDocumentData(patientId, filePreview);
        setFileData(data);
      })();
  }, [isPreviewOpen, patientId, filePreview]);

  useEffect(() => {
    (async () => {
      if (cluster.codes?.["loinc"] == null || cluster.codes?.["loinc"].length < 1) return;
      const url = await getMedlineUrl(cluster.codes["loinc"][0]);
      setMedlineUrl(url);
    })();
  }, [cluster.codes]);

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    if (cluster.type !== RawEventType.Observation && open === false) {
      setFileData(null);
      setIsPreviewOpen(false);
      setFilePreview(null);
    }
  };

  const fileUrl = useMemo(
    () => (filePreview ? `${config.backendUrl}/api/v1/document/${patientId}/${filePreview}` : undefined),
    [filePreview, patientId],
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      <Card>
        <CardHeader className="space-y-1 px-4 py-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between flex-wrap">
            <div className="flex flex-row items-center gap-2 h-10 w-full md:w-auto">
              <CardTitle className="text-nowrap text-ellipsis max-w-26 overflow-hidden">{cluster.event}</CardTitle>
              <div className="flex flex-row items-center gap-2">
                {cluster.type === RawEventType.Observation && (
                  <>
                    <CardDescription>
                      {round(cluster.value, 2)} {cluster.unit}
                    </CardDescription>
                    <EventTrendIndicator cluster={cluster} />
                  </>
                )}
              </div>
              {cluster.type === RawEventType.Observation && !isBigData && (
                <EventsSummary patientId={patientId} eventName={cluster.event} />
              )}
              {medlineUrl && (
                <Button size="icon" variant="ghost" asChild>
                  <a target="_blank" href={medlineUrl}>
                    <Info width={20} />
                  </a>
                </Button>
              )}
            </div>
            <div className="flex flex-row items-center content-between md:gap-2 self-end">
              <div className="flex flex-row items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <User width={24} className="shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Patient data source</p>
                  </TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="h-[22px]" />
                {cluster.type !== RawEventType.Observation && (
                  <>
                    <WithIcon leading spacing="sm" icon={<EventIcon event={cluster} />}>
                      {clusters.length}
                    </WithIcon>
                    <Separator orientation="vertical" className="h-[22px]" />
                  </>
                )}
              </div>
              <Toggle
                pressed={isPinned}
                aria-label="Pin item"
                onPressedChange={(state) => onPinStateChanged?.(cluster, state)}
              >
                <Pin width={16} />
              </Toggle>
              <FavoriteButton patientId={patientId} isFavorite={cluster.is_favorite} event={cluster.event} />

              <CollapsibleTrigger asChild>
                <Button
                  aria-label="Expand item"
                  variant="ghost"
                  size="icon"
                  disabled={cluster.type !== RawEventType.Observation && isPreviewOpen === false}
                >
                  {isOpen ? (
                    <ChevronUp width={24} className="shrink-0" />
                  ) : (
                    <ChevronDown width={24} className="shrink-0" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <ItemActions
                type={cluster.type}
                isGroup={cluster.is_group ?? false}
                patientId={patientId}
                event={cluster.event}
                isLineDisabled={isLineDisabled}
                setIsLineDisabled={setIsLineDisabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 py-2">
          {cluster.type !== RawEventType.Observation &&
            isPreviewOpen &&
            ((!fileData && <GenericFileViewerSkeleton />) ||
              (fileData && (
                <GenericFileViewer fileData={fileData} fileUrl={fileUrl} extenstion={filePreview?.split(".").pop()} />
              )))}
          {cluster.type === RawEventType.Observation && !isOpen && (
            <IndicatorChart name={cluster.event} cluster={cluster} isBigData={isBigData} />
          )}
          {cluster.type !== RawEventType.Observation && (
            <EventChart name={cluster.event} data={clusters} onItemSelected={itemSelect} />
          )}
          <CollapsibleContent>
            {cluster.type === RawEventType.Observation &&
              ((!isBigData && (
                <LoadingValueChart
                  eventName={cluster.event}
                  patientId={patientId}
                  syncId="valueSync"
                  disableLine={isLineDisabled}
                  isGroup={cluster.is_group}
                  query={query}
                  filter={filter}
                />
              )) ||
                (isBigData && (
                  <BigDataValueChart initialCluster={cluster} syncId="valueSync" disableLine={isLineDisabled} />
                )))}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

const EventIcon = ({ event }: { event: EventCluster }) => {
  if (event.type === RawEventType.Observation) {
    return <TestTube2 width={20} />;
  } else if (event.type === RawEventType.Document) {
    return <FileText width={20} />;
  } else if (event.type === RawEventType.Medication) {
    return <Pill width={20} />;
  }
  return null;
};

export type TimelineItemData = {
  key: string;
  event: EventCluster;
  events: EventCluster[];
};

export type EventsTimelineProps = {
  patientId: string;
  clusters: EventCluster[];
  query: string;
  filter: string;
};

function getTimelineData(clustersMap: ClusterMap, sort: SortMode): TimelineItemData[] {
  return Object.entries(clustersMap)
    .map(([key, events]) => ({ key, events, event: events[events.length - 1] }))
    .sort((a, b) => {
      if (sort === "deviation") {
        return getNormalRangeDeviation(b.event) - getNormalRangeDeviation(a.event);
      } else if (sort === "favorability") {
        return getTrend(b.events) - getTrend(a.events);
      } else if (sort === "unfavorability") {
        return getTrend(a.events) - getTrend(b.events);
      } else {
        return b.event.ts - a.event.ts;
      }
    });
}

function getEventsMap(events: EventCluster[]): ClusterMap {
  return events.reduce((acc, event) => {
    if (!acc[event.event]) {
      acc[event.event] = [];
    }
    acc[event.event].push(event);
    return acc;
  }, {} as ClusterMap);
}

const itemsPerPage = 10;

export default function EventsTimeline({ patientId, clusters, query, filter }: EventsTimelineProps) {
  const { pinnedClusters, setPinnedClusters, sortMode } = useSearchContext();
  const { searchState, setSearchState } = useSearchState();
  const eventsMap = useMemo(() => getEventsMap(clusters), [clusters]);
  const timelineData = useMemo(() => getTimelineData(eventsMap, sortMode), [eventsMap, sortMode]);
  const filteredEvents = useMemo(
    () => timelineData.filter((data) => !pinnedClusters[data.key]),
    [pinnedClusters, timelineData],
  );

  const onPinStateChanged = (event: EventCluster, pinned: boolean) => {
    if (pinned) {
      setPinnedClusters({ ...pinnedClusters, [event.event]: eventsMap[event.event] });
    } else {
      const { [event.event]: _, ...rest } = pinnedClusters;
      setPinnedClusters(rest);
    }
  };

  const page = searchState.page;
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const itemsForPage = useMemo(
    () => filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [page, filteredEvents],
  );

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(pinnedClusters).map(([_, clusters]) => (
        <TimelineItem
          patientId={patientId}
          key={clusters[clusters.length - 1].id}
          cluster={clusters[clusters.length - 1]}
          clusters={clusters}
          isPinned={true}
          onPinStateChanged={onPinStateChanged}
          query={query}
          filter={filter}
        />
      ))}
      {itemsForPage.map((data) => (
        <TimelineItem
          patientId={patientId}
          key={data.event.id}
          cluster={data.event}
          clusters={data.events}
          isPinned={!!pinnedClusters[data.key]}
          onPinStateChanged={onPinStateChanged}
          query={query}
          filter={filter}
        />
      ))}
      <Pagination
        className="self-center"
        page={page}
        onPageChange={(page) => setSearchState({ ...searchState, page: page })}
        totalPages={totalPages}
      />
    </div>
  );
}
