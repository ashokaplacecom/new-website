import { NextRequest, NextResponse } from 'next/server'
import { getRequestById, modifyRequest, RequestStatus } from '@/lib/supabase/db/requests'
import { getStudentByEmail } from '@/lib/supabase/db/students'
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
            pocNote?: string      // COMPULSORY — remove the validation below if this becomes optional
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
        if (!requestId) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: requestId.' },
                { status: 400 }
            )
        }
        if (!method || !VALID_METHODS.includes(method as RequestStatus)) {
            return NextResponse.json(
                { success: false, message: `Missing or invalid field: method. Must be one of: ${VALID_METHODS.join(', ')}.` },
                { status: 400 }
            )
        }
        if (!pocId) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: pocId.' },
                { status: 400 }
            )
        }

        // poc_note is compulsory — remove this block if poc_note becomes optional in future
        if (!pocNote?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: pocNote. A note is required when approving or rejecting a request.' },
                { status: 400 }
            )
        }

        // Verify POC exists
        const poc = await getPOCById(pocId)
        if (!poc) {
            return NextResponse.json(
                { success: false, message: 'POC not found.' },
                { status: 404 }
            )
        }

        // Fetch the request
        const request = await getRequestById(requestId)

        // Check it's still pending
        if (request.status !== 'pending') {
            return NextResponse.json(
                { success: false, message: `Request has already been ${request.status}. Cannot modify a closed request.` },
                { status: 409 }
            )
        }

        // Apply the status update
        await modifyRequest({
            requestId,
            status: method as RequestStatus,
            pocNote: pocNote.trim(),
            pocId,
        })

        // Fetch student details for the email
        const supabase = (await import('@/lib/supabase/server')).createAdminClient()
        const { data: student } = await supabase
            .from('students')
            .select('id, name, email')
            .eq('id', request.student)
            .single()

        // Send email to student
        if (student) {
            const template = method === 'approved'
                ? requestApprovedStudentEmail({ name: student.name, pocNote: pocNote.trim() })
                : requestRejectedStudentEmail({ name: student.name, pocNote: pocNote.trim() })

            await sendMail({ to: student.email, template })
        }

        // Log audit trail
        try {
            await logAuditTrail(
                request.student, // User who this request belongs to
                method === 'approved' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                {
                    requestId,
                    pocId,
                    pocNote: pocNote.trim(),
                    status: method
                }
            )
        } catch (auditErr) {
            console.error('[POST /api/duperset/request/modify] Failed to log audit trail:', auditErr)
        }

        return NextResponse.json({
            success: true,
            message: `Request ${method} successfully.`,
            requestId,
            method,
        })

    } catch (err: any) {
        console.error('[POST /api/duperset/request/modify]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/request/modify endpoint running' })
}