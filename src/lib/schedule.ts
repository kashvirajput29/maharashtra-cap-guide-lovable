export const SCHEDULE_STATUSES = [
  "Upcoming",
  "Ongoing",
  "Completed",
  "Not published yet",
] as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export type ScheduleEvent = {
  id: string;
  activity: string;
  round: string;
  start_date: string | null;
  end_date: string | null;
  link: string;
  last_checked: string | null;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isPublishedDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function getMaharashtraDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function getScheduleStatus(
  event: Pick<ScheduleEvent, "start_date" | "end_date">,
  today = getMaharashtraDate(),
): ScheduleStatus {
  if (!isPublishedDate(event.start_date) || !isPublishedDate(event.end_date)) {
    return "Not published yet";
  }
  if (today < event.start_date) return "Upcoming";
  if (today <= event.end_date) return "Ongoing";
  return "Completed";
}

export function formatScheduleDate(value: string | null | undefined): string {
  if (!isPublishedDate(value)) return "Not published yet";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function addOneDay(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function createCalendarFile(event: ScheduleEvent): string | null {
  if (!isPublishedDate(event.start_date) || !isPublishedDate(event.end_date)) return null;
  const start = event.start_date.replaceAll("-", "");
  const exclusiveEnd = addOneDay(event.end_date).replaceAll("-", "");
  const description = event.link
    ? `Official source: ${event.link}`
    : "Check the official CET Cell schedule before acting.";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maharashtra CAP Guide//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@maharashtra-cap-guide`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${exclusiveEnd}`,
    `SUMMARY:${escapeCalendarText(event.activity)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    event.link ? `URL:${event.link}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadCalendarEvent(event: ScheduleEvent) {
  const calendar = createCalendarFile(event);
  if (!calendar || typeof document === "undefined") return;
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.activity.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "cap-event"}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}