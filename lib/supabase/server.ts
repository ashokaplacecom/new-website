import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Standard server client — respects RLS, uses the logged-in user's session
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // setAll called from a server component — safe to ignore,
                        // middleware will handle session refresh
                    }
                },
            },
        }
    )
}

// Admin client — bypasses RLS, only use in trusted server-side contexts
export function createAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: { getAll: () => [], setAll: () => { } },
        }
    )
}