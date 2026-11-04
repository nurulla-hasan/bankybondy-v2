"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
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
  onSearchChange?: (val: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

/**
 * Official Shadcn Base UI Combobox with Multiple Selection & Chips
 * Grounded in `@base-ui/react/combobox` as specified in https://ui.shadcn.com/docs/components/base/combobox
 */
export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  onSearchChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: MultiSelectProps) {
  const popupRef = React.useRef<HTMLDivElement | null>(null);

  const { sentinelRef } = useInfiniteScroll({

    onLoadMore: onLoadMore || (() => {}),
    hasMore,
    isLoading: isLoadingMore,
    rootMargin: "80px",
    rootRef: popupRef,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 60) {
      onLoadMore();
    }
  };

  return (
    <ComboboxPrimitive.Root
      multiple
      value={selected}
      onValueChange={(val) => {
        onChange?.((val as string[]) || []);
      }}
      onInputValueChange={(searchVal) => {
        onSearchChange?.(searchVal);
      }}
      disabled={disabled}
      filter={null}
      onOpenChange={(open, eventDetails) => {
        if (!open && eventDetails?.reason === "item-press") {
          eventDetails.cancel();
        }
      }}
    >
      <ComboboxPrimitive.InputGroup
        data-slot="combobox-trigger"
        className={cn(
          "flex min-h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/20 cursor-text",
          className
        )}
      >
        <ComboboxPrimitive.Chips className="flex flex-wrap gap-1.5 items-center flex-1">
          {selected.length === 0 ? (
            <span className="text-muted-foreground select-none pointer-events-none text-sm">
              {placeholder}
            </span>
          ) : (
            selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <ComboboxPrimitive.Chip
                  key={val}
                  render={
                    <Badge
                      variant="secondary"
                      className="gap-1 py-0.5 px-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
                    />
                  }
                >
                  <span>{opt?.label || val}</span>
                  <ComboboxPrimitive.ChipRemove
                    nativeButton={false}
                    onClick={() => {
                      onChange?.(selected.filter((item) => item !== val));
                    }}
                    render={
                      <span className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer inline-flex items-center justify-center">
                        <XIcon className="size-3" />
                      </span>
                    }
                  />
                </ComboboxPrimitive.Chip>
              );
            })
          )}
          <ComboboxPrimitive.Input
            className="flex-1 min-w-16 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            placeholder={selected.length === 0 ? "" : "..."}
          />
        </ComboboxPrimitive.Chips>

        <ComboboxPrimitive.Trigger
          render={
            <button
              type="button"
              className="p-1 hover:bg-muted/50 rounded cursor-pointer text-muted-foreground shrink-0"
              aria-label="Toggle options"
            >
              <ChevronDownIcon className="size-4" />
            </button>
          }
        />
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50 w-(--anchor-width) min-w-(--anchor-width) max-w-(--anchor-width)"
        >
          <ComboboxPrimitive.Popup
            ref={popupRef}
            onScroll={handleScroll}
            data-slot="combobox-popup"
            className="relative isolate z-50 max-h-60 w-(--anchor-width) min-w-full overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none duration-100 overscroll-contain"
          >
            {options.length === 0 && !isLoadingMore && (
              <div className="py-2 px-3 text-xs text-muted-foreground text-center">
                No options found
              </div>
            )}





            <ComboboxPrimitive.List className="flex flex-col gap-0.5">
              {options.map((option, idx) => {
                const isSelected = selected.includes(option.value);
                return (
                  <ComboboxPrimitive.Item
                    key={`${option.value}-${idx}`}
                    value={option.value}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center justify-between rounded-md py-1.5 pr-2.5 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                      isSelected && "font-medium text-primary"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    <ComboboxPrimitive.ItemIndicator>
                      <CheckIcon className="size-4 text-primary shrink-0 ml-2" />
                    </ComboboxPrimitive.ItemIndicator>
                  </ComboboxPrimitive.Item>

                );
              })}

              {/* Infinite Scroll Sentinel Node */}
              {hasMore && (
                <div ref={sentinelRef} className="py-2.5 flex items-center justify-center">
                  {isLoadingMore ? (
                    <Spinner className="size-4 text-primary" />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onLoadMore?.();
                      }}
                      className="text-xs text-primary font-medium hover:underline cursor-pointer py-1"
                    >
                      Load more skills...
                    </button>
                  )}
                </div>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}

export default MultiSelect;


