import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PREFS_COOKIE = 'events_calendar_preferences';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface EventsCalendarPreferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

function getDefaultPreferences(): EventsCalendarPreferences {
  return {
    selectedOrganizations: [],
    selectedCategories: ['clubs', 'societies', 'departments', 'ministries', 'others'],
    categoryColors: {
      clubs: '#c89188',
      societies: '#f4b448',
      departments: '#519872',
      ministries: '#5197d6',
      others: '#767371',
    },
  };
}

function validatePreferences(preferences: any): preferences is EventsCalendarPreferences {
  return (
    preferences &&
    Array.isArray(preferences.selectedOrganizations) &&
    Array.isArray(preferences.selectedCategories) &&
    typeof preferences.categoryColors === 'object'
  );
}

/**
 * GET /api/events/preferences
 * Returns the user's saved calendar preferences from a cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(PREFS_COOKIE)?.value;

    let preferences: EventsCalendarPreferences | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (validatePreferences(parsed)) {
          preferences = parsed;
        }
      } catch {
        // malformed cookie — fall back to defaults
      }
    }

    return NextResponse.json({
      success: true,
      data: preferences ?? getDefaultPreferences(),
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ success: true, data: getDefaultPreferences() });
  }
}

/**
 * POST /api/events/preferences
 * Saves the user's calendar preferences in a cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body;

    if (!validatePreferences(preferences)) {
      return NextResponse.json(
        { success: false, error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
      data: preferences,
    });

    response.cookies.set(PREFS_COOKIE, JSON.stringify(preferences), {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // readable client-side is fine for non-sensitive prefs
    });

    return response;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
