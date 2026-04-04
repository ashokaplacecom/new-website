import { NextRequest, NextResponse } from 'next/server'
import { getActiveOpportunities, createOpportunity } from '@/lib/supabase/db/external_opportunities'
import { uploadFile } from '@/lib/supabase/storage/upload'
import { Opportunity } from './types'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

function sortOpportunities(opportunities: Opportunity[]): Opportunity[] {
    return opportunities.sort((a, b) => {
        // Priority tiers:
        // 0 — isRolling = true
        // 1 — has a deadline
        // 2 — no deadline and not rolling
        const getPriority = (opp: Opportunity) => {
            if (opp.isRolling) return 0
            if (opp.deadline) return 1
            return 2
        }

        const pA = getPriority(a)
        const pB = getPriority(b)

        if (pA !== pB) return pA - pB

        // Both have deadlines — sort by urgency (closest first)
        if (pA === 1) {
            const tA = new Date(a.deadline!).getTime()
            const tB = new Date(b.deadline!).getTime()
            if (tA !== tB) return tA - tB
        }

        // Tie-break: earlier created_at comes first
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
}

export async function GET() {
    try {
        const opportunities = await getActiveOpportunities()
        const sorted = sortOpportunities(opportunities)

        return NextResponse.json({ success: true, opportunities: sorted })

    } catch (err: any) {
        console.error('[GET /api/duperset/external-opportunities]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        let formData: FormData
        try {
            formData = await req.formData()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid form data.' },
                { status: 400 }
            )
        }

        const submitter_email = (formData.get('submitter_email') as string | null)?.trim()
        if (!submitter_email) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: submitter_email.' },
                { status: 400 }
            )
        }

        // Parse optional fields
        const title = (formData.get('title') as string | null) || null
        const recruiting_body = (formData.get('recruiting_body') as string | null) || null
        const deadline = (formData.get('deadline') as string | null) || null
        const jd_link = (formData.get('jd_link') as string | null) || null
        const isRolling = formData.get('isRolling') === 'true'
        const role = (formData.get('role') as string | null) || null
        const category = (formData.get('category') as string | null) || null
        const compensation = (formData.get('compensation') as string | null) || null
        const duration = (formData.get('duration') as string | null) || null
        const eligibility = (formData.get('eligibility') as string | null) || null
        const apply_url = (formData.get('apply_url') as string | null) || null

        // Parse skills (accept JSON array string or comma-separated)
        const skillsRaw = formData.get('skills') as string | null
        let skills: string[] | null = null
        if (skillsRaw) {
            try {
                skills = JSON.parse(skillsRaw)
            } catch {
                skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
            }
        }

        // Upload JD file if provided
        let jd_storage_path: string | null = null
        const jdFile = formData.get('jd_file') as File | null

        if (jdFile && jdFile.size > 0) {
            const timestamp = Date.now()
            const safeName = jdFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
            const filePath = `${timestamp}-${safeName}`

            try {
                const uploaded = await uploadFile({
                    bucket: 'opportunity-jds',
                    path: filePath,
                    file: jdFile,
                    contentType: jdFile.type || undefined,
                    admin: true,
                })
                jd_storage_path = uploaded.path
            } catch (uploadErr: any) {
                console.error('[POST /api/duperset/external-opportunities] File upload failed:', uploadErr)
                return NextResponse.json(
                    { success: false, message: `File upload failed: ${uploadErr.message}` },
                    { status: 500 }
                )
            }
        }

        const opportunity = await createOpportunity({
            submitter_email,
            title,
            recruiting_body,
            deadline,
            jd_link,
            isRolling,
            role,
            category,
            compensation,
            duration,
            eligibility,
            skills,
            apply_url,
            jd_storage_path,
        })

        console.log(`[POST /api/duperset/external-opportunities] Opportunity created: id=${opportunity.id} by ${submitter_email}`)

        return NextResponse.json(
            { success: true, message: 'Opportunity submitted successfully.', opportunity },
            { status: 201 }
        )

    } catch (err: any) {
        console.error('[POST /api/duperset/external-opportunities]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}
