import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { globalSearch } from "../api/search.api";

const MIN_SEARCH_LENGTH = 2;

/**
 * Global search hook. Backend requires at least 2 characters and returns
 * empty lists otherwise, so the query is skipped below that threshold.
 */
export function useGlobalSearch(
  term: string,
  options?: { enabled?: boolean }
) {
  const query = term.trim();
  const enabled =
    (options?.enabled ?? true) && query.length >= MIN_SEARCH_LENGTH;

  return useQuery({
    queryKey: ["search", "global", query],
    queryFn: () => globalSearch(query),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
