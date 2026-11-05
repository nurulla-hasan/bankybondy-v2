import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BondsVisibilityInput,
  EditProfileValues,
  MyProfile,
  PeopleVisibilityInput,
  UpdateProfileInput,
} from "@/types";

/**
 * The server validates `gender` against `MALE|FEMALE` and every `socialLinks`
 * entry against `.url()`, so empty form rows must not travel — an unset gender
 * is sent as "field absent" (the backend cannot null it out) and blank link
 * inputs are dropped instead of rejected.
 */
function toProfilePayload(
  values: Partial<EditProfileValues>,
): Partial<EditProfileValues> {
  return {
    ...values,
    gender: values.gender || undefined,
    socialLinks: values.socialLinks
      ?.map((link) => link.trim())
      .filter(Boolean),
  };
}

/**
 * `PATCH /normal-user/update-profile` is multipart: scalar fields travel as a
 * JSON string in one `data` field (`parseMultipartData.ts` replaces `req.body`
 * with it) and files under the multer field names `profile_image` and
 * `profile_cover` — the latter is stored as `cover_image`.
 */
export function buildProfileFormData(input: UpdateProfileInput) {
  const { profileImageFile, coverImageFile, ...values } = input;
  const formData = new FormData();

  formData.append("data", JSON.stringify(toProfilePayload(values)));
  if (profileImageFile) formData.append("profile_image", profileImageFile);
  if (coverImageFile) formData.append("profile_cover", coverImageFile);

  return formData;
}

export function updateMyProfile(input: UpdateProfileInput) {
  return apiClient<ApiResponse<MyProfile>>("/normal-user/update-profile", {
    method: "PATCH",
    body: buildProfileFormData(input),
  });
}

/**
 * Show or hide the owner's bonds on their public profile.
 * Endpoint: PATCH /normal-user/bonds-visibility
 */
export function updateBondsVisibility(input: BondsVisibilityInput) {
  return apiClient<ApiResponse<MyProfile>>("/normal-user/bonds-visibility", {
    method: "PATCH",
    body: input,
  });
}

/**
 * Appear in the People directory or not.
 * Endpoint: PATCH /normal-user/people-visibility
 */
export function updatePeopleVisibility(input: PeopleVisibilityInput) {
  return apiClient<ApiResponse<MyProfile>>("/normal-user/people-visibility", {
    method: "PATCH",
    body: input,
  });
}
