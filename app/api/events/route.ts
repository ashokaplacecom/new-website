"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/apis/calendar';
import { mapGoogleEventsToAppEvents } from '@/app/(pages)/toolbox/events-calendar/types/calendar';

/**
 * Computes the time range for calendar event fetching:
 * - If startTime and endTime are explicitly provided, uses them directly.
 * - If view === 'week' (or on a week): computes start of week (Sunday 00:00:00 IST) to end of week (Saturday 23:59:59 IST).
 * - If view === 'month' (or default): computes from the start of the visible month grid
 *   (Sunday on or before 1st of that month) through 42 days (6 full weeks), covering all past and future events in that month.
 */
function computeDateRange(searchParams: URLSearchParams) {
    const explicitStart = searchParams.get('startTime');
    const explicitEnd = searchParams.get('endTime');
    if (explicitStart && explicitEnd) {
        return { startTime: explicitStart, endTime: explicitEnd };
    }

    const view = searchParams.get('view'); // 'month' | 'week'
    const dateParam = searchParams.get('date');

    // Reference date (defaults to current date in IST)
    let refDate = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(refDate.getTime())) {
        refDate = new Date();
    }

    // Get IST date components (Asia/Kolkata)
    const istString = refDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const [year, month, day] = istString.split('-').map(Number); // month is 1-12

    if (view === 'week') {
        // Day of week in IST (0 = Sunday, 1 = Monday, ... 6 = Saturday)
        const d = new Date(Date.UTC(year, month - 1, day));
        const dayOfWeek = d.getUTCDay();

        // Start of week: Sunday 00:00:00 IST
        const startOfWeek = new Date(Date.UTC(year, month - 1, day - dayOfWeek));
        const startStr = startOfWeek.toISOString().slice(0, 10);
        const startTime = `${startStr}T00:00:00+05:30`;

        // End of week: Saturday 23:59:59 IST
        const endOfWeek = new Date(Date.UTC(year, month - 1, day - dayOfWeek + 6));
        const endStr = endOfWeek.toISOString().slice(0, 10);
        const endTime = `${endStr}T23:59:59+05:30`;

        return { startTime, endTime };
    }

    // Default: 'month' view
    // Fetch ALL events in that month (including past events from the 1st of the month),
    // plus the full 42-day calendar grid days.
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const firstDayOfWeek = firstOfMonth.getUTCDay();

    // Grid start: Sunday on or before 1st of month at 00:00:00 IST
    const gridStart = new Date(Date.UTC(year, month - 1, 1 - firstDayOfWeek));
    const gridStartStr = gridStart.toISOString().slice(0, 10);
    const startTime = `${gridStartStr}T00:00:00+05:30`;

    // Grid end: 42 days (6 full weeks) from gridStart
    const gridEnd = new Date(Date.UTC(year, month - 1, 1 - firstDayOfWeek + 41));
    const gridEndStr = gridEnd.toISOString().slice(0, 10);
    const endTime = `${gridEndStr}T23:59:59+05:30`;

    return { startTime, endTime };
}

/**
 * GET handler for /api/events
 * Returns all events in a given date range, month, or week.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const calId = searchParams.get('calId') || process.env.GOOGLE_CALENDAR_ID;

        const { startTime, endTime } = computeDateRange(searchParams);

        console.log('API Route - Fetching events with params:', {
            calId,
            startTime,
            endTime
        });

        // Get events from calendar API
        const rawEvents = await getEvents(
            calId as string,
            startTime,
            endTime
        );

        console.log('API Route - Events fetched:', rawEvents ?
            `${Array.isArray(rawEvents) ? rawEvents.length : 1} events` :
            'No events');

        const mappedEvents = mapGoogleEventsToAppEvents(rawEvents || []);

        return NextResponse.json({
            success: true,
            data: mappedEvents,
            raw: rawEvents || []
        });
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message
            },
            { status: 500 }
        );
    }
}