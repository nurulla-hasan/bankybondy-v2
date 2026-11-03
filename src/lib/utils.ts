import { format, formatDistanceToNow, isValid } from "date-fns";

export { cn } from "cn";

export const getInitials = (name: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "N";
  return first.toUpperCase();
};

export const formatDate = (
  date: string | number | Date | null | undefined,
  pattern: string = "dd MMM, yyyy"
): string => {
  if (!date) return "—";
  const parsedDate =
    typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (!isValid(parsedDate)) return "—";
  return format(parsedDate, pattern);
};

export const formatDateTime = (
  date: string | number | Date | null | undefined,
  pattern: string = "dd MMM, yyyy • hh:mm a"
): string => {
  return formatDate(date, pattern);
};

export const formatRelativeTime = (
  date: string | number | Date | null | undefined
): string => {
  if (!date) return "—";
  const parsedDate =
    typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (!isValid(parsedDate)) return "—";
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};
