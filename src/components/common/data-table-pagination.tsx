"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { cn } from "@/lib/utils";
import CustomPagination from "./custom-pagination";

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type FilterValue = string | number | null | undefined;

type StateFilterController<T extends string> = {
  updateFilter: (
    key: T,
    value: FilterValue,
    options?:
      | {
          debounce?: number;
          resetPage?: boolean;
        }
      | number,
  ) => void;
};

interface DataTablePaginationProps<
  TData,
  TFilterKey extends string = string,
> {
  table: Table<TData>;
  meta?: PaginationMeta;

  /**
   * Required when pagination is server-side.
   */
  filter?: StateFilterController<TFilterKey>;

  paginationKey?: TFilterKey;
}

export function DataTablePagination<
  TData,
  TFilterKey extends string = string,
>({
  table,
  meta,
  filter,
  paginationKey = "page" as TFilterKey,
}: DataTablePaginationProps<TData, TFilterKey>) {
  const localPagination = table.getState().pagination;

  const localTotal =
    table.getFilteredRowModel().rows.length;

  const localFrom =
    localTotal === 0
      ? 0
      : localPagination.pageIndex *
          localPagination.pageSize +
        1;

  const localTo = Math.min(
    (localPagination.pageIndex + 1) *
      localPagination.pageSize,
    localTotal,
  );

  const serverFrom =
    meta && meta.total > 0
      ? (meta.page - 1) * meta.limit + 1
      : 0;

  const serverTo = meta
    ? Math.min(
        meta.page * meta.limit,
        meta.total,
      )
    : 0;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
      <div className="text-center text-sm text-muted-foreground sm:text-left">
        {meta ? (
          <>
            Showing {serverFrom} to{" "}
            {serverTo} of {meta.total} entries
          </>
        ) : (
          <>
            Showing {localFrom} to{" "}
            {localTo} of {localTotal} entries
          </>
        )}
      </div>

      <div className="flex items-center">
        {meta ? (
          <CustomPagination
            currentPage={meta.page}
            totalPages={
              meta.totalPages ??
              Math.ceil(
                meta.total / meta.limit,
              )
            }
            updatePage={(page) => {
              filter?.updateFilter(
                paginationKey,
                page,
                {
                  resetPage: false,
                },
              );
            }}
          />
        ) : (
          <Pagination>
            <PaginationContent className="gap-1">
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={(
                    event: React.MouseEvent<HTMLAnchorElement>,
                  ) => {
                    event.preventDefault();
                    table.previousPage();
                  }}
                  className={cn(
                    "h-8 w-8 cursor-pointer p-0 sm:w-auto sm:px-3",
                    !table.getCanPreviousPage() &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {(() => {
                const page =
                  table.getState().pagination
                    .pageIndex + 1;

                const totalPages =
                  table.getPageCount();

                const pages: (
                  | number
                  | string
                )[] = [];

                if (totalPages <= 5) {
                  for (
                    let i = 1;
                    i <= totalPages;
                    i++
                  ) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);

                  if (page > 3) {
                    pages.push("...");
                  }

                  for (
                    let i = Math.max(
                      2,
                      page - 1,
                    );
                    i <=
                    Math.min(
                      totalPages - 1,
                      page + 1,
                    );
                    i++
                  ) {
                    pages.push(i);
                  }

                  if (
                    page <
                    totalPages - 2
                  ) {
                    pages.push("...");
                  }

                  pages.push(totalPages);
                }

                return pages.map(
                  (pageItem, index) => {
                    if (
                      pageItem === "..."
                    ) {
                      return (
                        <PaginationItem
                          key={`ellipsis-${index}`}
                        >
                          <PaginationEllipsis className="h-8 w-8" />
                        </PaginationItem>
                      );
                    }

                    const pageNumber =
                      pageItem as number;

                    return (
                      <PaginationItem
                        key={pageNumber}
                      >
                        <PaginationLink
                          onClick={(
                            event: React.MouseEvent<HTMLAnchorElement>,
                          ) => {
                            event.preventDefault();

                            table.setPageIndex(
                              pageNumber - 1,
                            );
                          }}
                          isActive={
                            pageNumber === page
                          }
                          className="h-8 w-8 cursor-pointer p-0 text-xs"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  },
                );
              })()}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={(
                    event: React.MouseEvent<HTMLAnchorElement>,
                  ) => {
                    event.preventDefault();
                    table.nextPage();
                  }}
                  className={cn(
                    "h-8 w-8 cursor-pointer p-0 sm:w-auto sm:px-3",
                    !table.getCanNextPage() &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}