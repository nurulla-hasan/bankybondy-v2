"use client";

import { useCallback, useEffect, useState } from "react";

import {
  MOCK_BONDS,
  MOCK_PROFILE,
  MOCK_REVIEWS,
  mockDelay,
} from "@/mocks/profile.mock";
import type { MyProfile, RawPublicBond, RawPublicRating } from "@/types";

export interface MyProfileData {
  profile: MyProfile;
  bonds: RawPublicBond[];
  reviews: RawPublicRating[];
}

const INITIAL: MyProfileData = {
  profile: MOCK_PROFILE,
  bonds: MOCK_BONDS,
  reviews: MOCK_REVIEWS,
};

/** Stands in for `useMyProfile` until the real query exists. */
export function useMockMyProfile() {
  const [data, setData] = useState<MyProfileData | null>(null);

  useEffect(() => {
    let isCurrent = true;

    mockDelay(INITIAL).then((loaded) => {
      if (isCurrent) setData(loaded);
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const patchProfile = useCallback((patch: Partial<MyProfile>) => {
    setData((current) =>
      current ? { ...current, profile: { ...current.profile, ...patch } } : current,
    );
  }, []);

  return { data, isPending: !data, patchProfile };
}
