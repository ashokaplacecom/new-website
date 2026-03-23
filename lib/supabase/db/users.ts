import { createClient, createAdminClient } from '../server'

// Get the currently logged-in user's profile
export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null
    return user
}

// Get a profile row from your own users/profiles table
export async function getUserProfile(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw new Error(`getUserProfile: ${error.message}`)
    return data
}

// Create a profile — uses admin client to bypass RLS on insert
export async function createUserProfile(userId: string, payload: { name: string; email: string }) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('profiles')
        .insert({ id: userId, ...payload })
        .select()
        .single()

    if (error) throw new Error(`createUserProfile: ${error.message}`)
    return data
}