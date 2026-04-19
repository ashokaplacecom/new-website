'use server';
import { createServerClient } from '@supabase/ssr'
import { createClient as createBaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Helper to get environment variables with potential fallback to NEXT_PUBLIC versions
const getEnv = (key: string) => {
    return process.env[key] || process.env[`NEXT_PUBLIC_${key}`]
}

// Standard server client — respects RLS, uses the logged-in user's session
export async function createClient() {
    const cookieStore = await cookies()

    const url = getEnv('SUPABASE_URL')
    const anonKey = getEnv('SUPABASE_ANON_KEY')

    if (!url || !anonKey) {
        throw new Error('Supabase URL or Anon Key is missing in environment variables.')
    }

    return createServerClient(url, anonKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet) => {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // setAll called from a server component — safe to ignore
                }
            },
        },
    })
}

// Admin client — bypasses RLS, only use in trusted server-side contexts
// Uses the base @supabase/supabase-js client for better compatibility in background/CI tasks
export function createAdminClient() {
    const url = getEnv('SUPABASE_URL')
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
        throw new Error('Supabase URL or Service Role Key is missing in environment variables.')
    }

    return createBaseClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}