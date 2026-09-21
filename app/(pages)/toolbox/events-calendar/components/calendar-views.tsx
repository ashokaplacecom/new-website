"use client";

import type { Event } from "../types/calendar";
import { cn } from "@/lib/utils";

// Accent colour constants
const ACCENT = "#1a6abf";
const TEXT_ACCENT = "#0a4a8a";

interface CalendarViewsProps {
  events: Event[];
  selectedDate: Date;
  onEventClick: (event: Event) => void;
  categoryColors: Record<string, string>; // kept for compat, not used
}

// ─── Month View ───────────────────────────────────────────────────────────────
export function MonthView({ events, selectedDate, onEventClick }: CalendarViewsProps) {
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());

  const days: Date[] = [];
  const cur = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const getEventsForDate = (date: Date) =>
    events.filter(e => new Date(e.date).toDateString() === date.toDateString());

  return (
    <div className="rounded-3xl overflow-hidden border border-border/40 shadow-sm">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-muted/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/30 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isToday = day.toDateString() === today.toDateString();
          const isLastRow = i >= 35;

          return (
            <div
              key={i}
              className={cn(
                "min-h-[100px] p-1.5 border-r border-b border-border/30 last:border-r-0 transition-colors",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
                isToday && "bg-blue-50/60 dark:bg-blue-950/20",
                isLastRow && "border-b-0",
              )}
            >
              <div className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 mx-auto",
                isToday ? "bg-primary text-primary-foreground" : "text-foreground/70",
              )}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left rounded-lg px-2 py-1 text-[10px] leading-tight font-medium transition-all hover:brightness-95 active:scale-[0.98] border border-blue-200/90 dark:border-blue-800/60 bg-blue-100/90 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-l-[3px] border-l-primary block"
                  >
                    <span className="truncate block font-semibold">{event.title}</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1 font-medium">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
export function WeekView({ events, selectedDate, onEventClick }: CalendarViewsProps) {
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }

  const getEventsForDate = (date: Date) =>
    events.filter(e => new Date(e.date).toDateString() === date.toDateString());

  return (
    <div className="rounded-3xl overflow-hidden border border-border/40 shadow-sm">
      <div className="grid grid-cols-7 bg-muted/40">
        {weekDays.map(day => {
          const isToday = day.toDateString() === today.toDateString();
          return (
            <div key={day.toISOString()} className={cn(
              "p-3 text-center border-r border-border/30 last:border-r-0",
              isToday && "bg-blue-50/60 dark:bg-blue-950/20",
            )}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mx-auto mt-1",
                isToday ? "bg-primary text-primary-foreground" : "text-foreground",
              )}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7">
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === today.toDateString();
          return (
            <div key={day.toISOString()} className={cn(
              "min-h-60 p-1.5 border-r border-border/30 last:border-r-0 space-y-1",
              isToday && "bg-blue-50/40 dark:bg-blue-950/10",
            )}>
              {dayEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left rounded-xl p-2.5 text-xs font-medium transition-all hover:brightness-95 active:scale-[0.98] space-y-1 border border-blue-200/90 dark:border-blue-800/60 bg-blue-100/90 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100 shadow-sm border-l-[3.5px] border-l-primary block"
                >
                  <span className="text-[10px] font-bold block text-primary dark:text-blue-300 tracking-wide">{event.time}</span>
                  <span className="block leading-tight font-semibold break-words">{event.title}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared event card (List + Today) ─────────────────────────────────────────
function EventListCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const hasDescription = event.description &&
    event.description !== "No description available" &&
    event.description.trim().length > 0;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card hover:bg-muted/30 border border-border/40 rounded-2xl px-4 py-4 transition-all duration-150 hover:shadow-md hover:-translate-y-px active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex items-start gap-3">
        {/* Blue left accent bar */}
        <div
          className="w-1.5 self-stretch rounded-full flex-shrink-0 mt-0.5 bg-primary"
          style={{ minHeight: 18 }}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title */}
          <p className="font-semibold text-sm text-foreground leading-snug">
            {event.title}
          </p>

          {/* Time + Venue */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {event.time && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
                {event.time}
              </span>
            )}
            {event.venue && event.venue !== "TBD" && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="truncate max-w-[160px]">{event.venue}</span>
              </span>
            )}
            {event.mandatory && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive rounded-full px-2 py-0.5">
                Mandatory
              </span>
            )}
          </div>

          {/* Description snippet — 2 lines max */}
          {hasDescription && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Chevron */}
        <svg className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5 group-hover:text-muted-foreground transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
export function ListView({ events, onEventClick }: Pick<CalendarViewsProps, "events" | "onEventClick">) {
  const grouped = events.reduce<Record<string, Event[]>>((acc, event) => {
    const key = new Date(event.date).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).toDateString();

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground font-medium">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateStr => {
        const date = new Date(dateStr);
        const isToday = dateStr === today;

        return (
          <div key={dateStr}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex flex-col items-center justify-center w-11 h-11 rounded-2xl flex-shrink-0 shadow-sm",
                isToday ? "bg-primary text-primary-foreground font-bold" : "bg-muted/60 text-foreground",
              )}>
                <span className="text-[10px] font-bold uppercase leading-none tracking-widest opacity-70">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
              </div>
              <div>
                <p className={cn("text-sm font-semibold", isToday ? "text-primary font-bold" : "text-foreground")}>
                  {isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="space-y-2 pl-0 sm:pl-14">
              {grouped[dateStr].map(event => (
                <EventListCard key={event.id} event={event} onClick={() => onEventClick(event)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Today View ───────────────────────────────────────────────────────────────
export function TodayView({ events, onEventClick }: Pick<CalendarViewsProps, "events" | "onEventClick">) {
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const todayEvents = events.filter(e => new Date(e.date).toDateString() === today.toDateString());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <div className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center bg-primary text-primary-foreground flex-shrink-0 shadow-sm">
          <span className="text-[10px] font-bold uppercase leading-none tracking-widest opacity-80">
            {today.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
          <span className="text-lg font-bold leading-tight">{today.getDate()}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} today
          </p>
        </div>
      </div>

      {todayEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
            <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Nothing scheduled for today</p>
          <p className="text-xs text-muted-foreground/70">Enjoy your day!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayEvents.map(event => (
            <EventListCard key={event.id} event={event} onClick={() => onEventClick(event)} />
          ))}
        </div>
      )}
    </div>
  );
}
