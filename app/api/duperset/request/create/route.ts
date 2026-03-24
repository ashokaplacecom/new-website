import { NextRequest, NextResponse } from 'next/server'
import { getStudentByEmail, decrementEmergencies } from '@/lib/supabase/db/students'
import { hasPendingRequest, createRequest } from '@/lib/supabase/db/requests'
import { getPOCByStudentId } from '@/lib/supabase/db/pocs'
import { sendMail } from '@/app/api/_lib/mailer'
import { requestStudentEmail } from '@/content/emails/templates/student_request'
import { requestStudentEmergencyEmail } from '@/content/emails/templates/student_request_emergency'
import { requestPOCEmail } from '@/content/emails/templates/poc_request'
import { requestPOCEmergencyEmail } from '@/content/emails/templates/poc_request_emergency'

const PORTAL_LINK = process.env.PORTAL_LINK ?? 'https://your-portal-url.com'

function formatDeadline(date: Date): string {
    return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export async function POST(req: NextRequest) {
    try {
        let body: { email?: string; message?: string; isEmergency?: boolean }
        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            )
        }

        const email = body.email?.trim()
        const studentMessage = body.message?.trim() ?? ''
        const isEmergency = body.isEmergency === true  // strict boolean check

        // Input validation
        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: email.' },
                { status: 400 }
            )
        }

        // Fetch student
        const student = await getStudentByEmail(email)
        if (!student) {
            return NextResponse.json(
                { success: false, message: 'Email not found in our database. Please contact admin.' },
                { status: 404 }
            )
        }

        // Check for existing pending request
        const pending = await hasPendingRequest(student.id)
        if (pending) {
            return NextResponse.json(
                { success: false, message: 'You already have a pending request. Please wait for it to be reviewed.' },
                { status: 409 }
            )
        }

        // Emergency-specific: check remaining count
        if (isEmergency) {
            if (student.emergencies_remaining <= 0) {
                // Still send a denial email so student is informed
                await sendMail({
                    to: email,
                    template: {
                        subject: 'Emergency Request Denied',
                        html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e1e1;border-radius:5px;">
                <h2 style="color:#d32f2f;text-align:center;">Emergency Request Denied</h2>
                <p style="font-size:16px;color:#2c3e50;">Hello ${student.name},</p>
                <p style="font-size:16px;color:#2c3e50;">
                  Unfortunately, your emergency request has been denied as you have no remaining emergency requests for this semester.
                  Please raise a standard request instead.
                </p>
                <p style="font-size:14px;color:#7f8c8d;">Best regards,<br>PlaceCom</p>
              </div>
            `,
                    },
                })
                return NextResponse.json(
                    { success: false, message: 'No emergency requests remaining this semester.' },
                    { status: 403 }
                )
            }

            // Decrement emergency count
            await decrementEmergencies(student.id)
        }

        // Calculate deadline
        const deadlineHours = isEmergency ? 24 : 48
        const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000)
        const deadlineStr = formatDeadline(deadline)

        // Create the request row
        const request = await createRequest({
            studentId: student.id,
            studentMessage,
            isEmergency,
            deadline,
        })

        // Fetch POC details
        const poc = await getPOCByStudentId(student.id)
        if (!poc) {
            // Request created but POC not found — log and continue, don't fail the request
            console.error(`[create request] POC not found for student ${student.id}`)
        }

        // Send email to student
        const studentTemplate = isEmergency
            ? requestStudentEmergencyEmail({
                name: student.name,
                message: studentMessage,
                emergenciesRemaining: student.emergencies_remaining - 1,
            })
            : requestStudentEmail({
                name: student.name,
                message: studentMessage,
            })

        await sendMail({ to: email, template: studentTemplate })

        // Send email to POC (only if found)
        if (poc) {
            const pocTemplate = isEmergency
                ? requestPOCEmergencyEmail({
                    pocName: poc.poc_name,
                    studentName: student.name,
                    studentEmail: email,
                    studentMessage,
                    portalLink: PORTAL_LINK,
                    deadlineStr,
                })
                : requestPOCEmail({
                    pocName: poc.poc_name,
                    studentName: student.name,
                    studentEmail: email,
                    studentMessage,
                    portalLink: PORTAL_LINK,
                    deadlineStr,
                })

            await sendMail({ to: poc.email, template: pocTemplate })
        }

        return NextResponse.json({
            success: true,
            message: isEmergency
                ? 'Emergency request submitted. Your POC has been notified and has 24 hours to respond.'
                : 'Request submitted. Your POC has been notified and has 48 hours to respond.',
            requestId: request.id,
        })

    } catch (err: any) {
        console.error('[POST /api/duperset/request/create]', err)
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ success: true, message: '/api/duperset/request/create endpoint running' })
}