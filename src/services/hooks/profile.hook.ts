import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ApiResponse,
  MyProfile,
  UpdateLocationInput,
  UpdateProfileInput,
  VisibilityKey,
} from "@/types";
import { getPerson, updateMyLocation } from "../api/people.api";
import {
  updateBondsVisibility,
  updateMyProfile,
  updatePeopleVisibility,
} from "../api/profile.api";
import { peopleKeys } from "./people.hook";
import { useGetMyProfile } from "./auth.hook";

/** The auth profile query is the only source of the current profile id. */
export function useMyProfileId() {
  const { data } = useGetMyProfile();

  return data?.data?._id ?? null;
}

/**
 * Own profile, rendered from `single-user/:id` because that endpoint resolves
 * `skills` and recomputes reputation live; `get-my-profile` only supplies the id.
 */
export function useMyProfile() {
  const identity = useGetMyProfile();
  const profileId = identity.data?.data?._id ?? null;

  const profile = useQuery({
    queryKey: peopleKeys.detail(profileId ?? ""),
    queryFn: () => getPerson<MyProfile>(profileId as string),
    enabled: Boolean(profileId),
    select: (response) => response.data,
    retry: false,
    staleTime: 60 * 1000,
  });

  return {
    data: profile.data,
    profileId,
    isPending: identity.isPending || profile.isPending,
    isFetching: identity.isFetching || profile.isFetching,
    isError: identity.isError || profile.isError,
    error: identity.error ?? profile.error,
    /**
     * Retry both halves: without a profile id there is nothing to point
     * `single-user/:id` at, so the identity call has to come back first.
     */
    refetch: async () => {
      const identityResult = await identity.refetch();
      if (!identityResult.data?.data?._id) return identityResult;
      return profile.refetch();
    },
  };
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const profileId = useMyProfileId();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: peopleKeys.detail(profileId) });
      }
    },
  });
}

interface VisibilityMutationInput {
  key: VisibilityKey;
  value: boolean;
}

interface VisibilityContext {
  previous?: ApiResponse<MyProfile>;
}

/**
 * The two toggles are separate endpoints with no server-side validation, so the
 * switch writes the cached profile first and rolls back if the PATCH fails.
 */
export function useUpdateVisibility() {
  const queryClient = useQueryClient();
  const profileId = useMyProfileId();

  return useMutation<unknown, Error, VisibilityMutationInput, VisibilityContext>({
    mutationFn: ({ key, value }) =>
      key === "bondsPublic"
        ? updateBondsVisibility({ bondsPublic: value })
        : updatePeopleVisibility({ listedInPeople: value }),

    onMutate: async ({ key, value }) => {
      if (!profileId) return {};

      const detailKey = peopleKeys.detail(profileId);
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<ApiResponse<MyProfile>>(detailKey);

      queryClient.setQueryData<ApiResponse<MyProfile>>(detailKey, (current) =>
        current
          ? { ...current, data: { ...current.data, [key]: value } }
          : current,
      );

      return { previous };
    },

    onError: (_error, _input, context) => {
      if (profileId && context?.previous) {
        queryClient.setQueryData(peopleKeys.detail(profileId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: peopleKeys.detail(profileId) });
      }
    },
  });
}

/**
 * Profile-side location save: same endpoint as the directory's "near" filter,
 * but it also refreshes the owner's profile so the card can show the new mode
 * and timestamp.
 */
export function useSaveMyLocation() {
  const queryClient = useQueryClient();
  const profileId = useMyProfileId();

  return useMutation({
    mutationFn: (input: UpdateLocationInput) => updateMyLocation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: peopleKeys.detail(profileId) });
      }
    },
  });
}
