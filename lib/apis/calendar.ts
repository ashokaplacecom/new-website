/**
 * Google Calendar API utilities using direct REST fetch calls.
 * Uses OAuth2 with a service-account refresh token for write operations,
 * and an API key for read-only operations.
 */

export interface GoogleEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
    date?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
    date?: string;
  };
  recurrence?: string[];
  attendees?: { email: string; responseStatus?: string; comment?: string; optional?: boolean }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
  colorId?: string;
  creator?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  organizer?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  attachments?: Array<{
    fileUrl?: string;
    title?: string;
    mimeType?: string;
    iconLink?: string;
    fileId?: string;
  }>;
  conferenceData?: any;
  status?: string;
  [key: string]: any;
}

/**
 * Obtains a fresh OAuth2 access token using the stored refresh token.
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.DRIVE_CLIENT_ID;
  const clientSecret = process.env.DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing OAuth2 credentials: DRIVE_CLIENT_ID, DRIVE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN"
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh access token: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

/**
 * Base URL for the Google Calendar REST API.
 */
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3/calendars";

/**
 * Retrieves events from a specified calendar within a time range.
 *
 * @param calId  The calendar ID. Defaults to GOOGLE_CALENDAR_ID env var.
 * @param startTime  Start of the query range (RFC3339).
 * @param endTime  End of the query range (RFC3339).
 * @param eventId  Optional: fetch a single event by ID.
 */
export async function getEvents(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  startTime: string,
  endTime: string,
  eventId?: string
): Promise<any> {
  // For read-only list, prefer API key if available; fall back to OAuth2.
  const apiKey = process.env.GOOGLE_API_TOKEN_READONLY;

  if (eventId) {
    const url = apiKey
      ? `${CALENDAR_BASE}/${encodeURIComponent(calId)}/events/${eventId}?key=${apiKey}&fields=*`
      : `${CALENDAR_BASE}/${encodeURIComponent(calId)}/events/${eventId}?fields=*`;

    const headers: Record<string, string> = {};
    if (!apiKey) {
      const token = await getAccessToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch event ${eventId}: ${res.statusText}`);

    const data = await res.json();
    console.log("Fetched single event:", data);
    return data;
  }

  // List events
  const params = new URLSearchParams({
    timeMin: startTime,
    timeMax: endTime,
    singleEvents: "true",
    orderBy: "startTime",
    fields: "items(*),nextPageToken,nextSyncToken",
  });
  if (apiKey) params.set("key", apiKey);

  const url = `${CALENDAR_BASE}/${encodeURIComponent(calId)}/events?${params}`;

  const headers: Record<string, string> = {};
  if (!apiKey) {
    const token = await getAccessToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);

  const data = await res.json();
  console.log("Fetched events:", data);
  return data.items ?? [];
}

/**
 * Adds a new event to a specified calendar (requires OAuth2).
 */
export async function addEvent(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  event: GoogleEvent
): Promise<any> {
  const token = await getAccessToken();
  const url = `${CALENDAR_BASE}/${encodeURIComponent(calId)}/events?fields=*`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error(`Failed to add event: ${res.statusText}`);
  return res.json();
}

/**
 * Updates an existing calendar event (requires OAuth2).
 */
export async function updateEvent(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  eventId: string,
  event: GoogleEvent
): Promise<any> {
  const token = await getAccessToken();
  const url = `${CALENDAR_BASE}/${encodeURIComponent(calId)}/events/${eventId}?fields=*`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error(`Failed to update event: ${res.statusText}`);
  return res.json();
}

/**
 * Deletes a calendar event (requires OAuth2).
 */
export async function deleteEvent(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  eventId: string
): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  const url = `${CALENDAR_BASE}/${encodeURIComponent(calId)}/events/${eventId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to delete event: ${res.statusText}`);
  return { success: true, message: `Event ${eventId} deleted successfully` };
}