"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FilterValue = string | number | null | undefined;

type StateFilterController = {
  getFilter: (
    key: string,
    defaultValue?: string,
  ) => string;

  updateFilter: (
    key: string,
    value: FilterValue,
    options?:
      | {
          debounce?: number;
          resetPage?: boolean;
        }
      | number,
  ) => void;
};

interface SearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange"
  > {
  filter: StateFilterController;
  filterKey?: string;
  debounce?: number;
}

export function SearchInput({
  filter,
  filterKey = "searchTerm",
  debounce = 300,
  className,
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  const value = filter.getFilter(filterKey);

  return (
    <div
      className={cn(
        "relative w-full xl:max-w-64",
        className,
      )}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        {...props}
        type="text"
        value={value}
        onChange={(event) =>
          filter.updateFilter(
            filterKey,
            event.target.value,
            {
              debounce,
            },
          )
        }
        placeholder={placeholder}
        className="pl-9 pr-8"
      />

      {value && (
        <button
          type="button"
          onClick={() =>
            filter.updateFilter(filterKey, null)
          }
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}