import { createClient } from '../server'

// Check if student already has a pending request
export async function hasPendingRequest(studentId: number): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .schema('verifications')
        .from('requests')
        .select('id')
        .eq('student', studentId)
        .eq('status', 'pending')
        .maybeSingle()

    if (error) throw new Error(`hasPendingRequest: ${error.message}`)
    return data !== null
}