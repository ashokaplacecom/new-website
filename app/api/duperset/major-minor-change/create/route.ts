import { NextRequest, NextResponse } from 'next/server'
import { getStudentById, decrementMajorMinorCount } from '@/lib/supabase/db/students'
import { hasPendingMajorMinorRequest, createMajorMinorRequest } from '@/lib/supabase/db/major_minor_requests'
import { getLeadershipPOCs } from '@/lib/supabase/db/pocs'
import { sendMail } from '@/app/api/_lib/mailer'
import { studentMajorMinorRequestEmail } from '@/content/emails/templates/student_major_minor_request'
import { pocMajorMinorRequestEmail } from '@/content/emails/templates/poc_major_minor_request'
import { logAuditTrail } from '@/lib/supabase/db/audit'

const PORTAL_LINK = process.env.PORTAL_LINK ?? 'https://your-portal-url.com'

export async function POST(req: NextRequest) {
    try {
        let body: {
            studentId?: number
            email?: string
            currentMajor?: string
            currentMinor?: string
            prospectiveMajor?: string
            prospectiveMinor?: string
        }
        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }

        const studentId = body.studentId
        const email = body.email?.trim()
        const currentMajor = body.currentMajor?.trim()
        const currentMinor = body.currentMinor?.trim()
        const prospectiveMajor = body.prospectiveMajor?.trim()
        const prospectiveMinor = body.prospectiveMinor?.trim()

        // Input validation
        if (!studentId || !email) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: studentId and email.' },
                { status: 400 }
            )
        }
        
        if (!currentMajor && !currentMinor && !prospectiveMajor && !prospectiveMinor) {
             return NextResponse.json(
                { success: false, message: 'At least one major or minor change parameter is required.' },
                { status: 400 }
            )
        }

        // Fetch student
        const student = await getStudentById(studentId)
        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Student ID not found in our database.' },
                { status: 404 }
            )
        }
        
        // Validate email matches the student record
        if (student.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json(
                { success: false, message: 'Email does not match the student record.' },
                { status: 403 }
            )
        }

        // Check for existing pending request (only 1 allowed at a time)
        const pending = await hasPendingMajorMinorRequest(student.id)
        if (pending) {
            return NextResponse.json(
                { success: false, message: 'You already have a pending major/minor change request. Please wait for it to be reviewed.' },
                { status: 409 }
            )
        }

        // Check remaining count
        if (student['major-minor-change-count'] <= 0) {
            return NextResponse.json(
                { success: false, message: 'You have reached the maximum allowed number of major/minor changes.' },
                { status: 403 }
            )
        }

        // Create the request row
        const request = await createMajorMinorRequest({
            studentId: student.id,
            currentMajor,
            currentMinor,
            prospectiveMajor,
            prospectiveMinor,
        })

        // Decrement change count only after the request is successfully created
        await decrementMajorMinorCount(student.id)

        // Log audit trail immediately after success in DB, before slow mailer calls
        try {
            await logAuditTrail(
                student.id,
                'MAJOR_MINOR_REQUEST_GENERATED',
                { requestId: request.id, email: student.email, currentMajor, currentMinor, prospectiveMajor, prospectiveMinor }
            )
        } catch (auditErr) {
            console.error('[POST /api/duperset/major-minor-change/create] Failed to log audit trail:', auditErr)
        }

        // Fetch Leadership POCs
        const leadershipPOCs = await getLeadershipPOCs()

        // Send confirmation email to student
        const studentTemplate = studentMajorMinorRequestEmail({
            name: student.name,
            currentMajor,
            currentMinor,
            prospectiveMajor,
            prospectiveMinor,
        })
        await sendMail({ to: student.email, template: studentTemplate })

        // Send email to all leadership POCs
        if (leadershipPOCs.length > 0) {
            const pocTemplate = pocMajorMinorRequestEmail({
                pocName: 'Leadership Team', // generic greeting
                studentName: student.name,
                studentEmail: student.email,
                currentMajor,
                currentMinor,
                prospectiveMajor,
                prospectiveMinor,
                portalLink: PORTAL_LINK,
            })
            
            // Send to each leadership POC
            await Promise.all(
                leadershipPOCs.map(poc => 
                    sendMail({ to: poc.email, template: pocTemplate }).catch(e => {
                        console.error(`Failed to send email to leadership POC ${poc.email}:`, e)
                    })
                )
            )
        } else {
             console.error(`[POST /api/duperset/major-minor-change/create] No leadership POCs found! Emails to leadership not sent.`)
        }

        return NextResponse.json({
            success: true,
            message: 'Major/Minor change request submitted successfully.',
            requestId: request.id,
        })

    } catch (err: any) {
        console.error('[POST /api/duperset/major-minor-change/create]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/major-minor-change/create endpoint running' })
}
