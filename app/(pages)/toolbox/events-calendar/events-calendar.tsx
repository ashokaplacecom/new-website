"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { EventDialog } from "./components/event-dialog";
import { MonthView, ListView, WeekView, TodayView } from "./components/calendar-views";
import { cn } from "@/lib/utils";
import type { Event } from "./types/calendar";

type DesktopView = "month" | "week" | "today";
type MobileView = "list" | "today";
type AnyView = DesktopView | MobileView;

const DESKTOP_VIEWS: { key: DesktopView; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "today", label: "Today" },
];

const MOBILE_VIEWS: { key: MobileView; label: string }[] = [
  { key: "list", label: "List" },
  { key: "today", label: "Today" },
];

function getIST() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

// ─── Search bar ───────────────────────────────────────────────────────────────
function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleChange = (v: string) => { setQuery(v); onSearch(v); };
  const handleClose = () => { setQuery(""); onSearch(""); setOpen(false); };

  if (open) {
    return (
      <div className="flex items-center gap-1.5 border border-border/60 rounded-2xl bg-muted/40 px-3 py-1.5 w-48 sm:w-56">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <Input
          autoFocus
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search…"
          className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
        />
        <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
      aria-label="Search events"
    >
      <Search className="w-4 h-4" />
    </button>
  );
}

// ─── Segmented view picker ────────────────────────────────────────────────────
function ViewPicker<T extends string>({
  views, current, onChange,
}: {
  views: { key: T; label: string }[];
  current: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-muted/50 rounded-2xl p-1 border border-border/30">
      {views.map(v => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150",
            current === v.key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

// ─── Navigation (month/week) ──────────────────────────────────────────────────
function NavRow({ label, onPrev, onNext, onToday, isToday }: {
  label: string; onPrev: () => void; onNext: () => void; onToday: () => void; isToday: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={onToday} className={cn(
        "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all",
        isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
      )}>
        Today
      </button>
      <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
        <ChevronRight className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventsCalendar({ events: initialEvents }: { events: Event[] }) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState(getIST);
  const [desktopView, setDesktopView] = useState<DesktopView>("month");
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => { setSelectedDate(getIST()); setMounted(true); }, []);

  const currentView: AnyView = mounted ? (isMobile ? mobileView : desktopView) : "list";

  // When selectedDate or currentView changes, fetch events for that month or week
  useEffect(() => {
    if (!mounted) return;

    const fetchView = currentView === "week" ? "week" : "month";
    const dateStr = selectedDate.toISOString();
    let cancelled = false;

    async function loadEvents() {
      try {
        const res = await fetch(`/api/events?view=${fetchView}&date=${encodeURIComponent(dateStr)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          setEvents(prev => {
            const map = new Map<string, Event>();
            prev.forEach(e => map.set(e.id, e));
            data.data.forEach((e: Event) => map.set(e.id, e));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error("Failed to fetch events for view:", err);
      }
    }

    loadEvents();
    return () => { cancelled = true; };
  }, [selectedDate, currentView, mounted]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  const handleEventClick = (event: Event) => { setSelectedEvent(event); setShowDialog(true); };

  const navigateMonth = (dir: "prev" | "next") => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    setSelectedDate(d);
  };
  const navigateWeek = (dir: "prev" | "next") => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
    setSelectedDate(d);
  };
  const goToToday = () => setSelectedDate(getIST());
  const isAtToday = selectedDate.toDateString() === getIST().toDateString();
  const handleNav = (dir: "prev" | "next") => {
    if (currentView === "month") navigateMonth(dir);
    else if (currentView === "week") navigateWeek(dir);
  };

  const navigationLabel = (() => {
    if (currentView === "month") return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (currentView === "week") {
      const s = new Date(selectedDate);
      s.setDate(selectedDate.getDate() - selectedDate.getDay());
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "";
  })();

  const showNavigation = currentView === "month" || currentView === "week";

  const viewProps = { events: filteredEvents, selectedDate, onEventClick: handleEventClick, categoryColors: {} };

  return (
    <div className="container max-w-6xl mx-auto px-4 pt-8 pb-12 sm:pt-12">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary border border-primary/5 flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-apple-sans leading-tight">
              Talks, Sessions, and Events
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Discover events happening around campus
            </p>
          </div>
        </div>
      </div>

      {/* ── Controls row: nav + view picker + search (all in one line) ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Left: navigation label (month/week only) */}
        <div className="min-w-0 flex-1">
          {showNavigation && (
            <NavRow
              label={navigationLabel}
              onPrev={() => handleNav("prev")}
              onNext={() => handleNav("next")}
              onToday={goToToday}
              isToday={isAtToday}
            />
          )}
        </div>

        {/* Right: view picker + search */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted && (
            isMobile ? (
              <ViewPicker views={MOBILE_VIEWS} current={mobileView} onChange={setMobileView} />
            ) : (
              <ViewPicker views={DESKTOP_VIEWS} current={desktopView} onChange={setDesktopView} />
            )
          )}
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      {/* ── Calendar content ── */}
      <div className={cn(
        "rounded-3xl border border-border/40 bg-card shadow-sm",
        (currentView === "list" || currentView === "today") ? "p-4 sm:p-6" : "overflow-hidden",
      )}>
        {currentView === "month" && <MonthView  {...viewProps} />}
        {currentView === "week" && <WeekView   {...viewProps} />}
        {currentView === "list" && <ListView events={filteredEvents} onEventClick={handleEventClick} />}
        {currentView === "today" && <TodayView events={filteredEvents} onEventClick={handleEventClick} />}
      </div>

      <EventDialog event={selectedEvent} open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
