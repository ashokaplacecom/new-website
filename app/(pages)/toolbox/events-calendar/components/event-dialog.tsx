"use client";

import type { Event } from "../types/calendar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, MapPin, CalendarPlus } from "lucide-react";

interface EventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCENT = "#1a6abf";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Builds a Google Calendar "add event" URL from event data.
 * No API call needed — just URL parameters.
 * Format: YYYYMMDDTHHMMSS (local time, no Z suffix = treated as floating/local by GCal)
 */
function buildGoogleCalendarUrl(event: Event): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";

  const params = new URLSearchParams();
  params.set("text", event.title);

  // Build start datetime. event.date is like "January 15, 2024",
  // event.time is like "02:00 PM" or "14:00".
  try {
    const dateStr = event.date;
    const timeStr = event.time || "09:00 AM";

    // Parse into a Date in IST, then format as YYYYMMDDTHHMMSS
    const combined = new Date(`${dateStr} ${timeStr} IST`);

    // Fallback: try without timezone suffix if above fails
    const d = isNaN(combined.getTime())
      ? new Date(`${dateStr} ${timeStr}`)
      : combined;

    if (!isNaN(d.getTime())) {
      // Format as YYYYMMDDTHHMMSS — Google Cal treats it as local time
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (dt: Date) =>
        `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;

      // 1-hour event by default
      const end = new Date(d.getTime() + 60 * 60 * 1000);
      params.set("dates", `${fmt(d)}/${fmt(end)}`);
    }
  } catch {
    // If parsing fails, omit dates — GCal will still open with the title
  }

  if (event.venue && event.venue !== "TBD") params.set("location", event.venue);
  if (event.description && event.description !== "No description available") {
    params.set("details", event.description);
  }

  return `${base}&${params.toString()}`;
}

export function EventDialog({ event, open, onOpenChange }: EventDialogProps) {
  if (!event) return null;

  const gcalUrl = buildGoogleCalendarUrl(event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0 gap-0 overflow-hidden
          rounded-3xl border border-border/40
          shadow-xl max-w-md w-[calc(100%-2rem)] mx-auto
          bg-card
        "
      >
        {/* Top strip — primary colour */}
        <div className="h-1.5 w-full flex-shrink-0 bg-primary" />

        <div className="p-6 space-y-5">
          {/* Mandatory badge (only if mandatory) */}
          {event.mandatory && (
            <div>
              <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold bg-destructive/10 text-destructive uppercase tracking-wider">
                Mandatory
              </span>
            </div>
          )}

          {/* Title */}
          <DialogTitle className="text-xl font-bold text-foreground leading-snug font-apple-sans">
            {event.title}
          </DialogTitle>

          {/* Meta */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Date</p>
                <p className="text-sm text-foreground font-medium">{formatDate(event.date)}</p>
              </div>
            </div>

            {event.time && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Time</p>
                  <p className="text-sm text-foreground font-medium">{event.time}</p>
                </div>
              </div>
            )}

            {event.venue && event.venue !== "TBD" && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Venue</p>
                  <p className="text-sm text-foreground font-medium">{event.venue}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && event.description !== "No description available" && (
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">About</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Add to calendar */}
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-2.5 text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90 bg-primary text-primary-foreground shadow-sm"
          >
            <CalendarPlus className="w-4 h-4" />
            Add to Google Calendar
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
