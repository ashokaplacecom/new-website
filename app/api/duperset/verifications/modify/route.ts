import { NextRequest, NextResponse } from 'next/server'
import { getRequestById, modifyRequest, RequestStatus } from '@/lib/supabase/db/requests'
import { getPOCById } from '@/lib/supabase/db/pocs'
import { sendMail } from '@/app/api/_lib/mailer'
import { requestApprovedStudentEmail } from '@/content/emails/templates/request_approved_student'
import { requestRejectedStudentEmail } from '@/content/emails/templates/request_rejected_student'
import { logAuditTrail } from '@/lib/supabase/db/audit'

const VALID_METHODS: RequestStatus[] = ['approved', 'rejected']

export async function POST(req: NextRequest) {
    try {
        let body: {
            requestId?: number
            method?: string       // 'approved' | 'rejected'
            pocNote?: string      // COMPULSORY
            pocId?: number        // which POC is taking this action
        }

        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }

        const { requestId, method, pocNote, pocId } = body

        // Input validation
        if (!requestId || !method || !VALID_METHODS.includes(method as RequestStatus) || !pocId) {
            return NextResponse.json(
                { success: false, message: 'Missing or invalid required fields.' },
                { status: 400 }
            )
        }

        if (method === 'rejected' && !pocNote?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: pocNote. A note is required when rejecting a request.' },
                { status: 400 }
            )
        }

        const poc = await getPOCById(pocId)
        if (!poc) {
            return NextResponse.json({ success: false, message: 'POC not found.' }, { status: 404 })
        }

        const request = await getRequestById(requestId)
        if (request.status !== 'pending') {
            return NextResponse.json({ success: false, message: `Request is already ${request.status}.` }, { status: 409 })
        }

        // Apply status update in DB
        await modifyRequest({
            requestId,
            status: method as RequestStatus,
            pocNote: (pocNote || "").trim(),
            pocId,
        })

        // Background processing for email and audit (doing synchronously for now)
        try {
            const supabase = (await import('@/lib/supabase/server')).createAdminClient()
            const { data: student } = await supabase
                .from('students')
                .select('id, name, email')
                .eq('id', request.student)
                .single()

            if (student) {
                const safePocNote = (pocNote || "").trim()
                const template = method === 'approved'
                    ? requestApprovedStudentEmail({ name: student.name, pocNote: safePocNote })
                    : requestRejectedStudentEmail({ name: student.name, pocNote: safePocNote })

                await sendMail({ to: student.email, template })
            }

            await logAuditTrail(
                request.student,
                method === 'approved' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                { requestId, pocId, pocNote: (pocNote || "").trim(), status: method }
            )
        } catch (err: any) {
            console.error('[modify request] [Sync Processing] Failure:', err)
            try {
                await logAuditTrail(request.student, 'MODIFY_REQUEST_EMAIL_FAILED', { 
                    requestId, 
                    error: err.message 
                })
            } catch (auditErr) {
                console.error('[modify request] [Sync Processing] Logging failure:', auditErr)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Request ${method} successfully.`,
            requestId,
            method,
        })

    } catch (err: any) {
        console.error('[POST /api/duperset/verifications/modify]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/verifications/modify endpoint running' })
}