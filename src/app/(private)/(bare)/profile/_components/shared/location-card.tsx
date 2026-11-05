"use client";

import { useState } from "react";
import { MapPin, Navigation, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RelativeTime } from "@/components/common/relative-time";
import { getErrorMessage } from "@/lib/error";
import {
  getGeolocationFailure,
  requestCoordinates,
  type Coordinates,
  type GeolocationFailure,
} from "@/lib/geolocation";
import { errorToast, successToast } from "@/lib/toast";
import { useSaveMyLocation } from "@/services";
import type { MyProfile } from "@/types";

const RANGES = {
  lat: { min: -90, max: 90 },
  lng: { min: -180, max: 180 },
} as const;

const FAILURE_MESSAGES: Record<GeolocationFailure, string> = {
  unsupported: "location.unsupported",
  insecure: "location.insecure",
  denied: "location.denied",
  unavailable: "location.unavailable",
  timeout: "location.timeout",
};

function parseCoordinate(raw: string, bound: { min: number; max: number }) {
  if (!raw.trim()) return null;

  const value = Number(raw);

  return Number.isFinite(value) && value >= bound.min && value <= bound.max
    ? value
    : null;
}

export function LocationCard({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");
  const saveLocation = useSaveMyLocation();
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const isSaving = locating || saveLocation.isPending;
  const parsedLat = parseCoordinate(lat, RANGES.lat);
  const parsedLng = parseCoordinate(lng, RANGES.lng);

  const shareCurrentPosition = async () => {
    setLocating(true);

    let coordinates: Coordinates | null = null;
    try {
      coordinates = await requestCoordinates();
    } catch (error) {
      setLocating(false);
      errorToast(
        t("location.title"),
        t(FAILURE_MESSAGES[getGeolocationFailure(error)]),
      );
      return;
    }

    saveLocation.mutate(
      { ...coordinates, mode: "auto" },
      {
        onSuccess: () => {
          setLocating(false);
          successToast(t("location.savedTitle"), t("location.savedAuto"));
        },
        onError: (error) => {
          setLocating(false);
          errorToast(t("location.saveFailed"), getErrorMessage(error));
        },
      },
    );
  };

  const saveManualCoordinates = () => {
    if (parsedLat === null || parsedLng === null) return;

    saveLocation.mutate(
      { lat: parsedLat, lng: parsedLng, mode: "manual" },
      {
        onSuccess: () => {
          setLat("");
          setLng("");
          successToast(t("location.savedTitle"), t("location.savedManual"));
        },
        onError: (error) =>
          errorToast(t("location.saveFailed"), getErrorMessage(error)),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>{t("location.title")}</CardTitle>
          <CardDescription>{t("location.description")}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {profile.locationUpdatedAt ? (
            <>
              <Badge variant="secondary">
                {t(`location.mode.${profile.locationMode ?? "auto"}`)}
              </Badge>
              <span className="text-muted-foreground">
                {t("location.updated")}{" "}
                <RelativeTime date={profile.locationUpdatedAt} />
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{t("location.empty")}</span>
          )}
        </div>

        <div className="space-y-3 rounded-xl bg-muted/40 p-3">
          <Button
            type="button"
            className="w-full"
            onClick={shareCurrentPosition}
            disabled={isSaving}
            loading={isSaving}
            loadingText={t("location.locating")}
          >
            {!isSaving && <Navigation className="size-4" aria-hidden />}
            {t("location.useMyLocation")}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="manual-lat" className="text-xs">
                {t("location.lat")}
              </Label>
              <Input
                id="manual-lat"
                value={lat}
                inputMode="decimal"
                placeholder="23.7806"
                onChange={(event) => setLat(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-lng" className="text-xs">
                {t("location.lng")}
              </Label>
              <Input
                id="manual-lng"
                value={lng}
                inputMode="decimal"
                placeholder="90.4074"
                onChange={(event) => setLng(event.target.value)}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={saveManualCoordinates}
            disabled={parsedLat === null || parsedLng === null || isSaving}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {t("location.saveManual")}
          </Button>
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          {t("location.privateNote")}
        </p>
      </CardContent>
    </Card>
  );
}
