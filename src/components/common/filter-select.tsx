"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FilterValue = string | number | null | undefined;

type StateFilterController = {
  getFilter: (key: string, defaultValue?: string) => string;
  updateFilter: (key: string, value: FilterValue) => void;
};

export interface FilterOption {
  label: string;
  value: string | number;
}

export type FilterOptionItem = FilterOption | string | number;

export interface FilterSelectProps {
  filter: StateFilterController;
  filterKey: string;
  placeholder?: string;
  defaultValue?: string;
  options: readonly FilterOptionItem[] | FilterOptionItem[];
  className?: string;
  align?: "start" | "center" | "end";
}

export function FilterSelect({
  filter,
  filterKey,
  placeholder = "Select...",
  defaultValue,
  options,
  className,
  align = "end",
}: FilterSelectProps) {
  const hasAll = options.some(
    (opt) => (typeof opt === "object" ? String(opt.value) : String(opt)) === "all"
  );
  const rawValue = filter.getFilter(filterKey, defaultValue);
  const value = rawValue || (hasAll ? "all" : null);

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        filter.updateFilter(filterKey, !val || val === "all" ? null : val);
      }}
    >
      <SelectTrigger className={cn("cursor-pointer", className)}>
        <SelectValue placeholder={placeholder}>
          {(val) => {
            if (!val || val === "all") {
              return placeholder;
            }
            const found = options.find((opt) =>
              typeof opt === "object" ? String(opt.value) === val : String(opt) === val
            );
            return typeof found === "object"
              ? found.label
              : found
                ? String(found)
                : placeholder;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align={align}>
        {options.map((opt) => {
          const itemValue = typeof opt === "object" ? String(opt.value) : String(opt);
          const itemLabel =
            typeof opt === "object"
              ? opt.label
              : itemValue === "all"
                ? placeholder || "All"
                : String(opt);

          return (
            <SelectItem key={itemValue} value={itemValue} className="cursor-pointer">
              {itemLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
