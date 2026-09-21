import EventsCalendar from "./events-calendar";
import { Suspense } from "react";
import { Event, mapGoogleEventsToAppEvents } from "./types/calendar";
import { cookies } from "next/headers";

export const metadata = { title: "Talks, Sessions, and Events – Toolbox" };

export default async function Page() {
  const cookieStore = await cookies();

  async function fetchEvents(): Promise<Event[]> {
    try {
      const base_url = process.env.BASE_URL || 'http://localhost:3000';
      const apiUrl = `${base_url}/api/events?view=month`;

      const response = await fetch(apiUrl, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: { 'Cookie': cookieStore.toString() },
      });

      if (!response.ok) {
        console.error('Failed to fetch events:', response.status, response.statusText);
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      return mapGoogleEventsToAppEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      console.log('Falling back to sample data');
      const { sampleEvents } = await import('./data/calendar-data');
      return sampleEvents;
    }
  }

  const events = await fetchEvents();

  return (
    <Suspense>
      <EventsCalendar events={events} />
    </Suspense>
  );
}
