import { createAdminClient } from '../server'
import { Opportunity } from '@/app/api/duperset/external-opportunities/types'

// Fetch all active opportunities (is_active = true)
export async function getActiveOpportunities(): Promise<Opportunity[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('external_opportunities')
        .select('*')
        .eq('is_active', true)

    if (error) throw new Error(`getActiveOpportunities: ${error.message}`)

    return data || []
}

export interface CreateOpportunityPayload {
    submitter_email: string
    title?: string | null
    recruiting_body?: string | null
    deadline?: string | null
    jd_link?: string | null
    isRolling?: boolean
    role?: string | null
    category?: string | null
    compensation?: string | null
    duration?: string | null
    eligibility?: string | null
    skills?: string[] | null
    apply_url?: string | null
    jd_storage_path?: string | null
}

export async function createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('external_opportunities')
        .insert(payload)
        .select()
        .single()

    if (error) throw new Error(`createOpportunity: ${error.message}`)
    return data
}
