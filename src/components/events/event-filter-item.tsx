"use client";
import { ChevronsUpDown } from "lucide-react";
import { SidebarItem } from "../sidebar";
import { Button } from "@healthlab/ui";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@healthlab/ui";
import { useState } from "react";
import { EventFilter } from "@/lib/types";
import { useSearchContext } from "../providers/search-provider";
import { cn } from "@/lib/utils";

export default function FilterItem({ filter }: { filter: EventFilter }) {
  const [isOpen, setIsOpen] = useState(true);
  const { searchState, setSearchState } = useSearchContext();

  const onSelectFilter = (filter: string, query: string) => {
    // Allow toggling the filter off
    if (searchState.filter === filter && searchState.query === query) {
      setSearchState({ filter: "", query: "" });
    } else {
      setSearchState({ filter, query });
    }
  };

  return (
    <SidebarItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between space-x-4">
          <h4 className="text-md font-semibold">{filter.display_name}</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-3">
          {filter.terms.map((value) => (
            <div
              key={value.name}
              className={cn(
                "px-4 text-sm hover:underline cursor-pointer",
                filter.name === searchState.filter && value.query === searchState.query && "font-semibold",
              )}
              onClick={() => onSelectFilter(filter.name, value.query)}
            >
              {value.display_name}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </SidebarItem>
  );
}
