import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getAllSkills } from "../api/skill.api";

export function useGetAllSkills(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
}) {
  return useQuery({
    queryKey: ["skills", params],
    queryFn: () => getAllSkills(params),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

/**
 * Infinite scroll hook for skills pagination (10 per page default)
 */
export function useGetInfiniteSkills(options?: {
  limit?: number;
  searchTerm?: string;
}) {
  const limit = options?.limit ?? 10;
  const searchTerm = options?.searchTerm;

  return useInfiniteQuery({
    queryKey: ["skills", "infinite", { limit, searchTerm }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getAllSkills({
        page: pageParam as number,
        limit,
        searchTerm,
      }),
    getNextPageParam: (lastPage) => {
      // Backend sendResponse sends: { statusCode, success, message, data: { meta: { page, totalPages }, result } }
      const meta = lastPage?.data?.meta;
      if (!meta) return undefined;
      const currentPage = Number(meta.page);
      const totalPages = Number((meta as unknown as { totalPages?: number }).totalPages || meta.totalPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },

    staleTime: 5 * 60 * 1000,
  });
}

