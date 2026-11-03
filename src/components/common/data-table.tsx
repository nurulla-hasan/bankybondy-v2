"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "./data-table-pagination";

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

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    headerClassName?: string;
  }
}

interface DataTableProps<TData, TValue, TFilterKey extends string = string> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  meta?: PaginationMeta;

  filter?: StateFilterController<TFilterKey>;

  paginationKey?: TFilterKey;

  tableMeta?: Record<string, unknown>;

  showFooter?: boolean;

  isLoading?: boolean;
  isFetching?: boolean;
  skeletonRowCount?: number;

  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function DataTable<TData, TValue, TFilterKey extends string = string>({
  columns,
  data,
  meta,
  filter,
  paginationKey = "page" as TFilterKey,
  tableMeta,
  showFooter = false,
  isLoading = false,
  isFetching = false,
  skeletonRowCount,
  isError = false,
  errorMessage,
  onRetry,
}: DataTableProps<TData, TValue, TFilterKey>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: meta ? meta.page - 1 : 0,

    pageSize: meta ? meta.limit : 10,
  });

  /**
   * Sync TanStack Table's internal pagination
   * with API response meta.
   */
  React.useEffect(() => {
    if (!meta) return;

    setPagination({
      pageIndex: meta.page - 1,
      pageSize: meta.limit,
    });
  }, [meta]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,

    state: {
      columnFilters,
      pagination,
    },

    onColumnFiltersChange: setColumnFilters,

    onPaginationChange: setPagination,

    /**
     * meta exists = API/server pagination
     */
    manualPagination: Boolean(meta),

    pageCount: meta
      ? (meta.totalPages ?? Math.ceil(meta.total / meta.limit))
      : undefined,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: meta ? undefined : getPaginationRowModel(),

    meta: tableMeta,
  });

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border">
        {isFetching && !isLoading && data.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] transition-all">
            <div className="flex items-center justify-center rounded-full border bg-background/95 p-2 shadow-sm">
              <div className="size-5 animate-spin rounded-full border-2 border-dashed border-primary" />
            </div>
          </div>
        )}

        <ScrollArea className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-12 bg-accent px-4",
                        header.column.columnDef.meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody
              className={cn(
                isFetching &&
                  !isLoading &&
                  data.length > 0 &&
                  "pointer-events-none opacity-35 transition-opacity duration-200",
              )}
            >
              {isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-56 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="size-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Failed to load data
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {errorMessage ||
                          "An unexpected error occurred while fetching data. Please try again."}
                      </p>
                      {onRetry && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onRetry}
                          className="mt-2 cursor-pointer"
                        >
                          <RotateCcw className="mr-1.5 size-3.5" />
                          Try again
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : isLoading || (isFetching && data.length === 0) ? (
                Array.from({
                  length: skeletonRowCount ?? meta?.limit ?? 10,
                }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell
                        key={`skeleton-cell-${colIndex}`}
                        className="h-12 pl-4"
                      >
                        <Skeleton className="h-4 w-full max-w-[85%] rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="h-12 pl-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {showFooter && (
              <TableFooter className="border-t">
                {table.getFooterGroups().map((footerGroup) => (
                  <TableRow key={footerGroup.id}>
                    {footerGroup.headers.map((footer) => (
                      <TableCell key={footer.id} className="p-2">
                        {footer.isPlaceholder
                          ? null
                          : flexRender(
                              footer.column.columnDef.footer,
                              footer.getContext(),
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableFooter>
            )}
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {!isError && (meta || table.getPageCount() > 1) && (
        <DataTablePagination
          table={table}
          meta={meta}
          filter={filter}
          paginationKey={paginationKey}
        />
      )}
    </div>
  );
}
