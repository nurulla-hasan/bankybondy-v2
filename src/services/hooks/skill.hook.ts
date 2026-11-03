import { useQuery } from "@tanstack/react-query";
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
