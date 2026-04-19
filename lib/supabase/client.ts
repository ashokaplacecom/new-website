import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    if (client) return client

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    // If variables are missing, we still initialize to avoid crashing on import, 
    // but the client will fail when used.
    client = createBrowserClient(
        url || '',
        anonKey || ''
    )

    return client
}