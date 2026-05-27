import prisma from '@/lib/prisma'
import { Opportunity } from '@/app/api/duperset/external-opportunities/types'

// Helper to transform storage paths to public URLs
export function mapOpportunityUrls(opp: any): Opportunity {
    if (!opp.jd_storage_path) return opp as Opportunity
    
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/opportunity-jds/${opp.jd_storage_path}`
    return {
        ...opp,
        jd_storage_path: publicUrl,
        jd_link: opp.jd_link || publicUrl
    } as Opportunity
}

export async function getActiveOpportunities(): Promise<Opportunity[]> {
    try {
        const data = await prisma.external_opportunities.findMany({
            where: { is_active: true }
        })

        return data.map((opp: any) => {
            const mapped = mapOpportunityUrls(opp)
            return {
                ...mapped,
                id: Number(opp.id),
                deadline: opp.deadline ? opp.deadline.toISOString() : null,
                start_date: opp.start_date ? opp.start_date.toISOString() : null,
                created_at: opp.created_at.toISOString(),
                archived_at: opp.archived_at ? opp.archived_at.toISOString() : null
            } as unknown as Opportunity
        })
    } catch (error: any) {
        throw new Error(`getActiveOpportunities: ${error.message}`)
    }
}

export interface CreateOpportunityPayload {
    submitter_email: string
    title?: string | null
    recruiting_body?: string | null
    deadline?: Date | string | null
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
    start_date?: Date | string | null
    job_description?: string | null
    eligibility_restrictions?: string | null
    apply_method?: string | null
}

export async function createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity> {
    try {
        const data = await prisma.external_opportunities.create({
            data: {
                ...payload,
                deadline: payload.deadline ? new Date(payload.deadline) : null,
                start_date: payload.start_date ? new Date(payload.start_date) : null,
                skills: payload.skills || []
            }
        })

        return {
            ...data,
            id: Number(data.id),
            deadline: data.deadline ? data.deadline.toISOString() : null,
            start_date: data.start_date ? data.start_date.toISOString() : null,
            created_at: data.created_at.toISOString(),
            archived_at: data.archived_at ? data.archived_at.toISOString() : null
        } as unknown as Opportunity
    } catch (error: any) {
        throw new Error(`createOpportunity: ${error.message}`)
    }
}
