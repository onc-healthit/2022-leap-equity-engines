"use client";

import { useEffect, useState } from "react";
import { Autocomplete } from "@healthlab/ui";
import debounce from "lodash.debounce";
import { fetchEventsSuggestions } from "@/lib/events";
import { useSearchContext } from "./providers/search-provider";

export type SearchProps = {
  patientId: string;
};

export default function EventSearch({ patientId }: SearchProps) {
  const { searchState, setSearchState } = useSearchContext();

  const [value, setValue] = useState(searchState.query);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const search = debounce(async (value: string) => {
    const result = await fetchEventsSuggestions(patientId, value);
    setSuggestions(result);
  }, 200);

  const onChange = async (value: string) => {
    setValue(value);
    search(value);
  };

  const onSelect = (value?: string) => {
    setValue(value || "");
    setSearchState({ query: value || "", filter: "" });
  };

  useEffect(() => {
    search(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValue(searchState.query);
  }, [searchState.query]);

  return (
    <Autocomplete
      placeholder="Search for lab results..."
      value={value}
      onChangeValue={onChange}
      onSelectOption={onSelect}
      options={suggestions}
      className="w-full md:w-[600px] rounded-lg border shadow-md"
    />
  );
}
