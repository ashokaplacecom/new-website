import { createAdminClient } from '../server'
import { Opportunity } from '@/app/api/duperset/external-opportunities/types'

// Helper to transform storage paths to public URLs
export function mapOpportunityUrls(opp: Opportunity): Opportunity {
    if (!opp.jd_storage_path) return opp
    
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/opportunity-jds/${opp.jd_storage_path}`
    return {
        ...opp,
        jd_storage_path: publicUrl,
        jd_link: opp.jd_link || publicUrl
    }
}

// Fetch all active opportunities (is_active = true)
export async function getActiveOpportunities(): Promise<Opportunity[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('external_opportunities')
        .select('*')
        .eq('is_active', true)

    if (error) throw new Error(`getActiveOpportunities: ${error.message}`)

    const rawData = data || []
    return rawData.map(mapOpportunityUrls)
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
    placecom_notes?: string | null
    work_arrangement?: string | null
    compensation_type?: string | null
    duration_weeks?: string | null
    start_date?: string | null
    job_description?: string | null
    eligibility_restrictions?: string | null
    apply_method?: string | null
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
