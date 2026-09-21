export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizingBody: string;
  description: string;
  category: "clubs" | "societies" | "departments" | "ministries" | "others";
  organization: string;
  mandatory?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  category: "clubs" | "societies" | "departments" | "ministries" | "others";
}

export type CalendarView = "month" | "week" | "list" | "today";

export interface Preferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

export function mapGoogleEventsToAppEvents(googleEvents: any[]): Event[] {
  if (!Array.isArray(googleEvents) || googleEvents.length === 0) {
    return [];
  }

  return googleEvents.map(event => {
    // If already mapped to Event, return as-is
    if (event.title && event.date && event.time && event.venue !== undefined) {
      return event as Event;
    }

    const startDate = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : event.start?.date
        ? new Date(event.start.date)
        : new Date();

    const formattedDate = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });

    let organizingBody = 'Unknown';
    let category: Event['category'] = 'others';

    if (event.extendedProperties) {
      const orgBody = event.extendedProperties.shared?.orgBody || event.extendedProperties.private?.orgBody;
      if (orgBody) {
        organizingBody = orgBody;
        if (orgBody.toLowerCase().includes('club')) category = 'clubs';
        else if (orgBody.toLowerCase().includes('society')) category = 'societies';
        else if (orgBody.toLowerCase().includes('department')) category = 'departments';
        else if (orgBody.toLowerCase().includes('ministry')) category = 'ministries';
      }
    } else if (event.description) {
      if (event.description.includes('Club:')) {
        category = 'clubs';
        const match = event.description.match(/Club:\s*([^\n]+)/);
        if (match) organizingBody = match[1].trim();
      } else if (event.description.includes('Society:')) {
        category = 'societies';
        const match = event.description.match(/Society:\s*([^\n]+)/);
        if (match) organizingBody = match[1].trim();
      } else if (event.description.includes('Department:')) {
        category = 'departments';
        const match = event.description.match(/Department:\s*([^\n]+)/);
        if (match) organizingBody = match[1].trim();
      } else if (event.description.includes('Ministry:')) {
        category = 'ministries';
        const match = event.description.match(/Ministry:\s*([^\n]+)/);
        if (match) organizingBody = match[1].trim();
      }
    }

    const venue = event.location || 'TBD';
    const organizationId = organizingBody.toLowerCase().replace(/\s+/g, '-');
    const isMandatory = Boolean(
      event.mandatory ||
      event.description?.toLowerCase().includes('mandatory') ||
      event.summary?.toLowerCase().includes('mandatory')
    );

    return {
      id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
      title: event.summary || 'Untitled Event',
      date: formattedDate,
      time: formattedTime,
      venue: venue,
      organizingBody: organizingBody,
      description: event.description || 'No description available',
      category: category,
      organization: organizationId,
      mandatory: isMandatory,
    };
  });
}
