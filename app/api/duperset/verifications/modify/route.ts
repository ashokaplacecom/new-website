export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { getRequestById, modifyRequest, RequestStatus } from '@/lib/supabase/db/requests'
import { getPOCById } from '@/lib/supabase/db/pocs'
import { getStudentById } from '@/lib/supabase/db/students'
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
        if (!request) {
            return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 })
        }
        if (request.status !== 'pending') {
            return NextResponse.json({ success: false, message: `Request is already ${request.status}.` }, { status: 409 })
        }

        const student = await getStudentById(request.student || 0)
        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 })
        }

        if (poc.role !== 'leadership') {
            if (!student.poc || Number(student.poc) !== pocId) {
                return NextResponse.json({
                    success: false,
                    message: 'Forbidden. Standard POCs can only modify requests that list them as the POC.'
                }, { status: 403 })
            }
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

            if (student) {
                const safePocNote = (pocNote || "").trim()
                const template = method === 'approved'
                    ? requestApprovedStudentEmail({ name: student.name || '', pocNote: safePocNote })
                    : requestRejectedStudentEmail({ name: student.name || '', pocNote: safePocNote })

                await sendMail({ to: student.email || '', template })
            }

            await logAuditTrail(
                request.student || 0,
                method === 'approved' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                { requestId, pocId, pocNote: (pocNote || "").trim(), status: method }
            )
        } catch (err: any) {
            console.error('[modify request] [Sync Processing] Failure:', err)
            try {
                await logAuditTrail(request.student || 0, 'MODIFY_REQUEST_EMAIL_FAILED', { 
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
