import {
  JourneyCards,
  JourneyItemFragment,
  JourneysList,
  journeysQueryOptions,
  LoadingCardsSkeleton,
  useCards,
} from "@healthlab/journeys";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function JourneysView() {
  const { data, isLoading } = useQuery(journeysQueryOptions("healthlab"));
  const [selectedJourney, setSelectedJourney] = useState<JourneyItemFragment | null>(null);

  if (isLoading) {
    return <LoadingCardsSkeleton />;
  }

  if (selectedJourney) {
    return <JourneyView journey={selectedJourney} />;
  }

  return (
    <JourneysList
      onViewJourney={setSelectedJourney}
      className="flex-1"
      tenantId="healthlab"
      startedJourneys={data?.startedJourneys || []}
      eligibleJourneys={data?.eligibleJourneys || []}
    />
  );
}

function JourneyView({ journey }: { journey: JourneyItemFragment }) {
  const { cards, state } = useCards("healthlab", journey.id);
  return <JourneyCards cards={cards} journey={journey} state={state} />;
}
