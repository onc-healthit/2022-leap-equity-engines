"use client";

import { ClusterMap, SortMode } from "@/lib/types";
import React, { createContext } from "react";
import { ViewMode } from "../events/events-view-mode";
import { createUrl } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export type SearchState = {
  query: string;
  filter: string;
  page: number;
};

export type SearchProviderData = {
  searchState: SearchState;
  pinnedClusters: ClusterMap;
  viewMode: ViewMode;
  sortMode: SortMode;

  setSearchState: (state: Partial<SearchState>) => void;
  setPinnedClusters: (events: ClusterMap) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
};

const SearchContext = createContext<SearchProviderData>({
  searchState: { query: "", filter: "", page: 1 },
  pinnedClusters: {},
  viewMode: "timeline",
  sortMode: "date",
  setSearchState: () => {},
  setPinnedClusters: () => {},
  setViewMode: () => {},
  setSortMode: () => {},
});

export const SearchProvider = ({ children, patientId }: { children: React.ReactNode; patientId: string }) => {
  const [pinnedEvents, setPinnedEvents] = React.useState<ClusterMap>({});
  const [viewMode, setViewMode] = React.useState<ViewMode>("timeline");
  const [sortMode, setSortMode] = React.useState<SortMode>("date");
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchState: SearchState = {
    query: searchParams.get("q") || "",
    filter: searchParams.get("f") || "",
    page: parseInt(searchParams.get("p") || "1"),
  };

  const setSearchState = (state: Partial<SearchState>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (state.query) newParams.set("q", state.query);
    else newParams.delete("q");
    if (state.filter) newParams.set("f", state.filter);
    else newParams.delete("f");

    // This should be a query parameter but we need to first implement server-side pagination.
    // After moving the sorting functins from client-side as well.
    if (state.page) newParams.set("p", state.page.toString());
    else newParams.delete("p");

    router.push(createUrl(`/patient/${patientId}`, newParams), {
      scroll: false,
    });
  };

  return (
    <SearchContext.Provider
      value={{
        searchState,
        pinnedClusters: pinnedEvents,
        setPinnedClusters: setPinnedEvents,
        viewMode,
        setViewMode,
        sortMode,
        setSortMode,
        setSearchState,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = React.useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};

export const useSearchState = () => {
  const { searchState, setSearchState } = useSearchContext();
  return { searchState, setSearchState };
};
