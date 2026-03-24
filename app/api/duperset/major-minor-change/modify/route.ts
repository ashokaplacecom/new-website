import { NextRequest, NextResponse } from 'next/server'
import { getMajorMinorRequestById, modifyMajorMinorRequest } from '@/lib/supabase/db/major_minor_requests'
import { RequestStatus } from '@/lib/supabase/db/requests'
import { getStudentById } from '@/lib/supabase/db/students'
import { getPOCById } from '@/lib/supabase/db/pocs'
import { sendMail } from '@/app/api/_lib/mailer'
import { majorMinorApprovedStudentEmail } from '@/content/emails/templates/major_minor_approved_student'
import { majorMinorRejectedStudentEmail } from '@/content/emails/templates/major_minor_rejected_student'
import { logAuditTrail } from '@/lib/supabase/db/audit'

const VALID_METHODS: RequestStatus[] = ['approved', 'rejected']

export async function POST(req: NextRequest) {
    try {
        let body: {
            requestId?: number
            method?: string       // 'approved' | 'rejected'
            pocNote?: string      
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

        if (!pocNote?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: pocNote. A note is required when approving or rejecting a request.' },
                { status: 400 }
            )
        }

        // Verify POC exists and is leadership. Only leadership roles modify major/minor changes
        const poc = await getPOCById(pocId)
        if (!poc) {
            return NextResponse.json(
                { success: false, message: 'POC not found.' },
                { status: 404 }
            )
        }

        // Fetch the request
        const request = await getMajorMinorRequestById(requestId)

        // Check it's still pending
        if (request.status !== 'pending') {
            return NextResponse.json(
                { success: false, message: `Request has already been ${request.status}. Cannot modify a closed request.` },
                { status: 409 }
            )
        }

        // Apply the status update
        await modifyMajorMinorRequest({
            requestId,
            status: method as RequestStatus,
            pocNote: pocNote.trim(),
            pocId,
        })

        // Fetch student details for the email
        const student = await getStudentById(request.student)

        // Send email to student
        if (student) {
            const template = method === 'approved'
                ? majorMinorApprovedStudentEmail({ name: student.name, pocNote: pocNote.trim() })
                : majorMinorRejectedStudentEmail({ name: student.name, pocNote: pocNote.trim() })

            await sendMail({ to: student.email, template })
        }

        // Log audit trail
        try {
            await logAuditTrail(
                request.student, // User who this request belongs to
                method === 'approved' ? 'MAJOR_MINOR_REQUEST_APPROVED' : 'MAJOR_MINOR_REQUEST_REJECTED',
                {
                    requestId,
                    pocId,
                    pocNote: pocNote.trim(),
                    status: method
                }
            )
        } catch (auditErr) {
            console.error('[POST /api/duperset/major-minor-change/modify] Failed to log audit trail:', auditErr)
        }

        return NextResponse.json({
            success: true,
            message: `Major/Minor Change Request ${method} successfully.`,
            requestId,
            method,
        })

    } catch (err: any) {
        console.error('[POST /api/duperset/major-minor-change/modify]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/major-minor-change/modify endpoint running' })
}
