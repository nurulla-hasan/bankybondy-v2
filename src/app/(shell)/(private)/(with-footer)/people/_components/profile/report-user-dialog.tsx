"use client";

import { useState, type FormEvent } from "react";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { useReportUser } from "@/services";
import type { IncidentType } from "@/types";

const INCIDENTS = [
  { key: "unprofessional", value: "Unprofessional Behavior" },
  { key: "noCollaboration", value: "Failure to collaborate" },
  { key: "spam", value: "Spam" },
  { key: "other", value: "Other" },
] as const satisfies ReadonlyArray<{ key: string; value: IncidentType }>;

interface ReportUserDialogProps {
  profileId: string;
  name: string;
}

export function ReportUserDialog({ profileId, name }: ReportUserDialogProps) {
  const t = useTranslations("People");
  const report = useReportUser();
  const [open, setOpen] = useState(false);
  const [incident, setIncident] = useState<IncidentType | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !report.isPending) {
      setIncident(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!incident) return;

    report.mutate(
      { reportTo: profileId, incidentType: incident },
      {
        onSuccess: () => {
          successToast(
            t("actions.reportSuccessTitle"),
            t("actions.reportSuccess"),
          );
          setOpen(false);
          setIncident(null);
        },
        onError: (error) =>
          errorToast(t("actions.reportErrorTitle"), getErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Flag className="size-4" aria-hidden />
            {t("actions.report")}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("actions.reportTitle", { name })}</DialogTitle>
          <DialogDescription>{t("actions.reportDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("actions.reportIncident")}</p>
            <Select
              value={incident}
              onValueChange={(value) => setIncident(value as IncidentType)}
            >
              <SelectTrigger
                className="w-full"
                aria-label={t("actions.reportIncident")}
              >
                <SelectValue placeholder={t("actions.reportIncident")} />
              </SelectTrigger>
              <SelectContent>
                {INCIDENTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {t(`actions.incidents.${item.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {t("actions.cancel")}
            </DialogClose>
            <Button
              type="submit"
              disabled={!incident}
              loading={report.isPending}
              loadingText={t("actions.reportSubmitting")}
            >
              {t("actions.reportSubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
