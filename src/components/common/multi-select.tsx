"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Spinner } from "@/components/ui/spinner";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

/**
 * Modern Base UI MultiSelect Component
 * Grounded in `@base-ui/react/select` v1.9 with `multiple` prop support.
 * Features:
 * - Unstyled, fully accessible Base UI primitive
 * - Tag/Badge chips for selected items with remove actions
 * - Infinite scroll support using `useInfiniteScroll`
 */
export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: MultiSelectProps) {
  const handleRemove = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange?.(selected.filter((item) => item !== val));
  };

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore,
    isLoading: isLoadingMore,
    rootMargin: "50px",
  });

  return (
    <SelectPrimitive.Root
      multiple
      value={selected}
      onValueChange={(newVal) => {
        onChange?.(newVal as string[]);
      }}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={cn(
          "flex min-h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-1.5 pr-2.5 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive cursor-pointer dark:bg-input/20",
          className
        )}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <Badge
                  key={val}
                  variant="secondary"
                  className="gap-1 py-0.5 px-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
                >
                  <span>{opt?.label || val}</span>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => handleRemove(e, val)}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>

        <SelectPrimitive.Icon
          render={
            <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground shrink-0" />
          }
        />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50 w-(--anchor-width)"
        >
          <SelectPrimitive.Popup
            data-slot="select-content"
            className="relative isolate z-50 max-h-60 w-full min-w-36 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none duration-100"
          >
            <SelectPrimitive.List className="flex flex-col gap-0.5">
              {options.length === 0 && !isLoadingMore ? (
                <div className="py-1 px-3 text-xs text-muted-foreground text-center">
                  No options available
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className={cn(
                        "relative flex w-full cursor-pointer items-center justify-between rounded-md py-1.5 pr-2.5 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                        isSelected && "font-medium text-primary"
                      )}
                    >
                      <SelectPrimitive.ItemText className="truncate">
                        {option.label}
                      </SelectPrimitive.ItemText>
                      {isSelected && (
                        <CheckIcon className="size-4 text-primary shrink-0 ml-2" />
                      )}
                    </SelectPrimitive.Item>
                  );
                })
              )}

              {/* Infinite Scroll Sentinel Node */}
              {hasMore && (
                <div ref={sentinelRef} className="py-2 flex items-center justify-center">
                  {isLoadingMore ? (
                    <Spinner className="size-4 text-primary" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Load more...</span>
                  )}
                </div>
              )}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export default MultiSelect;


