import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

export interface SkillItem {
  _id: string;
  name: string;
  category?: string;
  icon?: string;
}

export interface SkillQueryResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  result: SkillItem[];
}

/**
 * Get All Skills
 * Endpoint: GET /skill/all-skills
 */
export function getAllSkills(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
}) {
  return apiClient<ApiResponse<SkillQueryResponse>>("/skill/all-skills", {
    method: "GET",
    query: params,
  });
}
