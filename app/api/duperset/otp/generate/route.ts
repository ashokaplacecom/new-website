import { after, NextRequest, NextResponse } from 'next/server'
import { getStudentByEmail, setStudentOTP } from '@/lib/supabase/db/students'
import { hasPendingRequest } from '@/lib/supabase/db/requests'
import { logAuditTrail } from '@/lib/supabase/db/audit'
import { sendMail } from '@/app/api/_lib/mailer'
import { otpEmail } from '@/content/emails/templates/otp_email'
import { withCors, handlePreflight } from '@/app/api/_lib/cors'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json()
        } catch (err) {
            return withCors(req, NextResponse.json(
                { success: false, message: 'Invalid JSON body.' },
                { status: 400 }
            ))
        }
        const email = body.email?.trim()
        const ALLOWED_EMAIL = "soham.tulsyan_ug2023@ashoka.edu.in"

        // Input validation
        // if (!email || email !== ALLOWED_EMAIL) {
        //     return withCors(req, NextResponse.json(
        //         { success: false, message: 'Missing required field: email.' },
        //         { status: 400 }
        //     ))
        // }

        // Check student exists
        const student = await getStudentByEmail(email)

        if (!student) {
            return withCors(req, NextResponse.json(
                { success: false, message: 'Email not found in our database. Please contact admin.' },
                { status: 404 }
            ))
        }

        // Check for existing pending request
        const pending = await hasPendingRequest(student.id)
        if (pending) {
            return withCors(req, NextResponse.json(
                { success: false, message: 'You already have a pending request. Please wait for it to be reviewed.' },
                { status: 409 }
            ))
        }

        // Generate and store OTP
        const otp = generateOTP()
        await setStudentOTP(student.id, otp)

        // Use the new Next.js after() API to handle the slow email process in the background.
        // This ensures the user gets a fast response while the system still tracks the result.
        after(async () => {
            try {
                console.log(`[POST /api/duperset/otp/generate] [Background] Sending OTP email to ${email}...`)
                const mailResult = await sendMail({
                    to: email,
                    template: otpEmail({ name: student.name, otp }),
                })
                console.log(`[POST /api/duperset/otp/generate] [Background] Mail sent:`, mailResult)

                await logAuditTrail(student.id, 'OTP_GENERATED', { email })
            } catch (err: any) {
                console.error('[POST /api/duperset/otp/generate] [Background] Failed to send email or log audit:', err)
                // Log failure to audit trail so we "know" it failed
                try {
                    await logAuditTrail(student.id, 'OTP_SEND_FAILED', { email, error: err.message })
                } catch (auditErr) {
                    console.error('[POST /api/duperset/otp/generate] [Background] Double failure:', auditErr)
                }
            }
        })

        return withCors(req, NextResponse.json({
            success: true,
            message: 'OTP sent successfully. Please check your inbox (it may take a few seconds).'
        }))

    } catch (err: any) {
        console.error('[POST /api/duperset/otp/generate]', err)
        return withCors(req, NextResponse.json(
            { success: false, message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        ))
    }
}

export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req) ?? new NextResponse(null, { status: 405 })
}

export async function GET(req: NextRequest) {
    return withCors(req, NextResponse.json({ success: true, message: '/api/duperset/otp/generate Endpoint Running' }))
}